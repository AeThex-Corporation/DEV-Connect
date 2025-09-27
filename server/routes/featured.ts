import { RequestHandler } from "express";
import { query } from "../db";

export const listFeaturedDevs: RequestHandler = async (_req, res) => {
  const rows = await query(
    `SELECT p.stack_user_id, p.display_name, p.role, p.tags, p.avatar_url, p.availability
     FROM featured_devs fd
     JOIN profiles p ON p.stack_user_id = fd.stack_user_id
     ORDER BY fd.created_at DESC
     LIMIT 12`,
  );
  res.json(rows);
};

export const listFeaturedJobs: RequestHandler = async (_req, res) => {
  const rows = await query(
    `SELECT j.id, j.title, j.role, j.comp, j.genre, j.scope, j.description, j.created_by, j.created_at
     FROM featured_jobs fj
     JOIN jobs j ON j.id = fj.job_id
     ORDER BY fj.created_at DESC
     LIMIT 9`,
  );
  res.json(rows);
};
