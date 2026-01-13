import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  ModerationReport,
  ReportCreate,
  ReportUpdate,
  ModerationFilters,
  ModerationResponse,
  ModerationAction,
  TakeActionRequest,
  ContentFilter,
  ContentFilterCreate,
  ContentFilterUpdate,
  ModerationStats,
} from "@shared/moderation";

// GET /api/moderation/reports - List moderation reports
export const listReports: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || !["admin", "moderator"].includes(userRole || "")) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const {
    status,
    priority,
    resource_type,
    assigned_to,
    start_date,
    end_date,
    limit = 50,
    offset = 0,
  } = req.query as Partial<ModerationFilters>;

  const supabase = getSupabase();
  let query = supabase
    .from("moderation_reports")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
  if (resource_type) query = query.eq("resource_type", resource_type);
  if (assigned_to) query = query.eq("assigned_to", assigned_to);
  if (start_date) query = query.gte("created_at", start_date);
  if (end_date) query = query.lte("created_at", end_date);

  const { data: reports, error, count } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Get stats
  const { data: stats } = await supabase
    .from("moderation_reports")
    .select("status");

  const statusCounts = {
    pending: stats?.filter((r: any) => r.status === "pending").length || 0,
    in_review: stats?.filter((r: any) => r.status === "in_review").length || 0,
    resolved: stats?.filter((r: any) => r.status === "resolved").length || 0,
    dismissed: stats?.filter((r: any) => r.status === "dismissed").length || 0,
  };

  const response: ModerationResponse = {
    reports: (reports || []) as ModerationReport[],
    total: count || 0,
    stats: statusCounts,
  };

  res.json(response);
};

// GET /api/moderation/reports/:id - Get single report
export const getReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || !["admin", "moderator"].includes(userRole || "")) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("moderation_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(404).json({ error: "Report not found" });
  }

  res.json(data as ModerationReport);
};

// POST /api/moderation/reports - Create report
export const createReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const report: ReportCreate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("moderation_reports")
    .insert({
      ...report,
      reporter_id: userId,
      status: "pending",
      priority: "medium",
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as ModerationReport);
};

// PUT /api/moderation/reports/:id - Update report
export const updateReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || !["admin", "moderator"].includes(userRole || "")) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const { id } = req.params;
  const update: ReportUpdate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("moderation_reports")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as ModerationReport);
};

// POST /api/moderation/reports/:id/assign - Assign report to moderator
export const assignReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || !["admin", "moderator"].includes(userRole || "")) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const { id } = req.params;
  const { moderator_id } = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("moderation_reports")
    .update({
      assigned_to: moderator_id,
      status: "in_review",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data);
};

// POST /api/moderation/reports/:id/action - Take moderation action
export const takeAction: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || !["admin", "moderator"].includes(userRole || "")) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const { id } = req.params;
  const actionRequest: TakeActionRequest = req.body;
  const supabase = getSupabase();

  // Get the report
  const { data: report } = await supabase
    .from("moderation_reports")
    .select("*")
    .eq("id", id)
    .single();

  if (!report) {
    return res.status(404).json({ error: "Report not found" });
  }

  // Log the action
  const { data: action, error: actionError } = await supabase
    .from("moderation_actions")
    .insert({
      report_id: id,
      moderator_id: userId,
      action: actionRequest.action,
      reason: actionRequest.reason,
      details: actionRequest.details,
    })
    .select()
    .single();

  if (actionError) {
    return res.status(500).json({ error: actionError.message });
  }

  // Execute the action
  switch (actionRequest.action) {
    case "dismiss":
      await supabase
        .from("moderation_reports")
        .update({ status: "dismissed", resolved_at: new Date().toISOString(), resolved_by: userId })
        .eq("id", id);
      break;

    case "warn_user":
      // TODO: Send warning to user
      await supabase
        .from("moderation_reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
        .eq("id", id);
      break;

    case "suspend_user":
      await supabase
        .from("profiles")
        .update({ status: "suspended" })
        .eq("id", report.reported_user_id);
      await supabase
        .from("moderation_reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
        .eq("id", id);
      break;

    case "ban_user":
      await supabase
        .from("profiles")
        .update({ status: "banned" })
        .eq("id", report.reported_user_id);
      await supabase
        .from("user_bans")
        .insert({
          user_id: report.reported_user_id,
          banned_by: userId,
          reason: actionRequest.reason,
        });
      await supabase
        .from("moderation_reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
        .eq("id", id);
      break;

    case "remove_content":
      // TODO: Implement content removal based on resource_type
      await supabase
        .from("moderation_reports")
        .update({ status: "resolved", resolved_at: new Date().toISOString(), resolved_by: userId })
        .eq("id", id);
      break;

    case "escalate":
      await supabase
        .from("moderation_reports")
        .update({ status: "escalated", priority: "urgent" })
        .eq("id", id);
      break;
  }

  res.json(action as ModerationAction);
};

// GET /api/moderation/filters - List content filters
export const listFilters: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const supabase = getSupabase();
  const { data: filters, error } = await supabase
    .from("content_filters")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(filters as ContentFilter[]);
};

// POST /api/moderation/filters - Create content filter
export const createFilter: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const filter: ContentFilterCreate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("content_filters")
    .insert({
      ...filter,
      enabled: true,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as ContentFilter);
};

// PUT /api/moderation/filters/:id - Update content filter
export const updateFilter: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const update: ContentFilterUpdate = req.body;
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from("content_filters")
    .update({
      ...update,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as ContentFilter);
};

// DELETE /api/moderation/filters/:id - Delete content filter
export const deleteFilter: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  const { error } = await supabase
    .from("content_filters")
    .delete()
    .eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// GET /api/moderation/stats - Get moderation statistics
export const getModerationStats: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id") || "dev-user";
  const userRole = req.header("x-user-role") || (process.env.NODE_ENV === "development" ? "admin" : undefined);
  
  if (!userId || !["admin", "moderator"].includes(userRole || "")) {
    return res.status(403).json({ error: "Moderator access required" });
  }

  const supabase = getSupabase();

  // Total and pending reports
  const { count: totalReports } = await supabase
    .from("moderation_reports")
    .select("id", { count: "exact", head: true });

  const { count: pendingReports } = await supabase
    .from("moderation_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");

  // Resolved today
  const today = new Date().toISOString().split("T")[0];
  const { count: resolvedToday } = await supabase
    .from("moderation_reports")
    .select("id", { count: "exact", head: true })
    .eq("status", "resolved")
    .gte("resolved_at", today);

  // Reports by type
  const { data: allReports } = await supabase
    .from("moderation_reports")
    .select("resource_type, reason");

  const typeMap = new Map<string, number>();
  const reasonMap = new Map<string, number>();

  allReports?.forEach((report: any) => {
    typeMap.set(report.resource_type, (typeMap.get(report.resource_type) || 0) + 1);
    reasonMap.set(report.reason, (reasonMap.get(report.reason) || 0) + 1);
  });

  const reportsByType = Array.from(typeMap.entries()).map(([type, count]) => ({
    type: type as any,
    count,
  }));

  const reportsByReason = Array.from(reasonMap.entries()).map(([reason, count]) => ({
    reason: reason as any,
    count,
  }));

  const stats: ModerationStats = {
    total_reports: totalReports || 0,
    pending_reports: pendingReports || 0,
    resolved_today: resolvedToday || 0,
    average_resolution_time: 0, // TODO: Calculate
    reports_by_type: reportsByType,
    reports_by_reason: reportsByReason,
    moderator_performance: [], // TODO: Calculate
  };

  res.json(stats);
};
