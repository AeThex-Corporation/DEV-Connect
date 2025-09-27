import { RequestHandler } from "express";
import { query } from "../db";

export const listJobs: RequestHandler = async (req, res) => {
  const { role, comp, genre, q, created_by, exclude_revshare } = req.query as Record<
    string,
    string | undefined
  >;
  const clauses: string[] = [];
  const params: any[] = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    clauses.push(`LOWER(title) LIKE $${params.length}`);
  }
  if (role) {
    params.push(role);
    clauses.push(`role = $${params.length}`);
  }
  if (comp) {
    params.push(`%${comp.toLowerCase()}%`);
    clauses.push(`LOWER(comp) LIKE $${params.length}`);
  }
  if (exclude_revshare === "1") {
    clauses.push(`LOWER(comp) NOT LIKE '%rev share%'`);
  }
  if (genre) {
    params.push(genre);
    clauses.push(`genre = $${params.length}`);
  }
  if (created_by) {
    params.push(created_by);
    clauses.push(`created_by = $${params.length}`);
  }
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
  const { title, role, comp, genre, scope, description, stack_user_id } =
    req.body ?? {};
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  if (!title || !role || !comp)
    return res.status(400).json({ error: "title, role, comp required" });
  const rows = await query(
    `INSERT INTO jobs (title, role, comp, genre, scope, description, created_by)
     VALUES ($1,$2,$3,$4,$5,$6,$7)
     RETURNING id, title, role, comp, genre, scope, description, created_by, created_at`,
    [
      title,
      role,
      comp,
      genre ?? null,
      scope ?? null,
      description ?? null,
      stack_user_id,
    ],
  );
  res.status(201).json(rows[0]);
};

export const applyToJob: RequestHandler = async (req, res) => {
  const { id } = req.params;
  const { applicant_stack_user_id, message } = req.body ?? {};
  if (!applicant_stack_user_id)
    return res.status(400).json({ error: "applicant_stack_user_id required" });
  const rows = await query(
    `INSERT INTO applications (job_id, applicant_stack_user_id, message)
     VALUES ($1,$2,$3)
     RETURNING id, job_id, applicant_stack_user_id, message, status, created_at`,
    [id, applicant_stack_user_id, message ?? null],
  );
  res.status(201).json(rows[0]);
};

export const listIncomingApplications: RequestHandler = async (req, res) => {
  const owner = String((req.query.owner as string) || "");
  if (!owner) return res.json([]);
  const rows = await query(
    `SELECT a.id, a.job_id, a.applicant_stack_user_id, a.message, a.status, a.created_at,
            j.title as job_title
     FROM applications a
     JOIN jobs j ON j.id = a.job_id
     WHERE j.created_by = $1
     ORDER BY a.created_at DESC
     LIMIT 100`,
    [owner],
  );
  res.json(rows);
};
