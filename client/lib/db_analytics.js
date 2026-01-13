import { supabase } from './customSupabaseClient';

// --- Analytics & Charts ---

export const getPlatformStats = async () => {
  const { count: totalUsers } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
  const { count: totalJobs } = await supabase.from('jobs').select('*', { count: 'exact', head: true });
  const { count: activeContractors } = await supabase.from('contractors').select('*', { count: 'exact', head: true }).eq('status', 'approved');
  
  const { data: invoices } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('status', 'paid');
    
  const totalRevenue = invoices?.reduce((sum, inv) => sum + (Number(inv.total_amount) || 0), 0) || 0;

  return {
    totalUsers: totalUsers || 0,
    totalJobs: totalJobs || 0,
    activeContractors: activeContractors || 0,
    totalRevenue,
  };
};

export const getDailyStats = async (days = 7) => {
  const { data, error } = await supabase
    .from('analytics_daily_stats')
    .select('*')
    .order('date', { ascending: true })
    .limit(days);
    
  if (error) {
    console.error("Error fetching daily stats:", error);
    return [];
  }
  
  if (!data || data.length === 0) return [];

  return data.map(day => ({
    name: new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' }),
    date: day.date,
    users: day.signups || 0,
    jobs: day.jobs_posted || 0,
    revenue: 0 
  }));
};

// --- User Specific Analytics (Contractors/Businesses) ---

export const getUserAnalytics = async (userId) => {
  const { data: contractorData } = await supabase
    .from('contractors')
    .select('id')
    .eq('user_id', userId)
    .single();

  let earnings = [];
  let jobsCompleted = 0;
  let avgRating = 0;

  if (contractorData) {
    const { data: invoices } = await supabase
      .from('invoices')
      .select('total_amount, created_at')
      .eq('contractor_id', contractorData.id)
      .eq('status', 'paid');

    earnings = invoices || [];

    const { count } = await supabase
      .from('project_history')
      .select('*', { count: 'exact', head: true })
      .eq('developer_id', userId)
      .not('completed_at', 'is', null);
      
    jobsCompleted = count || 0;

    const { data: ratings } = await supabase
        .from('ratings_reviews')
        .select('rating')
        .eq('contractor_id', contractorData.id);

    if (ratings && ratings.length > 0) {
        const sum = ratings.reduce((acc, curr) => acc + curr.rating, 0);
        avgRating = (sum / ratings.length).toFixed(1);
    }
  }

  return {
    earnings,
    jobsCompleted,
    avgRating
  };
};

// --- Verification & Contractors ---

export const getPendingContractors = async () => {
  const { data, error } = await supabase
    .from('contractors')
    .select(`
      *,
      profiles:user_id (
        display_name,
        username,
        avatar_url,
        email
      ),
      verification_responses (*)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const reviewContractor = async (contractorId, status) => {
  const { error } = await supabase
    .from('contractors')
    .update({ status })
    .eq('id', contractorId);
    
  if (error) throw error;
};

// --- Job Management ---

export const getJobsForModeration = async () => {
  const { data, error } = await supabase
    .from('jobs')
    .select(`
      *,
      profiles:created_by (username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false })
    .limit(50); 
    
  if (error) throw error;
  return data;
};

export const createAdminJob = async (jobData) => {
  const { data, error } = await supabase
    .from('jobs')
    .insert([jobData])
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

export const updateJobStatus = async (jobId, status) => {
  const { data, error } = await supabase
    .from('jobs')
    .update({ status })
    .eq('id', jobId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// --- User Management ---

export const getUsers = async (limit = 20, search = '') => {
  let query = supabase
    .from('profiles')
    .select('*, user_roles(role)', { count: 'exact' });

  if (search) {
    query = query.or(`username.ilike.%${search}%,display_name.ilike.%${search}%,email.ilike.%${search}%`);
  }
  
  const { data, count, error } = await query
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return { users: data, total: count };
};

export const updateUserRole = async (userId, role) => {
  const { data: existing } = await supabase
    .from('user_roles')
    .select('*')
    .eq('user_id', userId)
    .eq('role', role)
    .single();

  if (existing) return;

  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role });
    
  if (error) throw error;
};

export const updateUserStatus = async (userId, updates) => {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
    
  if (error) throw error;
  return data;
};

// --- Reports & Settings ---

export const getRecentReports = async () => {
  const { data, error } = await supabase
    .from('reports')
    .select(`
      *,
      reporter:reporter_id (username)
    `)
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const getSystemSettings = async () => {
  const { data, error } = await supabase
    .from('admin_settings')
    .select('*');
    
  if (error) throw error;
  
  const settings = {};
  data?.forEach(item => {
    settings[item.setting_key] = item.setting_value;
  });
  return settings;
};

export const updateSystemSetting = async (key, value) => {
  const { error } = await supabase
    .from('admin_settings')
    .upsert({ setting_key: key, setting_value: value, updated_at: new Date() });
    
  if (error) throw error;
};

// --- Disputes ---

export const getDisputes = async () => {
  // Explicitly use the foreign key constraint names to avoid ambiguity
  const { data, error } = await supabase
    .from('disputes')
    .select(`
      *,
      job:job_id (title),
      initiator:profiles!disputes_initiator_id_fkey (username, display_name, avatar_url),
      respondent:profiles!disputes_respondent_id_fkey (username, display_name, avatar_url)
    `)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const resolveDispute = async (disputeId, status, notes) => {
  const { data, error } = await supabase
    .from('disputes')
    .update({ status: status, resolution_notes: notes })
    .eq('id', disputeId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Generated Reports (User Facing) ---

export const getUserReports = async (userId) => {
  const { data, error } = await supabase
    .from('generated_reports')
    .select('*')
    .eq('user_id', userId)
    .order('generated_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const generateReport = async (userId, type, period) => {
  // Mock data generation for now
  const mockData = { 
    summary: "Generated report data placeholder",
    type,
    period,
    generated: new Date().toISOString()
  };
  
  const { data, error } = await supabase
    .from('generated_reports')
    .insert({
      user_id: userId,
      report_type: type,
      period: period,
      data_json: mockData,
      generated_at: new Date()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};