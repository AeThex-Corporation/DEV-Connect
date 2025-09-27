import { RequestHandler } from "express";
import { query } from "../db";
import bcrypt from "bcryptjs";

export const signup: RequestHandler = async (req, res) => {
  const { email, password, display_name } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });
  const existing = await query<{ id: number }>(
    `SELECT id FROM users_local WHERE email=$1`,
    [email],
  );
  if (existing[0])
    return res.status(409).json({ error: "email already registered" });
  const hash = await bcrypt.hash(password, 10);
  const rows = await query<{ id: number; display_name: string }>(
    `INSERT INTO users_local (email, password_hash, display_name) VALUES ($1,$2,$3) RETURNING id, display_name`,
    [email, hash, display_name ?? null],
  );
  const id = `local:${email}`;
  res.json({ id, displayName: display_name || email.split("@")[0] });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });
  const rows = await query<{ password_hash: string; display_name: string }>(
    `SELECT password_hash, display_name FROM users_local WHERE email=$1`,
    [email],
  );
  const row = rows[0];
  if (!row) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const id = `local:${email}`;
  res.json({ id, displayName: row.display_name || email.split("@")[0] });
};
