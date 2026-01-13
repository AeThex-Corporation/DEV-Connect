import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  Report,
  ReportCreate,
  ReportUpdate,
  ReportListResponse,
  GenerateReportRequest,
  GenerateReportResponse,
  RevenueReportData,
  UserReportData,
  JobReportData,
  ProjectReportData,
} from "@shared/reports";

// GET /api/reports - List user's reports
export const listReports: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { type, limit = 50, offset = 0 } = req.query;
  const supabase = getSupabase();

  let query = supabase
    .from("reports")
    .select("*", { count: "exact" })
    .eq("created_by", userId)
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (type) query = query.eq("type", type);

  const { data: reports, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const response: ReportListResponse = {
    reports: (reports || []) as Report[],
    total: count || 0,
  };

  res.json(response);
};

// GET /api/reports/:id - Get single report
export const getReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("reports")
    .select("*")
    .eq("id", id)
    .eq("created_by", userId)
    .single();

  if (error) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json(data as Report);
};

// POST /api/reports - Create report
export const createReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const report: ReportCreate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("reports")
    .insert({
      ...report,
      created_by: userId,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as Report);
};

// PUT /api/reports/:id - Update report
export const updateReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const update: ReportUpdate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("reports")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("created_by", userId)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as Report);
};

// DELETE /api/reports/:id - Delete report
export const deleteReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from("reports")
    .delete()
    .eq("id", id)
    .eq("created_by", userId);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// POST /api/reports/generate - Generate report
export const generateReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const request: GenerateReportRequest = req.body;
  const supabase = getSupabase();

  // Get report configuration
  const { data: report } = await supabase
    .from("reports")
    .select("*")
    .eq("id", request.report_id)
    .eq("created_by", userId)
    .single();

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  // Merge filters
  const filters = { ...report.filters, ...request.filters };
  const format = request.format || report.format;

  // Generate report data based on type
  let reportData: any;
  
  switch (report.type) {
    case "revenue":
      reportData = await generateRevenueReport(filters, supabase);
      break;
    case "users":
      reportData = await generateUserReport(filters, supabase);
      break;
    case "jobs":
      reportData = await generateJobReport(filters, supabase);
      break;
    case "projects":
      reportData = await generateProjectReport(filters, supabase);
      break;
    default:
      return res.status(400).json({ error: "Invalid report type" });
  }

  // In production, this would:
  // 1. Generate the file (PDF/CSV/Excel)
  // 2. Upload to storage (S3, Supabase Storage, etc.)
  // 3. Return a signed URL
  
  // For now, return the data directly
  const response: GenerateReportResponse = {
    report_id: request.report_id,
    download_url: `/api/reports/${request.report_id}/download`,
    expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    format,
    generated_at: new Date().toISOString(),
  };

  // Update last_generated timestamp
  await supabase
    .from("reports")
    .update({ last_generated: new Date().toISOString() })
    .eq("id", request.report_id);

  res.json({ ...response, data: reportData });
};

// GET /api/reports/:id/download - Download generated report
export const downloadReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  
  // In production, this would:
  // 1. Verify the report belongs to the user
  // 2. Generate/retrieve the file
  // 3. Stream it to the client with proper headers
  
  res.status(501).json({ error: "Download not implemented yet" });
};

// Helper functions to generate report data

