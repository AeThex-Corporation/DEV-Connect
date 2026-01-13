import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import type {
  TimeEntry,
  TimeEntryCreate,
  TimeEntryUpdate,
  ActiveTimer,
  TimeReport,
  TimeReportRequest,
} from "@shared/time-tracking";

// GET /api/time/entries - List time entries with filters
export const listTimeEntries: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const {
    project_id,
    job_id,
    start_date,
    end_date,
    billable_only,
    limit = 50,
    offset = 0,
  } = req.query;

  const supabase = getSupabase();
  let query = supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .order("start_time", { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (project_id) query = query.eq("project_id", project_id);
  if (job_id) query = query.eq("job_id", job_id);
  if (start_date) query = query.gte("start_time", start_date);
  if (end_date) query = query.lte("start_time", end_date);
  if (billable_only === "true") query = query.eq("is_billable", true);

  const { data, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ entries: data || [], total: data?.length || 0 });
};

// POST /api/time/entries - Create time entry
export const createTimeEntry: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const entry: TimeEntryCreate = req.body;

  // Calculate duration if both start and end times provided
  let duration_minutes: number | undefined;
  if (entry.start_time && entry.end_time) {
    const start = new Date(entry.start_time);
    const end = new Date(entry.end_time);
    duration_minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: userId,
      project_id: entry.project_id,
      job_id: entry.job_id,
      description: entry.description,
      start_time: entry.start_time,
      end_time: entry.end_time,
      duration_minutes,
      is_billable: entry.is_billable ?? true,
      hourly_rate: entry.hourly_rate,
      tags: entry.tags,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as TimeEntry);
};

// PUT /api/time/entries/:id - Update time entry
export const updateTimeEntry: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const updates: TimeEntryUpdate = req.body;

  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("time_entries")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized to update this entry" });
  }

  // Recalculate duration if times are being updated
  let duration_minutes: number | undefined;
  if (updates.start_time && updates.end_time) {
    const start = new Date(updates.start_time);
    const end = new Date(updates.end_time);
    duration_minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  }

  const { data, error } = await supabase
    .from("time_entries")
    .update({
      ...updates,
      ...(duration_minutes !== undefined && { duration_minutes }),
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as TimeEntry);
};

// DELETE /api/time/entries/:id - Delete time entry
export const deleteTimeEntry: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.params;
  const supabase = getSupabase();

  // Verify ownership
  const { data: existing } = await supabase
    .from("time_entries")
    .select("user_id")
    .eq("id", id)
    .single();

  if (!existing || existing.user_id !== userId) {
    return res.status(403).json({ error: "Not authorized to delete this entry" });
  }

  const { error } = await supabase.from("time_entries").delete().eq("id", id);

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json({ success: true });
};

// GET /api/time/active - Get active timer
export const getActiveTimer: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .is("end_time", null)
    .order("start_time", { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== "PGRST116") {
    // PGRST116 = no rows returned
    return res.status(500).json({ error: error.message });
  }

  res.json({ timer: (data as ActiveTimer) || null });
};

// POST /api/time/start - Start timer
export const startTimer: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { project_id, job_id, description, tags } = req.body;

  const supabase = getSupabase();

  // Stop any existing active timers first
  await supabase
    .from("time_entries")
    .update({
      end_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("user_id", userId)
    .is("end_time", null);

  // Start new timer
  const { data, error } = await supabase
    .from("time_entries")
    .insert({
      user_id: userId,
      project_id,
      job_id,
      description: description || "Working...",
      start_time: new Date().toISOString(),
      is_billable: true,
      tags,
    })
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json(data as ActiveTimer);
};

// POST /api/time/stop - Stop active timer
export const stopTimer: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabase();
  const now = new Date().toISOString();

  // Get active timer
  const { data: activeTimer } = await supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .is("end_time", null)
    .single();

  if (!activeTimer) {
    return res.status(404).json({ error: "No active timer found" });
  }

  // Calculate duration
  const start = new Date(activeTimer.start_time);
  const end = new Date(now);
  const duration_minutes = Math.round((end.getTime() - start.getTime()) / 60000);

  // Stop timer
  const { data, error } = await supabase
    .from("time_entries")
    .update({
      end_time: now,
      duration_minutes,
      updated_at: now,
    })
    .eq("id", activeTimer.id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  res.json(data as TimeEntry);
};

// POST /api/time/report - Generate time report
export const generateReport: RequestHandler = async (req, res) => {
  const userId = req.header("x-user-id");
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const request: TimeReportRequest = req.body;
  const supabase = getSupabase();

  let query = supabase
    .from("time_entries")
    .select("*")
    .eq("user_id", userId)
    .gte("start_time", request.start_date)
    .lte("start_time", request.end_date)
    .not("duration_minutes", "is", null);

  if (request.project_id) query = query.eq("project_id", request.project_id);
  if (request.job_id) query = query.eq("job_id", request.job_id);
  if (request.billable_only) query = query.eq("is_billable", true);

  const { data: entries, error } = await query;

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Calculate report statistics
  const total_hours = entries.reduce(
    (sum, e) => sum + (e.duration_minutes || 0) / 60,
    0
  );
  const billable_hours = entries
    .filter((e) => e.is_billable)
    .reduce((sum, e) => sum + (e.duration_minutes || 0) / 60, 0);
  const total_earnings = entries.reduce(
    (sum, e) =>
      sum + ((e.duration_minutes || 0) / 60) * (e.hourly_rate || 0),
    0
  );

  // Group by project
  const projectMap = new Map<string, { name: string; hours: number; earnings: number }>();
  for (const entry of entries) {
    if (!entry.project_id) continue;
    const existing = projectMap.get(entry.project_id) || {
      name: entry.project_id,
      hours: 0,
      earnings: 0,
    };
    existing.hours += (entry.duration_minutes || 0) / 60;
    existing.earnings += ((entry.duration_minutes || 0) / 60) * (entry.hourly_rate || 0);
    projectMap.set(entry.project_id, existing);
  }

  // Group by day
  const dayMap = new Map<string, { hours: number; earnings: number }>();
  for (const entry of entries) {
    const date = new Date(entry.start_time).toISOString().split("T")[0];
    const existing = dayMap.get(date) || { hours: 0, earnings: 0 };
    existing.hours += (entry.duration_minutes || 0) / 60;
    existing.earnings += ((entry.duration_minutes || 0) / 60) * (entry.hourly_rate || 0);
    dayMap.set(date, existing);
  }

  const report: TimeReport = {
    total_hours,
    billable_hours,
    total_earnings,
    entries_count: entries.length,
    breakdown_by_project: Array.from(projectMap.entries()).map(([id, data]) => ({
      project_id: id,
      project_name: data.name,
      hours: data.hours,
      earnings: data.earnings,
    })),
    breakdown_by_day: Array.from(dayMap.entries()).map(([date, data]) => ({
      date,
      hours: data.hours,
      earnings: data.earnings,
    })),
  };

  res.json(report);
};
