import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const listFeaturedDevs: RequestHandler = async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("featured_devs")
    .select(
      "created_at, profiles:stack_user_id(stack_user_id, display_name, role, tags, avatar_url, availability)",
    )
    .order("created_at", { ascending: false })
    .limit(12);
  if (error) return res.status(500).json({ error: error.message });
  const rows = (data || []).map((r: any) => ({
    stack_user_id: r.profiles?.stack_user_id,
    display_name: r.profiles?.display_name,
    role: r.profiles?.role,
    tags: r.profiles?.tags,
    avatar_url: r.profiles?.avatar_url,
    availability: r.profiles?.availability,
  }));
  res.json(rows);
};

export const listFeaturedJobs: RequestHandler = async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("featured_jobs")
    .select("created_at, jobs:job_id(id, title, role, comp, genre, scope, description, created_by, created_at)")
    .order("created_at", { ascending: false })
    .limit(9);
  if (error) return res.status(500).json({ error: error.message });
  const rows = (data || []).map((r: any) => ({ ...r.jobs }));
  res.json(rows);
};
