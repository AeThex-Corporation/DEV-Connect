import { RequestHandler } from "express";
import { query } from "../db";
import bcrypt from "bcryptjs";
import crypto from "crypto";

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

export const changePassword: RequestHandler = async (req, res) => {
  const { stack_user_id, current_password, new_password } = req.body ?? {};
  if (!stack_user_id || !current_password || !new_password)
    return res
      .status(400)
      .json({ error: "stack_user_id, current_password, new_password required" });
  if (!stack_user_id.startsWith("local:"))
    return res.status(400).json({ error: "only local users can change password" });
  const email = stack_user_id.slice("local:".length);
  const rows = await query<{ password_hash: string }>(
    `SELECT password_hash FROM users_local WHERE email=$1`,
    [email],
  );
  const row = rows[0];
  if (!row) return res.status(404).json({ error: "user not found" });
  const ok = await bcrypt.compare(current_password, row.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid current password" });
  const hash = await bcrypt.hash(new_password, 10);
  await query(`UPDATE users_local SET password_hash=$1, updated_at=now() WHERE email=$2`, [
    hash,
    email,
  ]);
  res.json({ ok: true });
};

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email required" });
  const exists = await query<{ id: number }>(
    `SELECT id FROM users_local WHERE email=$1`,
    [email],
  );
  if (!exists[0]) return res.json({ ok: true }); // do not reveal
  const token = crypto.randomBytes(24).toString("hex");
  const expires_at = new Date(Date.now() + 1000 * 60 * 30); // 30m
  await query(
    `INSERT INTO password_resets (email, token, expires_at) VALUES ($1,$2,$3)`,
    [email, token, expires_at],
  );
  res.json({ ok: true, token });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { token, new_password } = req.body ?? {};
  if (!token || !new_password)
    return res.status(400).json({ error: "token and new_password required" });
  const rows = await query<{ email: string; expires_at: string }>(
    `SELECT email, expires_at FROM password_resets WHERE token=$1 LIMIT 1`,
    [token],
  );
  const row = rows[0];
  if (!row) return res.status(400).json({ error: "invalid token" });
  if (new Date(row.expires_at).getTime() < Date.now())
    return res.status(400).json({ error: "token expired" });
  const hash = await bcrypt.hash(new_password, 10);
  await query(`UPDATE users_local SET password_hash=$1, updated_at=now() WHERE email=$2`, [
    hash,
    row.email,
  ]);
  await query(`DELETE FROM password_resets WHERE token=$1`, [token]);
  res.json({ ok: true });
};
