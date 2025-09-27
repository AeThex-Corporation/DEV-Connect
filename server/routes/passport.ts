import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import crypto from "crypto";

export const getPassport: RequestHandler = async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  if (!stackUserId)
    return res.status(400).json({ error: "stackUserId required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("passport_id")
    .eq("stack_user_id", stackUserId)
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ passport_id: data?.passport_id || null });
};

export const claimPassport: RequestHandler = async (req, res) => {
  const { stack_user_id } = req.body ?? {};
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  const supabase = getSupabase();
  // If already has a passport, return it
  const { data: existing, error: gErr } = await supabase
    .from("profiles")
    .select("passport_id")
    .eq("stack_user_id", stack_user_id)
    .limit(1)
    .maybeSingle();
  if (gErr) return res.status(500).json({ error: gErr.message });
  if (existing?.passport_id)
    return res.json({ passport_id: existing.passport_id });
  // Generate if missing and update
  const token = `rbx_${crypto.randomBytes(6).toString("hex")}`;
  const { data, error } = await supabase
    .from("profiles")
    .update({ passport_id: token, updated_at: new Date().toISOString() })
    .eq("stack_user_id", stack_user_id)
    .select("passport_id")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json({ passport_id: data?.passport_id || token });
};
