// Admin management types for DEV-Connect

export interface AdminUser {
  id: string;
  email: string;
  display_name: string;
  role: UserRole;
  status: UserStatus;
  created_at: string;
  last_login?: string;
  verified: boolean;
  trust_score?: number;
}

export type UserRole = "admin" | "moderator" | "developer" | "client" | "user";
export type UserStatus = "active" | "suspended" | "banned" | "pending";

export interface UserManagementFilters {
  role?: UserRole;
  status?: UserStatus;
  search?: string;
  verified?: boolean;
  limit?: number;
  offset?: number;
}

export interface UserManagementResponse {
  users: AdminUser[];
  total: number;
  filters: UserManagementFilters;
}

export interface UserUpdate {
  display_name?: string;
  role?: UserRole;
  status?: UserStatus;
  verified?: boolean;
  trust_score?: number;
}

export interface BanUserRequest {
  user_id: string;
  reason: string;
  duration?: number; // days, undefined = permanent
  notes?: string;
}

export interface BanRecord {
  id: string;
  user_id: string;
  banned_by: string;
  reason: string;
  notes?: string;
  duration?: number;
  expires_at?: string;
  created_at: string;
  revoked_at?: string;
  revoked_by?: string;
}

export interface SystemSettings {
  id: string;
  key: string;
  value: any;
  type: "string" | "number" | "boolean" | "json";
  description?: string;
  category: SettingsCategory;
  updated_at: string;
  updated_by: string;
}

export type SettingsCategory = 
  | "general"
  | "security"
  | "features"
  | "payments"
  | "notifications"
  | "moderation";

export interface SystemSettingsUpdate {
  value: any;
}

export interface SystemStats {
  users: {
    total: number;
    active: number;
    suspended: number;
    banned: number;
    verified: number;
  };
  content: {
    profiles: number;
    jobs: number;
    projects: number;
    messages: number;
    reports: number;
  };
  activity: {
    daily_active_users: number;
    weekly_active_users: number;
    monthly_active_users: number;
  };
  moderation: {
    pending_reports: number;
    resolved_reports: number;
    banned_users: number;
  };
}

export interface ActivityLog {
  id: string;
  user_id: string;
  user_name?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  details?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface ActivityLogFilters {
  user_id?: string;
  action?: string;
  resource_type?: string;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface ActivityLogResponse {
  logs: ActivityLog[];
  total: number;
}

export interface FeatureFlag {
  id: string;
  name: string;
  key: string;
  description?: string;
  enabled: boolean;
  percentage?: number; // for gradual rollout
  user_whitelist?: string[];
  created_at: string;
  updated_at: string;
}

export interface FeatureFlagUpdate {
  enabled?: boolean;
  percentage?: number;
  user_whitelist?: string[];
}
