import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const listJobs: RequestHandler = async (req, res) => {
  const { role, comp, genre, q, created_by, exclude_revshare } =
    req.query as Record<string, string | undefined>;
  const supabase = getSupabase();
  let qb = supabase
    .from("jobs")
    .select(
      "id, title, role, comp, genre, scope, description, created_by, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (q) qb = qb.ilike("title", `%${q}%`);
  if (role) qb = qb.eq("role", role);
  if (genre) qb = qb.eq("genre", genre);
  if (created_by) qb = qb.eq("created_by", created_by);
  if (comp) qb = qb.ilike("comp", `%${comp}%`);
  if (exclude_revshare === "1") qb = qb.not("comp", "ilike", "%rev share%");

  const { data, error } = await qb;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
};

export const getJob: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("jobs")
    .select(
      "id, title, role, comp, genre, scope, description, created_by, created_at",
    )
    .eq("id", Number(id))
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
};

export const createJob: RequestHandler = async (req, res) => {
  const { title, role, comp, genre, scope, description, stack_user_id } =
    req.body ?? {};
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  if (!title || !role || !comp)
    return res.status(400).json({ error: "title, role, comp required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("jobs")
    .insert({
      title,
      role,
      comp,
      genre: genre ?? null,
      scope: scope ?? null,
      description: description ?? null,
      created_by: stack_user_id,
    })
    .select(
      "id, title, role, comp, genre, scope, description, created_by, created_at",
    )
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const applyToJob: RequestHandler = async (req, res) => {
  const { id } = req.params as { id: string };
  const { applicant_stack_user_id, message } = req.body ?? {};
  if (!applicant_stack_user_id)
    return res.status(400).json({ error: "applicant_stack_user_id required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("applications")
    .insert({
      job_id: Number(id),
      applicant_stack_user_id,
      message: message ?? null,
    })
    .select("id, job_id, applicant_stack_user_id, message, status, created_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

export const listIncomingApplications: RequestHandler = async (req, res) => {
  const owner = String((req.query.owner as string) || "");
  if (!owner) return res.json([]);
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("applications")
    .select(
      "id, job_id, applicant_stack_user_id, message, status, created_at, jobs:job_id(title, created_by)",
    )
    .order("created_at", { ascending: false })
    .limit(100)
    .eq("jobs.created_by", owner);
  if (error) return res.status(500).json({ error: error.message });
  const mapped = (data || []).map((a: any) => ({
    id: a.id,
    job_id: a.job_id,
    applicant_stack_user_id: a.applicant_stack_user_id,
    message: a.message,
    status: a.status,
    created_at: a.created_at,
    job_title: a.jobs?.title ?? null,
  }));
  res.json(mapped);
};
