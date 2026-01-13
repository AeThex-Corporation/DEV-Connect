// Time Tracking Types - Phase 2

export interface TimeEntry {
  id: string;
  user_id: string;
  project_id?: string;
  job_id?: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration_minutes?: number;
  is_billable: boolean;
  hourly_rate?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface TimeEntryCreate {
  project_id?: string;
  job_id?: string;
  description: string;
  start_time: string;
  end_time?: string;
  is_billable?: boolean;
  hourly_rate?: number;
  tags?: string[];
}

export interface TimeEntryUpdate {
  description?: string;
  start_time?: string;
  end_time?: string;
  is_billable?: boolean;
  hourly_rate?: number;
  tags?: string[];
}

export interface ActiveTimer {
  id: string;
  user_id: string;
  project_id?: string;
  job_id?: string;
  description: string;
  start_time: string;
  tags?: string[];
}

export interface TimeReport {
  total_hours: number;
  billable_hours: number;
  total_earnings: number;
  entries_count: number;
  breakdown_by_project: Array<{
    project_id: string;
    project_name: string;
    hours: number;
    earnings: number;
  }>;
  breakdown_by_day: Array<{
    date: string;
    hours: number;
    earnings: number;
  }>;
}

export interface TimeReportRequest {
  start_date: string;
  end_date: string;
  project_id?: string;
  job_id?: string;
  billable_only?: boolean;
}
