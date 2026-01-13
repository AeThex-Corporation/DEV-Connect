// Analytics data types for DEV-Connect

export interface RevenueMetrics {
  total_revenue: number;
  period_revenue: number;
  currency: string;
  growth_rate: number; // percentage
  revenue_by_source: RevenueBySource[];
  revenue_by_period: RevenuePeriod[];
}

export interface RevenueBySource {
  source: string; // jobs, subscriptions, projects, etc.
  amount: number;
  percentage: number;
}

export interface RevenuePeriod {
  period: string; // YYYY-MM-DD
  amount: number;
}

export interface UserAnalytics {
  total_users: number;
  active_users: number;
  new_users: number;
  growth_rate: number;
  user_by_role: UserByRole[];
  retention_rate: number;
  churn_rate: number;
}

export interface UserByRole {
  role: string;
  count: number;
  percentage: number;
}

export interface JobAnalytics {
  total_jobs: number;
  active_jobs: number;
  completed_jobs: number;
  total_applications: number;
  avg_applications_per_job: number;
  jobs_by_category: JobsByCategory[];
  success_rate: number;
}

export interface JobsByCategory {
  category: string;
  count: number;
  percentage: number;
}

export interface ProjectAnalytics {
  total_projects: number;
  active_projects: number;
  completed_projects: number;
  avg_completion_time: number; // days
  on_time_percentage: number;
  budget_accuracy: number;
  projects_by_status: ProjectsByStatus[];
}

export interface ProjectsByStatus {
  status: string;
  count: number;
  percentage: number;
}

export interface PlatformAnalytics {
  overview: {
    total_revenue: number;
    total_users: number;
    total_jobs: number;
    total_projects: number;
    active_users_today: number;
    growth_rate: number;
  };
  revenue: RevenueMetrics;
  users: UserAnalytics;
  jobs: JobAnalytics;
  projects: ProjectAnalytics;
  period_start: string;
  period_end: string;
}

export interface AnalyticsFilters {
  start_date?: string;
  end_date?: string;
  granularity?: "day" | "week" | "month" | "year";
  metrics?: string[]; // specific metrics to fetch
}

export interface DashboardMetrics {
  revenue_today: number;
  revenue_this_month: number;
  revenue_growth: number;
  users_today: number;
  users_this_month: number;
  user_growth: number;
  jobs_today: number;
  jobs_this_month: number;
  job_growth: number;
  conversion_rate: number;
  avg_project_value: number;
}
