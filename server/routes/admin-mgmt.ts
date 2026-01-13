import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  AdminUser,
  UserManagementFilters,
  UserManagementResponse,
  UserUpdate,
  BanUserRequest,
  BanRecord,
  SystemSettings,
  SystemSettingsUpdate,
  SystemStats,
  ActivityLog,
  ActivityLogFilters,
  ActivityLogResponse,
  FeatureFlag,
  FeatureFlagUpdate,
} from "@shared/admin";

// Middleware to check admin privileges
const requireAdmin = (req: any, res: any, next: any) => {
  const userRole = req.header("x-user-role");
  if (userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

// GET /api/admin/users - List all users with filters
export const listUsers: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const {
    role,
    status,
    search,
    verified,
    limit = 50,
    offset = 0,
  } = req.query as Partial<UserManagementFilters>;

  const supabase = getSupabase();
  let query = supabase
    .from("profiles")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (role) query = query.eq("role", role);
  if (status) query = query.eq("status", status);
  if (verified !== undefined) {
    const isVerified = typeof verified === "string" ? verified === "true" : Boolean(verified);
    query = query.eq("is_verified", isVerified);
  }
  if (search) {
    query = query.or(`display_name.ilike.%${search}%,email.ilike.%${search}%`);
  }

  const { data: users, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const response: UserManagementResponse = {
    users: (users || []) as AdminUser[],
    total: count || 0,
    filters: { role, status, search, verified: verified as any, limit: Number(limit), offset: Number(offset) },
  };

  res.json(response);
};

// GET /api/admin/users/:id - Get user details
export const getUser: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json(data as AdminUser);
};

// PUT /api/admin/users/:id - Update user
export const updateUser: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const update: UserUpdate = req.body;
  const supabase = getSupabase();

  // Log the action
  await logActivity(userId, "update_user", "user", String(id), update);

  const { data, error } = await supabase
    .from("profiles")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", String(id))
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as AdminUser);
};

// POST /api/admin/users/:id/ban - Ban user
export const banUser: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const banRequest: BanUserRequest = req.body;
  const supabase = getSupabase();

  // Calculate expiry if duration provided
  const expiresAt = banRequest.duration
    ? new Date(Date.now() + banRequest.duration * 24 * 60 * 60 * 1000).toISOString()
    : undefined;

  // Create ban record
  const { data: banRecord, error: banError } = await supabase
    .from("user_bans")
    .insert({
      user_id: id,
      banned_by: userId,
      reason: banRequest.reason,
      notes: banRequest.notes,
      duration: banRequest.duration,
      expires_at: expiresAt,
    })
    .select()
    .single();

  if (banError) {
    return res.status(500).json({ error: banError.message });
  }

  // Update user status
  await supabase
    .from("profiles")
    .update({ status: "banned" })
    .eq("id", String(id));

  // Log the action
  await logActivity(userId, "ban_user", "user", String(id), { reason: banRequest.reason });

  res.json(banRecord as BanRecord);
};

// DELETE /api/admin/users/:id/ban - Unban user
export const unbanUser: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Revoke active bans
  await supabase
    .from("user_bans")
    .update({
      revoked_at: new Date().toISOString(),
      revoked_by: userId,
    })
    .eq("user_id", String(id))
    .is("revoked_at", null);

  // Update user status
  await supabase
    .from("profiles")
    .update({ status: "active" })
    .eq("id", String(id));

  // Log the action
  await logActivity(userId, "unban_user", "user", String(id), {});

  res.json({ success: true });
};

// GET /api/admin/stats - Get system statistics
export const getSystemStats: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const supabase = getSupabase();

  // User stats
  const [total, active, suspended, banned, verified] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "active"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "suspended"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("status", "banned"),
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("is_verified", true),
  ]);

  // Content stats
  const [profiles, jobs, projects, messages, reports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("jobs").select("id", { count: "exact", head: true }),
    supabase.from("projects").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
    supabase.from("moderation_reports").select("id", { count: "exact", head: true }),
  ]);

  // Activity stats
  const now = new Date();
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [dau, wau, mau] = await Promise.all([
    supabase.from("presence").select("stack_user_id", { count: "exact", head: true }).gte("updated_at", oneDayAgo),
    supabase.from("presence").select("stack_user_id", { count: "exact", head: true }).gte("updated_at", oneWeekAgo),
    supabase.from("presence").select("stack_user_id", { count: "exact", head: true }).gte("updated_at", oneMonthAgo),
  ]);

  // Moderation stats
  const [pendingReports, resolvedReports, bannedUsers] = await Promise.all([
    supabase.from("moderation_reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("moderation_reports").select("id", { count: "exact", head: true }).eq("status", "resolved"),
    supabase.from("user_bans").select("id", { count: "exact", head: true }).is("revoked_at", null),
  ]);

  const stats: SystemStats = {
    users: {
      total: total.count || 0,
      active: active.count || 0,
      suspended: suspended.count || 0,
      banned: banned.count || 0,
      verified: verified.count || 0,
    },
    content: {
      profiles: profiles.count || 0,
      jobs: jobs.count || 0,
      projects: projects.count || 0,
      messages: messages.count || 0,
      reports: reports.count || 0,
    },
    activity: {
      daily_active_users: dau.count || 0,
      weekly_active_users: wau.count || 0,
      monthly_active_users: mau.count || 0,
    },
    moderation: {
      pending_reports: pendingReports.count || 0,
      resolved_reports: resolvedReports.count || 0,
      banned_users: bannedUsers.count || 0,
    },
  };

  res.json(stats);
};

// GET /api/admin/activity - Get activity logs
export const getActivityLogs: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const {
    user_id,
    action,
    resource_type,
    start_date,
    end_date,
    limit = 100,
    offset = 0,
  } = req.query as Partial<ActivityLogFilters>;

  const supabase = getSupabase();
  let query = supabase
    .from("activity_logs")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (user_id) query = query.eq("user_id", user_id);
  if (action) query = query.eq("action", action);
  if (resource_type) query = query.eq("resource_type", resource_type);
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: logs, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  const response: ActivityLogResponse = {
    logs: (logs || []) as ActivityLog[],
    total: count || 0,
  };

  res.json(response);
};

// GET /api/admin/settings - Get system settings
export const getSettings: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  const userRole = req.header("x-user-role");
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { category } = req.query;
  const supabase = getSupabase();

  let query = supabase
    .from("system_settings")
    .select("*")
    .order("category", { ascending: true });

  if (category) query = query.eq("category", category);

  const { data: settings, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(settings as SystemSettings[]);
};

// PUT /api/admin/settings/:key - Update setting
export const updateSetting: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  const userRole = req.header("x-user-role");
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { key } = req.params;
  const update: SystemSettingsUpdate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("system_settings")
    .update({
      value: update.value,
      updated_at: new Date().toISOString(),
      updated_by: userId,
    })
    .eq("key", key)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Log the action
  await logActivity(userId, "update_setting", "setting", String(key), { value: update.value });

  res.json(data as SystemSettings);
};

// Helper function to log activity
async function logActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId?: string,
  details?: Record<string, any>
) {
  const supabase = getSupabase();
  await supabase.from("activity_logs").insert({
    user_id: userId,
    action,
    resource_type: resourceType,
    resource_id: resourceId,
    details,
  });
}
