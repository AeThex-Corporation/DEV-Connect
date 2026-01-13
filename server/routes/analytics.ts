import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  PlatformAnalytics,
  DashboardMetrics,
  AnalyticsFilters,
  RevenueMetrics,
  UserAnalytics,
  JobAnalytics,
  ProjectAnalytics,
} from "@shared/analytics";

// GET /api/analytics/dashboard - Get dashboard metrics
export const getDashboardMetrics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

  // Revenue metrics
  const { data: invoices } = await supabase
    .from("invoices")
    .select("total, status, created_at")
    .eq("status", "paid");

  const revenueToday = invoices
    ?.filter((i) => i.created_at.startsWith(today))
    .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

  const revenueThisMonth = invoices
    ?.filter((i) => i.created_at >= thisMonthStart)
    .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

  const revenueLastMonth = invoices
    ?.filter((i) => i.created_at >= lastMonthStart && i.created_at < thisMonthStart)
    .reduce((sum, i) => sum + (i.total || 0), 0) || 0;

  const revenueGrowth = revenueLastMonth > 0
    ? ((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100
    : 0;

  // User metrics
  const { count: usersToday } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today);

  const { count: usersThisMonth } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thisMonthStart);

  const { count: usersLastMonth } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .gte("created_at", lastMonthStart)
    .lt("created_at", thisMonthStart);

  const userGrowth = (usersLastMonth || 0) > 0
    ? (((usersThisMonth || 0) - (usersLastMonth || 0)) / (usersLastMonth || 1)) * 100
    : 0;

  // Job metrics
  const { count: jobsToday } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today);

  const { count: jobsThisMonth } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", thisMonthStart);

  const { count: jobsLastMonth } = await supabase
    .from("jobs")
    .select("id", { count: "exact", head: true })
    .gte("created_at", lastMonthStart)
    .lt("created_at", thisMonthStart);

  const jobGrowth = (jobsLastMonth || 0) > 0
    ? (((jobsThisMonth || 0) - (jobsLastMonth || 0)) / (jobsLastMonth || 1)) * 100
    : 0;

  // Conversion metrics
  const { count: totalApplications } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true });

  const { count: acceptedApplications } = await supabase
    .from("applications")
    .select("id", { count: "exact", head: true })
    .eq("status", "accepted");

  const conversionRate = (totalApplications || 0) > 0
    ? ((acceptedApplications || 0) / (totalApplications || 1)) * 100
    : 0;

  // Average project value
  const { data: projects } = await supabase
    .from("projects")
    .select("budget");

  const avgProjectValue = projects && projects.length > 0
    ? projects.reduce((sum, p) => sum + ((p.budget as any)?.amount || 0), 0) / projects.length
    : 0;

  const metrics: DashboardMetrics = {
    revenue_today: revenueToday,
    revenue_this_month: revenueThisMonth,
    revenue_growth: revenueGrowth,
    users_today: usersToday || 0,
    users_this_month: usersThisMonth || 0,
    user_growth: userGrowth,
    jobs_today: jobsToday || 0,
    jobs_this_month: jobsThisMonth || 0,
    job_growth: jobGrowth,
    conversion_rate: conversionRate,
    avg_project_value: avgProjectValue,
  };

  res.json(metrics);
};

// GET /api/analytics/revenue - Get revenue analytics
export const getRevenueAnalytics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    start_date,
    end_date,
    granularity = "month",
  } = req.query as Partial<AnalyticsFilters>;

  const supabase = getSupabase();
  let query = supabase
    .from("invoices")
    .select("total, status, created_at, line_items")
    .eq("status", "paid");

  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: invoices } = await query;

  const totalRevenue = invoices?.reduce((sum, i) => sum + (i.total || 0), 0) || 0;
  const periodRevenue = totalRevenue; // Same for now without previous period comparison

  // Revenue by source (from line items)
  const sourceMap = new Map<string, number>();
  invoices?.forEach((invoice) => {
    const items = invoice.line_items as any[] || [];
    items.forEach((item) => {
      const source = item.type || "other";
      sourceMap.set(source, (sourceMap.get(source) || 0) + (item.amount || 0));
    });
  });

  const revenueBySource = Array.from(sourceMap.entries()).map(([source, amount]) => ({
    source,
    amount,
    percentage: totalRevenue > 0 ? (amount / totalRevenue) * 100 : 0,
  }));

  // Revenue by period
  const periodMap = new Map<string, number>();
  invoices?.forEach((invoice) => {
    const date = new Date(invoice.created_at);
    let period: string;
    
    if (granularity === "day") {
      period = date.toISOString().split("T")[0];
    } else if (granularity === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      period = weekStart.toISOString().split("T")[0];
    } else if (granularity === "month") {
      period = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    } else {
      period = String(date.getFullYear());
    }

    periodMap.set(period, (periodMap.get(period) || 0) + (invoice.total || 0));
  });

  const revenueByPeriod = Array.from(periodMap.entries())
    .map(([period, amount]) => ({ period, amount }))
    .sort((a, b) => a.period.localeCompare(b.period));

  const metrics: RevenueMetrics = {
    total_revenue: totalRevenue,
    period_revenue: periodRevenue,
    currency: "USD",
    growth_rate: 0, // TODO: Calculate from previous period
    revenue_by_source: revenueBySource,
    revenue_by_period: revenueByPeriod,
  };

  res.json(metrics);
};

