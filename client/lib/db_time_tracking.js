import { supabase } from './customSupabaseClient';

// --- Time Tracking ---

export const startTimeEntry = async (contractorId, jobId, notes = '') => {
  // Stop any currently active timer first
  const { error: stopError } = await supabase
    .from('time_entries')
    .update({ 
        status: 'completed', 
        end_time: new Date().toISOString(),
        duration_minutes: 0 // Will be calculated properly via triggers or application logic ideally, but simplistic here for now
    })
    .eq('contractor_id', contractorId)
    .eq('status', 'active');

  if (stopError) console.error("Error stopping previous timer:", stopError);

  const { data, error } = await supabase
    .from('time_entries')
    .insert({
      contractor_id: contractorId,
      job_id: jobId,
      start_time: new Date().toISOString(),
      status: 'active',
      notes
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const stopTimeEntry = async (entryId) => {
  const now = new Date();
  
  // Get the entry to calculate duration
  const { data: entry, error: fetchError } = await supabase
    .from('time_entries')
    .select('start_time')
    .eq('id', entryId)
    .single();
    
  if (fetchError) throw fetchError;
  
  const startTime = new Date(entry.start_time);
  const durationMinutes = Math.round((now - startTime) / 1000 / 60);

  const { data, error } = await supabase
    .from('time_entries')
    .update({
      end_time: now.toISOString(),
      status: 'completed',
      duration_minutes: durationMinutes
    })
    .eq('id', entryId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getActiveTimeEntry = async (contractorId) => {
  const { data, error } = await supabase
    .from('time_entries')
    .select(`
      *,
      jobs (
        title
      )
    `)
    .eq('contractor_id', contractorId)
    .eq('status', 'active')
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const getTimeEntries = async (contractorId, startDate, endDate) => {
  let query = supabase
    .from('time_entries')
    .select(`
      *,
      jobs (
        title,
        id
      )
    `)
    .eq('contractor_id', contractorId)
    .order('start_time', { ascending: false });

  if (startDate) query = query.gte('start_time', startDate);
  if (endDate) query = query.lte('start_time', endDate);

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const saveManualTimeEntry = async (contractorId, jobId, date, durationMinutes, notes) => {
    const startTime = new Date(date);
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);
    
    const { data, error } = await supabase
        .from('time_entries')
        .insert({
            contractor_id: contractorId,
            job_id: jobId,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
            duration_minutes: durationMinutes,
            status: 'completed',
            notes
        })
        .select()
        .single();
        
    if (error) throw error;
    return data;
};

// --- Hourly Rates ---

export const getHourlyRates = async (contractorId) => {
  const { data, error } = await supabase
    .from('hourly_rates')
    .select('*')
    .eq('contractor_id', contractorId)
    .maybeSingle();

  if (error) throw error;
  return data;
};

export const updateHourlyRates = async (contractorId, ratesData) => {
  // Upsert logic
  const { data, error } = await supabase
    .from('hourly_rates')
    .upsert({
      contractor_id: contractorId,
      ...ratesData,
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

// --- Invoicing ---

export const getInvoices = async (contractorId) => {
  const { data, error } = await supabase
    .from('invoices')
    .select(`
      *,
      profiles:business_id (display_name, email)
    `)
    .eq('contractor_id', contractorId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
};

export const createInvoice = async (invoiceData, lineItems) => {
  // 1. Create Invoice Header
  const { data: invoice, error: invError } = await supabase
    .from('invoices')
    .insert(invoiceData)
    .select()
    .single();

  if (invError) throw invError;

  // 2. Create Line Items
  if (lineItems && lineItems.length > 0) {
    const itemsWithId = lineItems.map(item => ({
      ...item,
      invoice_id: invoice.id
    }));

    const { error: itemsError } = await supabase
      .from('invoice_line_items')
      .insert(itemsWithId);

    if (itemsError) throw itemsError;
  }

  return invoice;
};

export const getInvoiceDetails = async (invoiceId) => {
    const { data, error } = await supabase
        .from('invoices')
        .select(`
            *,
            profiles:business_id (
                display_name,
                email,
                location
            ),
            invoice_line_items (*)
        `)
        .eq('id', invoiceId)
        .single();
        
    if (error) throw error;
    return data;
};