async function generateRevenueReport(filters: any, supabase: any): Promise<RevenueReportData> {
  const { start_date, end_date } = filters;

  let query = supabase
    .from("invoices")
    .select("total, status, created_at, line_items, client_name")
    .eq("status", "paid");

  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: invoices } = await query;

  const totalRevenue = invoices?.reduce((sum: number, i: any) => sum + (i.total || 0), 0) || 0;

  // By source
  const sourceMap = new Map<string, { revenue: number; count: number }>();
  invoices?.forEach((invoice: any) => {
    const items = invoice.line_items || [];
    items.forEach((item: any) => {
      const source = item.type || "other";
      const existing = sourceMap.get(source) || { revenue: 0, count: 0 };
      existing.revenue += item.amount || 0;
      existing.count += 1;
      sourceMap.set(source, existing);
    });
  });

  const bySource = Array.from(sourceMap.entries()).map(([source, data]) => ({
    source,
    revenue: data.revenue,
    count: data.count,
  }));

  // By period (daily)
  const periodMap = new Map<string, { revenue: number; transactions: number }>();
  invoices?.forEach((invoice: any) => {
    const date = invoice.created_at.split("T")[0];
    const existing = periodMap.get(date) || { revenue: 0, transactions: 0 };
    existing.revenue += invoice.total || 0;
    existing.transactions += 1;
    periodMap.set(date, existing);
  });

  const byPeriod = Array.from(periodMap.entries())
    .map(([date, data]) => ({
      date,
      revenue: data.revenue,
      transactions: data.transactions,
    }))
    .sort((a, b) => a.date.localeCompare(b.date));

  // Top clients
  const clientMap = new Map<string, number>();
  invoices?.forEach((invoice: any) => {
    const client = invoice.client_name || "Unknown";
    clientMap.set(client, (clientMap.get(client) || 0) + (invoice.total || 0));
  });

  const topClients = Array.from(clientMap.entries())
    .map(([client_name, revenue]) => ({
      client_id: client_name,
      client_name,
      revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    summary: {
      total_revenue: totalRevenue,
      period_revenue: totalRevenue,
      currency: "USD",
      transactions_count: invoices?.length || 0,
    },
    by_source: bySource,
    by_period: byPeriod,
    top_clients: topClients,
  };
}

async function generateUserReport(filters: any, supabase: any): Promise<UserReportData> {
  const { start_date, end_date } = filters;

  let query = supabase.from("profiles").select("id, role, created_at");
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: users } = await query;

  // Active users (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: activeUsers } = await supabase
    .from("presence")
    .select("id", { count: "exact", head: true })
    .gte("updated_at", thirtyDaysAgo.toISOString());

  // By role
  const roleMap = new Map<string, number>();
  users?.forEach((user: any) => {
    const role = user.role || "unknown";
    roleMap.set(role, (roleMap.get(role) || 0) + 1);
  });

  const byRole = Array.from(roleMap.entries()).map(([role, count]) => ({
    role,
    count,
  }));

  // By signup date
  const dateMap = new Map<string, number>();
  users?.forEach((user: any) => {
    const date = user.created_at.split("T")[0];
    dateMap.set(date, (dateMap.get(date) || 0) + 1);
  });

  const bySignupDate = Array.from(dateMap.entries())
    .map(([date, signups]) => ({ date, signups }))
    .sort((a, b) => a.date.localeCompare(b.date));

  return {
    summary: {
      total_users: users?.length || 0,
      active_users: activeUsers || 0,
      new_users: users?.length || 0,
      retention_rate: 0,
    },
    by_role: byRole,
    by_signup_date: bySignupDate,
    top_contributors: [],
  };
}

async function generateJobReport(filters: any, supabase: any): Promise<JobReportData> {
  const { start_date, end_date } = filters;

  let query = supabase.from("jobs").select("id, role, created_at");
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: jobs } = await query;

  // Applications
  const { data: applications } = await supabase
    .from("applications")
    .select("id, job_id, status");

  // By category (role)
  const categoryMap = new Map<string, { count: number; applications: number }>();
  jobs?.forEach((job: any) => {
    const category = job.role || "other";
    const jobApplications = applications?.filter((a: any) => a.job_id === job.id).length || 0;
    const existing = categoryMap.get(category) || { count: 0, applications: 0 };
    existing.count += 1;
    existing.applications += jobApplications;
    categoryMap.set(category, existing);
  });

  const byCategory = Array.from(categoryMap.entries()).map(([category, data]) => ({
    category,
    count: data.count,
    avg_applications: data.count > 0 ? data.applications / data.count : 0,
  }));

  // By status (using application status as proxy)
  const statusMap = new Map<string, number>();
  applications?.forEach((app: any) => {
    const status = app.status || "pending";
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  return {
    summary: {
      total_jobs: jobs?.length || 0,
      active_jobs: jobs?.length || 0,
      completed_jobs: 0,
      total_applications: applications?.length || 0,
    },
    by_category: byCategory,
    by_status: byStatus,
    success_metrics: {
      filled_rate: 0,
      avg_time_to_fill: 0,
    },
  };
}

async function generateProjectReport(filters: any, supabase: any): Promise<ProjectReportData> {
  const { start_date, end_date } = filters;

  let query = supabase.from("projects").select("id, name, status, timeline, budget, created_at");
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: projects } = await query;

  const totalRevenue = projects?.reduce(
    (sum: number, p: any) => sum + ((p.budget as any)?.amount || 0),
    0
  ) || 0;

  // By status
  const statusMap = new Map<string, number>();
  projects?.forEach((project: any) => {
    const status = project.status || "unknown";
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const byStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
  }));

  // Top projects by revenue
  const topProjects = projects
    ?.map((p: any) => ({
      project_id: p.id,
      project_name: p.name,
      revenue: (p.budget as any)?.amount || 0,
    }))
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    summary: {
      total_projects: projects?.length || 0,
      active_projects: projects?.filter((p: any) => p.status === "active").length || 0,
      completed_projects: projects?.filter((p: any) => p.status === "completed").length || 0,
      total_revenue: totalRevenue,
    },
    by_status: byStatus,
    performance: {
      on_time_delivery: 0,
      budget_accuracy: 0,
      avg_project_duration: 0,
    },
    top_projects: topProjects || [],
  };
}