// GET /api/analytics/users - Get user analytics
export const getUserAnalytics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { start_date, end_date } = req.query as Partial<AnalyticsFilters>;
  const supabase = getSupabase();

  let query = supabase.from("profiles").select("id, role, created_at");
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: users, count: totalUsers } = await query;

  // Active users (logged in within last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const { count: activeUsers } = await supabase
    .from("presence")
    .select("id", { count: "exact", head: true })
    .gte("updated_at", thirtyDaysAgo.toISOString());

  // New users (created within period)
  const newUsers = users?.length || 0;

  // Users by role
  const roleMap = new Map<string, number>();
  users?.forEach((user) => {
    const role = user.role || "unknown";
    roleMap.set(role, (roleMap.get(role) || 0) + 1);
  });

  const userByRole = Array.from(roleMap.entries()).map(([role, count]) => ({
    role,
    count,
    percentage: (totalUsers || 0) > 0 ? (count / (totalUsers || 1)) * 100 : 0,
  }));

  const analytics: UserAnalytics = {
    total_users: totalUsers || 0,
    active_users: activeUsers || 0,
    new_users: newUsers,
    growth_rate: 0, // TODO: Calculate
    user_by_role: userByRole,
    retention_rate: 0, // TODO: Calculate
    churn_rate: 0, // TODO: Calculate
  };

  res.json(analytics);
};

// GET /api/analytics/jobs - Get job analytics
export const getJobAnalytics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { start_date, end_date } = req.query as Partial<AnalyticsFilters>;
  const supabase = getSupabase();

  let query = supabase.from("jobs").select("id, role, created_at");
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: jobs, count: totalJobs } = await query;

  // Active jobs (no status field, assuming all are active)
  const activeJobs = totalJobs || 0;

  // Applications
  const { data: applications, count: totalApplications } = await supabase
    .from("applications")
    .select("id, job_id, status");

  const avgApplicationsPerJob = (totalJobs || 0) > 0
    ? (totalApplications || 0) / (totalJobs || 1)
    : 0;

  // Jobs by category (role field)
  const categoryMap = new Map<string, number>();
  jobs?.forEach((job) => {
    const category = job.role || "other";
    categoryMap.set(category, (categoryMap.get(category) || 0) + 1);
  });

  const jobsByCategory = Array.from(categoryMap.entries()).map(([category, count]) => ({
    category,
    count,
    percentage: (totalJobs || 0) > 0 ? (count / (totalJobs || 1)) * 100 : 0,
  }));

  // Success rate (accepted applications)
  const acceptedCount = applications?.filter((a) => a.status === "accepted").length || 0;
  const successRate = (totalApplications || 0) > 0
    ? (acceptedCount / (totalApplications || 1)) * 100
    : 0;

  const analytics: JobAnalytics = {
    total_jobs: totalJobs || 0,
    active_jobs: activeJobs,
    completed_jobs: 0, // TODO: Add status field
    total_applications: totalApplications || 0,
    avg_applications_per_job: avgApplicationsPerJob,
    jobs_by_category: jobsByCategory,
    success_rate: successRate,
  };

  res.json(analytics);
};

