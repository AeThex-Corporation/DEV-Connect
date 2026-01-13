// Report types for DEV-Connect

export interface Report {
  id: string;
  name: string;
  description: string;
  type: ReportType;
  format: ReportFormat;
  schedule?: ReportSchedule;
  filters: Record<string, any>;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_generated?: string;
}

export type ReportType =
  | "revenue"
  | "users"
  | "jobs"
  | "projects"
  | "custom";

export type ReportFormat = "pdf" | "csv" | "json" | "excel";

export interface ReportSchedule {
  enabled: boolean;
  frequency: "daily" | "weekly" | "monthly";
  day_of_week?: number; // 0-6 for weekly
  day_of_month?: number; // 1-31 for monthly
  time: string; // HH:mm
  recipients: string[]; // email addresses
}

export interface ReportCreate {
  name: string;
  description?: string;
  type: ReportType;
  format: ReportFormat;
  filters: Record<string, any>;
  schedule?: ReportSchedule;
}

export interface ReportUpdate {
  name?: string;
  description?: string;
  filters?: Record<string, any>;
  schedule?: ReportSchedule;
}

export interface GenerateReportRequest {
  report_id: string;
  filters?: Record<string, any>; // override default filters
  format?: ReportFormat; // override default format
}

export interface GenerateReportResponse {
  report_id: string;
  download_url: string;
  expires_at: string;
  format: ReportFormat;
  generated_at: string;
}

export interface ReportListResponse {
  reports: Report[];
  total: number;
}

export interface RevenueReportData {
  summary: {
    total_revenue: number;
    period_revenue: number;
    currency: string;
    transactions_count: number;
  };
  by_source: Array<{
    source: string;
    revenue: number;
    count: number;
  }>;
  by_period: Array<{
    date: string;
    revenue: number;
    transactions: number;
  }>;
  top_clients: Array<{
    client_id: string;
    client_name: string;
    revenue: number;
  }>;
}

export interface UserReportData {
  summary: {
    total_users: number;
    active_users: number;
    new_users: number;
    retention_rate: number;
  };
  by_role: Array<{
    role: string;
    count: number;
  }>;
  by_signup_date: Array<{
    date: string;
    signups: number;
  }>;
  top_contributors: Array<{
    user_id: string;
    user_name: string;
    contributions: number;
  }>;
}

export interface JobReportData {
  summary: {
    total_jobs: number;
    active_jobs: number;
    completed_jobs: number;
    total_applications: number;
  };
  by_category: Array<{
    category: string;
    count: number;
    avg_applications: number;
  }>;
  by_status: Array<{
    status: string;
    count: number;
  }>;
  success_metrics: {
    filled_rate: number;
    avg_time_to_fill: number; // days
  };
}

export interface ProjectReportData {
  summary: {
    total_projects: number;
    active_projects: number;
    completed_projects: number;
    total_revenue: number;
  };
  by_status: Array<{
    status: string;
    count: number;
  }>;
  performance: {
    on_time_delivery: number; // percentage
    budget_accuracy: number; // percentage
    avg_project_duration: number; // days
  };
  top_projects: Array<{
    project_id: string;
    project_name: string;
    revenue: number;
  }>;
}
