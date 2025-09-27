import { RequestHandler } from "express";
import { query } from "../db";

export const submitReport: RequestHandler = async (req, res) => {
  const { subject, description } = req.body ?? {};
  if (!subject || !description) return res.status(400).json({ error: 'subject and description required' });
  await query(`INSERT INTO reports (subject, description) VALUES ($1,$2)`, [subject, description]);
  res.json({ ok: true });
};
