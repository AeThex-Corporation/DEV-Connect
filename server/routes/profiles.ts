import { RequestHandler } from "express";
import { query } from "../db";

export const getMyProfile: RequestHandler = async (req, res) => {
  const stackUserId = (req.query.stackUserId as string) || "";
  if (!stackUserId) return res.status(400).json({ error: "stackUserId required" });
  const rows = await query(
    `SELECT id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, created_at, updated_at FROM profiles WHERE stack_user_id = $1 LIMIT 1`,
    [stackUserId],
  );
  res.json(rows[0] ?? null);
};

export const upsertProfile: RequestHandler = async (req, res) => {
  const {
    stack_user_id,
    display_name,
    role,
    tags,
    contact_discord,
    contact_roblox,
    contact_twitter,
    availability,
    portfolio,
    trust_score,
  } = req.body ?? {};

  if (!stack_user_id) return res.status(400).json({ error: "stack_user_id required" });

  const rows = await query(
    `INSERT INTO profiles (stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, portfolio, trust_score, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,COALESCE($9,'[]'::jsonb),COALESCE($10,0), now())
     ON CONFLICT (stack_user_id) DO UPDATE SET
       display_name = EXCLUDED.display_name,
       role = EXCLUDED.role,
       tags = EXCLUDED.tags,
       contact_discord = EXCLUDED.contact_discord,
       contact_roblox = EXCLUDED.contact_roblox,
       contact_twitter = EXCLUDED.contact_twitter,
       availability = EXCLUDED.availability,
       portfolio = EXCLUDED.portfolio,
       trust_score = EXCLUDED.trust_score,
       updated_at = now()
     RETURNING id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, created_at, updated_at`,
    [
      stack_user_id,
      display_name ?? null,
      role ?? null,
      Array.isArray(tags) ? tags : null,
      contact_discord ?? null,
      contact_roblox ?? null,
      contact_twitter ?? null,
      availability ?? null,
      portfolio ?? null,
      typeof trust_score === "number" ? trust_score : null,
    ],
  );

  res.json(rows[0]);
};