// GET /api/analytics/projects - Get project analytics
export const getProjectAnalytics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { start_date, end_date } = req.query as Partial<AnalyticsFilters>;
  const supabase = getSupabase();

  let query = supabase.from("projects").select("id, status, timeline, budget, created_at");
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: projects, count: totalProjects } = await query;

  const activeProjects = projects?.filter((p) => p.status === "active").length || 0;
  const completedProjects = projects?.filter((p) => p.status === "completed").length || 0;

  // Average completion time
  const completedWithTimeline = projects?.filter(
    (p) => p.status === "completed" && (p.timeline as any)?.end_date
  );
  const avgCompletionTime = completedWithTimeline && completedWithTimeline.length > 0
    ? completedWithTimeline.reduce((sum, p) => {
        const timeline = p.timeline as any;
        const start = new Date(timeline.start_date).getTime();
        const end = new Date(timeline.end_date).getTime();
        const days = (end - start) / (1000 * 60 * 60 * 24);
        return sum + days;
      }, 0) / completedWithTimeline.length
    : 0;

  // On-time percentage
  const onTimeCount = completedWithTimeline?.filter((p) => {
    const timeline = p.timeline as any;
    return timeline.actual_hours <= timeline.estimated_hours;
  }).length || 0;
  const onTimePercentage = completedWithTimeline && completedWithTimeline.length > 0
    ? (onTimeCount / completedWithTimeline.length) * 100
    : 0;

  // Budget accuracy
  const projectsWithBudget = projects?.filter((p) => (p.budget as any)?.amount);
  const budgetAccuracy = projectsWithBudget && projectsWithBudget.length > 0
    ? projectsWithBudget.reduce((sum, p) => sum + 100, 0) / projectsWithBudget.length
    : 0;

  // Projects by status
  const statusMap = new Map<string, number>();
  projects?.forEach((project) => {
    const status = project.status || "unknown";
    statusMap.set(status, (statusMap.get(status) || 0) + 1);
  });

  const projectsByStatus = Array.from(statusMap.entries()).map(([status, count]) => ({
    status,
    count,
    percentage: (totalProjects || 0) > 0 ? (count / (totalProjects || 1)) * 100 : 0,
  }));

  const analytics: ProjectAnalytics = {
    total_projects: totalProjects || 0,
    active_projects: activeProjects,
    completed_projects: completedProjects,
    avg_completion_time: avgCompletionTime,
    on_time_percentage: onTimePercentage,
    budget_accuracy: budgetAccuracy,
    projects_by_status: projectsByStatus,
  };

  res.json(analytics);
};

// GET /api/analytics/platform - Get full platform analytics
export const getPlatformAnalytics: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const filters = req.query as Partial<AnalyticsFilters>;

  // Fetch all analytics in parallel
  const [revenue, users, jobs, projects] = await Promise.all([
    getRevenueData(filters),
    getUserData(filters),
    getJobData(filters),
    getProjectData(filters),
  ]);

  const analytics: PlatformAnalytics = {
    overview: {
      total_revenue: revenue.total_revenue,
      total_users: users.total_users,
      total_jobs: jobs.total_jobs,
      total_projects: projects.total_projects,
      active_users_today: users.active_users,
      growth_rate: revenue.growth_rate,
    },
    revenue,
    users,
    jobs,
    projects,
    period_start: filters.start_date || "",
    period_end: filters.end_date || "",
  };

  res.json(analytics);
};

// Helper functions
async function getRevenueData(filters: Partial<AnalyticsFilters>): Promise<RevenueMetrics> {
  // Simplified version - in production, call getRevenueAnalytics logic
  return {
    total_revenue: 0,
    period_revenue: 0,
    currency: "USD",
    growth_rate: 0,
    revenue_by_source: [],
    revenue_by_period: [],
  };
}

async function getUserData(filters: Partial<AnalyticsFilters>): Promise<UserAnalytics> {
  return {
    total_users: 0,
    active_users: 0,
    new_users: 0,
    growth_rate: 0,
    user_by_role: [],
    retention_rate: 0,
    churn_rate: 0,
  };
}

async function getJobData(filters: Partial<AnalyticsFilters>): Promise<JobAnalytics> {
  return {
    total_jobs: 0,
    active_jobs: 0,
    completed_jobs: 0,
    total_applications: 0,
    avg_applications_per_job: 0,
    jobs_by_category: [],
    success_rate: 0,
  };
}

async function getProjectData(filters: Partial<AnalyticsFilters>): Promise<ProjectAnalytics> {
  return {
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    avg_completion_time: 0,
    on_time_percentage: 0,
    budget_accuracy: 0,
    projects_by_status: [],
  };
}
