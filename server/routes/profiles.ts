import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const getMyProfile: RequestHandler = async (req, res) => {
  const stackUserId = (req.query.stackUserId as string) || "";
  if (!stackUserId)
    return res.status(400).json({ error: "stackUserId required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, avatar_url, banner_url, passport_id, is_verified, created_at, updated_at",
    )
    .eq("stack_user_id", stackUserId)
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? null);
};

export const getPublicProfile: RequestHandler = async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  if (!stackUserId)
    return res.status(400).json({ error: "stackUserId required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select(
      "id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, avatar_url, banner_url, passport_id, is_verified, created_at, updated_at",
    )
    .eq("stack_user_id", stackUserId)
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: "Not found" });
  res.json(data);
};

export const listProfiles: RequestHandler = async (req, res) => {
  const { q, role, availability, tags } = req.query as Record<
    string,
    string | undefined
  >;
  const supabase = getSupabase();
  let qb = supabase
    .from("profiles")
    .select(
      "id, stack_user_id, display_name, role, tags, availability, trust_score, avatar_url, is_verified, created_at",
    )
    .order("created_at", { ascending: false })
    .limit(100);

  if (role) qb = qb.eq("role", role);
  if (availability) qb = qb.eq("availability", availability);
  if (q) qb = qb.or(`display_name.ilike.%${q}%,role.ilike.%${q}%`);
  if (tags) {
    const arr = tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    if (arr.length) {
      // All tags contained: use contains operator on text[]
      qb = qb.contains("tags", arr);
    }
  }
  const { data, error } = await qb;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
};

export const upsertProfile: RequestHandler = async (req, res) => {
  const body = req.body ?? {};
  const { stack_user_id } = body;
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  const supabase = getSupabase();

  // Ensure updated_at is set server-side
  const payload = { ...body, updated_at: new Date().toISOString() };

  // Upsert on stack_user_id
  const { data, error } = await supabase
    .from("profiles")
    .upsert(payload, { onConflict: "stack_user_id" })
    .select(
      "id, stack_user_id, display_name, role, tags, contact_discord, contact_roblox, contact_twitter, availability, trust_score, portfolio, avatar_url, banner_url, payment_pref, devforum_url, discord_handle, roblox_user_id, github_url, artstation_url, youtube_url, roblox_game_url, passport_id, is_verified, created_at, updated_at",
    )
    .limit(1)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
};
