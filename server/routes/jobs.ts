import { RequestHandler } from "express";
import { query } from "../db";

export const listJobs: RequestHandler = async (req, res) => {
  const { role, comp, genre, q } = req.query as Record<string, string | undefined>;
  const clauses: string[] = [];
  const params: any[] = [];
  if (q) { params.push(`%${q.toLowerCase()}%`); clauses.push(`LOWER(title) LIKE $${params.length}`); }
  if (role) { params.push(role); clauses.push(`role = $${params.length}`); }
  if (comp) { params.push(comp); clauses.push(`comp = $${params.length}`); }
  if (genre) { params.push(genre); clauses.push(`genre = $${params.length}`); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await query(
    `SELECT id, title, role, comp, genre, scope, description, created_by, created_at
     FROM jobs ${where}
     ORDER BY created_at DESC
     LIMIT 100`,
    params,
  );
  res.json(rows);
};

export const getJob: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const rows = await query(
    `SELECT id, title, role, comp, genre, scope, description, created_by, created_at FROM jobs WHERE id = $1 LIMIT 1`,
    [id],
  );
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

export const createJob: RequestHandler = async (req, res) => {
  const { title, role, comp, genre, scope, description, stack_user_id } = req.body ?? {};
  if (!stack_user_id) return res.status(400).json({ error: "stack_user_id required" });
  if (!title || !role || !comp) return res.status(400).json({ error: "title, role, comp required" });
  const rows = await query(
    `INSERT INTO jobs (title, role, comp, genre, scope, description, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, title, role, comp, genre, scope, description, created_by, created_at`,
    [title, role, comp, genre ?? null, scope ?? null, description ?? null, stack_user_id],
  );
  res.status(201).json(rows[0]);
};

export const applyToJob: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { applicant_stack_user_id, message } = req.body ?? {};
  if (!applicant_stack_user_id) return res.status(400).json({ error: "applicant_stack_user_id required" });
  const rows = await query(
    `INSERT INTO applications (job_id, applicant_stack_user_id, message)
     VALUES ($1,$2,$3)
     RETURNING id, job_id, applicant_stack_user_id, message, status, created_at`,
    [id, applicant_stack_user_id, message ?? null],
  );
  res.status(201).json(rows[0]);
};
