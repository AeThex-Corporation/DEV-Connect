import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const listFeaturedDevs: RequestHandler = async (_req, res) => {
  const supabase = getSupabase();
  const { data: fds, error: fdErr } = await supabase
    .from("featured_devs")
    .select("stack_user_id, created_at")
    .order("created_at", { ascending: false })
    .limit(12);
  if (fdErr) return res.status(500).json({ error: fdErr.message });
  const ids = (fds || []).map((r) => r.stack_user_id);
  if (ids.length === 0) return res.json([]);
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("stack_user_id, display_name, role, tags, avatar_url, availability")
    .in("stack_user_id", ids);
  if (pErr) return res.status(500).json({ error: pErr.message });
  const map = new Map((profiles || []).map((p: any) => [p.stack_user_id, p]));
  const rows = ids.map((id) => map.get(id)).filter(Boolean);
  res.json(rows);
};

export const listFeaturedJobs: RequestHandler = async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("featured_jobs")
    .select(
      "created_at, jobs:job_id(id, title, role, comp, genre, scope, description, created_by, created_at)",
    )
    .order("created_at", { ascending: false })
    .limit(9);
  if (error) return res.status(500).json({ error: error.message });
  const rows = (data || []).map((r: any) => ({ ...r.jobs }));
  res.json(rows);
};
