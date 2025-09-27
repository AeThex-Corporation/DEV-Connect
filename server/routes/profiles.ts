import { RequestHandler } from "express";
import { query } from "../db";

export const getMyProfile: RequestHandler = async (req, res) => {
  const stackUserId = (req.query.stackUserId as string) || "";
  if (!stackUserId)
    return res.status(400).json({ error: "stackUserId required" });
  const rows = await query(
    `SELECT id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, avatar_url, banner_url, passport_id, created_at, updated_at FROM profiles WHERE stack_user_id = $1 LIMIT 1`,
    [stackUserId],
  );
  res.json(rows[0] ?? null);
};

export const getPublicProfile: RequestHandler = async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  if (!stackUserId)
    return res.status(400).json({ error: "stackUserId required" });
  const rows = await query(
    `SELECT id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, avatar_url, banner_url, passport_id, created_at, updated_at FROM profiles WHERE stack_user_id = $1 LIMIT 1`,
    [stackUserId],
  );
  if (!rows[0]) return res.status(404).json({ error: "Not found" });
  res.json(rows[0]);
};

export const listProfiles: RequestHandler = async (req, res) => {
  const { q, role, availability, tags } = req.query as Record<
    string,
    string | undefined
  >;
  const clauses: string[] = [];
  const params: any[] = [];
  if (q) {
    params.push(`%${q.toLowerCase()}%`);
    clauses.push(
      "(LOWER(display_name) LIKE $" +
        params.length +
        " OR LOWER(role) LIKE $" +
        params.length +
        ")",
    );
  }
  if (role) {
    params.push(role);
    clauses.push("role = $" + params.length);
  }
  if (availability) {
    params.push(availability);
    clauses.push("availability = $" + params.length);
  }
  if (tags) {
    const arr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (arr.length) {
      params.push(arr);
      clauses.push("tags && $" + params.length);
    }
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await query(
    `SELECT id, stack_user_id, display_name, role, tags, availability, trust_score, avatar_url, created_at FROM profiles ${where} ORDER BY created_at DESC LIMIT 100`,
    params,
  );
  res.json(rows);
};

export const upsertProfile: RequestHandler = async (req, res) => {
  const {
    stack_user_id,
    email,
    display_name,
    role,
    tags,
    contact_discord,
    contact_roblox,
    contact_twitter,
    availability,
    portfolio,
    trust_score,
    avatar_url,
    banner_url,
  } = req.body ?? {};

  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });

  const rows = await query(
    `INSERT INTO profiles (stack_user_id, email, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, portfolio, trust_score, avatar_url, banner_url, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,COALESCE($10,'[]'::jsonb),COALESCE($11,0),$12,$13, now())
     ON CONFLICT (stack_user_id) DO UPDATE SET
       email = COALESCE(EXCLUDED.email, profiles.email),
       display_name = EXCLUDED.display_name,
       role = EXCLUDED.role,
       tags = EXCLUDED.tags,
       contact_discord = EXCLUDED.contact_discord,
       contact_roblox = EXCLUDED.contact_roblox,
       contact_twitter = EXCLUDED.contact_twitter,
       availability = EXCLUDED.availability,
       portfolio = EXCLUDED.portfolio,
       trust_score = EXCLUDED.trust_score,
       avatar_url = EXCLUDED.avatar_url,
       banner_url = EXCLUDED.banner_url,
       updated_at = now()
     RETURNING id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, avatar_url, banner_url, created_at, updated_at`,
    [
      stack_user_id,
      email ?? null,
      display_name ?? null,
      role ?? null,
      Array.isArray(tags) ? tags : null,
      contact_discord ?? null,
      contact_roblox ?? null,
      contact_twitter ?? null,
      availability ?? null,
      portfolio ?? null,
      typeof trust_score === "number" ? trust_score : null,
      avatar_url ?? null,
      banner_url ?? null,
    ],
  );

  res.json(rows[0]);
};
