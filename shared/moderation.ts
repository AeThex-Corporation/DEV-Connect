// Content moderation types for DEV-Connect

export interface ModerationReport {
  id: string;
  reporter_id: string;
  reporter_name?: string;
  reported_user_id: string;
  reported_user_name?: string;
  resource_type: ResourceType;
  resource_id: string;
  reason: ModerationReason;
  description: string;
  status: ModerationStatus;
  priority: ModerationPriority;
  assigned_to?: string;
  assigned_to_name?: string;
  resolution?: string;
  resolved_at?: string;
  resolved_by?: string;
  created_at: string;
  updated_at: string;
}

export type ResourceType = 
  | "profile"
  | "job"
  | "message"
  | "project"
  | "portfolio"
  | "comment";

export type ModerationReason =
  | "spam"
  | "harassment"
  | "inappropriate_content"
  | "fake_profile"
  | "scam"
  | "copyright"
  | "other";

export type ModerationStatus = 
  | "pending"
  | "in_review"
  | "resolved"
  | "dismissed"
  | "escalated";

export type ModerationPriority = "low" | "medium" | "high" | "urgent";

export interface ReportCreate {
  reported_user_id: string;
  resource_type: ResourceType;
  resource_id: string;
  reason: ModerationReason;
  description: string;
}

export interface ReportUpdate {
  status?: ModerationStatus;
  priority?: ModerationPriority;
  assigned_to?: string;
  resolution?: string;
}

export interface ModerationFilters {
  status?: ModerationStatus;
  priority?: ModerationPriority;
  resource_type?: ResourceType;
  assigned_to?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ModerationResponse {
  reports: ModerationReport[];
  total: number;
  stats: {
    pending: number;
    in_review: number;
    resolved: number;
    dismissed: number;
  };
}

export interface ModerationAction {
  id: string;
  report_id: string;
  moderator_id: string;
  moderator_name?: string;
  action: ActionType;
  reason?: string;
  details?: Record<string, any>;
  created_at: string;
}

export type ActionType =
  | "dismiss"
  | "warn_user"
  | "suspend_user"
  | "ban_user"
  | "remove_content"
  | "edit_content"
  | "escalate";

export interface TakeActionRequest {
  report_id: string;
  action: ActionType;
  reason: string;
  details?: Record<string, any>;
}

export interface ContentFilter {
  id: string;
  type: FilterType;
  pattern: string;
  description?: string;
  enabled: boolean;
  severity: "low" | "medium" | "high";
  action: "flag" | "block" | "auto_remove";
  created_at: string;
  updated_at: string;
}

export type FilterType = "keyword" | "regex" | "url" | "email";

export interface ContentFilterCreate {
  type: FilterType;
  pattern: string;
  description?: string;
  severity: "low" | "medium" | "high";
  action: "flag" | "block" | "auto_remove";
}

export interface ContentFilterUpdate {
  pattern?: string;
  description?: string;
  enabled?: boolean;
  severity?: "low" | "medium" | "high";
  action?: "flag" | "block" | "auto_remove";
}

export interface ModerationStats {
  total_reports: number;
  pending_reports: number;
  resolved_today: number;
  average_resolution_time: number; // hours
  reports_by_type: Array<{
    type: ResourceType;
    count: number;
  }>;
  reports_by_reason: Array<{
    reason: ModerationReason;
    count: number;
  }>;
  moderator_performance: Array<{
    moderator_id: string;
    moderator_name: string;
    reports_handled: number;
    avg_resolution_time: number;
  }>;
}

export interface AutoModRule {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  conditions: AutoModCondition[];
  actions: AutoModAction[];
  created_at: string;
  updated_at: string;
}

export interface AutoModCondition {
  type: "keyword" | "pattern" | "trust_score" | "account_age" | "report_count";
  operator: "equals" | "contains" | "greater_than" | "less_than";
  value: any;
}

export interface AutoModAction {
  type: "flag" | "remove" | "suspend" | "notify_moderator";
  parameters?: Record<string, any>;
}

export interface AutoModRuleCreate {
  name: string;
  description?: string;
  conditions: AutoModCondition[];
  actions: AutoModAction[];
}
