import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
import bcrypt from "bcryptjs";
import crypto from "crypto";

async function tieAndMergeAccount(
  email: string,
  id: string,
  displayName?: string,
) {
  const supabase = getSupabase();
  // Ensure a profile exists for this user id and email
  await supabase
    .from("profiles")
    .upsert(
      {
        stack_user_id: id,
        email,
        display_name: displayName ?? email.split("@")[0],
      },
      { onConflict: "stack_user_id" },
    );
  // If other profiles exist with the same email but different stack_user_id, merge ALL into the new id
  const { data: others } = await supabase
    .from("profiles")
    .select("id, stack_user_id")
    .eq("email", email)
    .neq("stack_user_id", id);

  for (const other of others || []) {
    const oldId = other?.stack_user_id;
    if (!oldId || oldId === id) continue;
    // Repoint references to new id (best-effort merges)
    await supabase.from("jobs").update({ created_by: id }).eq("created_by", oldId);
    await supabase
      .from("applications")
      .update({ applicant_stack_user_id: id })
      .eq("applicant_stack_user_id", oldId);
    await supabase
      .from("messages")
      .update({ sender_stack_user_id: id })
      .eq("sender_stack_user_id", oldId);
    await supabase
      .from("messages")
      .update({ recipient_stack_user_id: id })
      .eq("recipient_stack_user_id", oldId);
    await supabase.from("favorites").update({ stack_user_id: id }).eq("stack_user_id", oldId);
    await supabase
      .from("favorites")
      .update({ favorite_stack_user_id: id })
      .eq("favorite_stack_user_id", oldId);
    await supabase.from("presence").update({ stack_user_id: id }).eq("stack_user_id", oldId);
    await supabase.from("tickets").update({ stack_user_id: id }).eq("stack_user_id", oldId);
    await supabase.from("featured_devs").update({ stack_user_id: id }).eq("stack_user_id", oldId);
    // Move the profile to the new id
    if (other?.id) {
      await supabase
        .from("profiles")
        .update({ stack_user_id: id, updated_at: new Date().toISOString() })
        .eq("id", other.id);
    }
  }
}

export const signup: RequestHandler = async (req, res) => {
  const { email, password, display_name } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });
  const supabase = getSupabase();
  const { data: existing } = await supabase
    .from("users_local")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (existing)
    return res.status(409).json({ error: "email already registered" });
  const hash = await bcrypt.hash(password, 10);
  const { error } = await supabase
    .from("users_local")
    .insert({ email, password_hash: hash, display_name: display_name ?? null });
  if (error) return res.status(500).json({ error: error.message });
  const id = `local:${email}`;
  await tieAndMergeAccount(email, id, display_name || email.split("@")[0]);
  res.json({ id, displayName: display_name || email.split("@")[0] });
};

export const login: RequestHandler = async (req, res) => {
  const { email, password } = req.body ?? {};
  if (!email || !password)
    return res.status(400).json({ error: "email and password required" });
  const supabase = getSupabase();
  const { data: row } = await supabase
    .from("users_local")
    .select("password_hash, display_name")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (!row) return res.status(401).json({ error: "invalid credentials" });
  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid credentials" });
  const id = `local:${email}`;
  await tieAndMergeAccount(email, id, row.display_name || email.split("@")[0]);
  res.json({ id, displayName: row.display_name || email.split("@")[0] });
};

export const changePassword: RequestHandler = async (req, res) => {
  const { stack_user_id, current_password, new_password } = req.body ?? {};
  if (!stack_user_id || !current_password || !new_password)
    return res.status(400).json({
      error: "stack_user_id, current_password, new_password required",
    });
  if (!stack_user_id.startsWith("local:"))
    return res
      .status(400)
      .json({ error: "only local users can change password" });
  const email = stack_user_id.slice("local:".length);
  const supabase = getSupabase();
  const { data: row } = await supabase
    .from("users_local")
    .select("password_hash")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (!row) return res.status(404).json({ error: "user not found" });
  const ok = await bcrypt.compare(current_password, row.password_hash);
  if (!ok) return res.status(401).json({ error: "invalid current password" });
  const hash = await bcrypt.hash(new_password, 10);
  const { error } = await supabase
    .from("users_local")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq("email", email);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body ?? {};
  if (!email) return res.status(400).json({ error: "email required" });
  const supabase = getSupabase();
  const { data: exists } = await supabase
    .from("users_local")
    .select("id")
    .eq("email", email)
    .limit(1)
    .maybeSingle();
  if (!exists) return res.json({ ok: true }); // do not reveal
  const token = crypto.randomBytes(24).toString("hex");
  const expires_at = new Date(Date.now() + 1000 * 60 * 30).toISOString(); // 30m
  const { error } = await supabase
    .from("password_resets")
    .insert({ email, token, expires_at });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true, token });
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { token, new_password } = req.body ?? {};
  if (!token || !new_password)
    return res.status(400).json({ error: "token and new_password required" });
  const supabase = getSupabase();
  const { data: row } = await supabase
    .from("password_resets")
    .select("email, expires_at")
    .eq("token", token)
    .limit(1)
    .maybeSingle();
  if (!row) return res.status(400).json({ error: "invalid token" });
  if (new Date(row.expires_at as any).getTime() < Date.now())
    return res.status(400).json({ error: "token expired" });
  const hash = await bcrypt.hash(new_password, 10);
  const { error: updErr } = await supabase
    .from("users_local")
    .update({ password_hash: hash, updated_at: new Date().toISOString() })
    .eq("email", row.email as any);
  if (updErr) return res.status(500).json({ error: updErr.message });
  await supabase.from("password_resets").delete().eq("token", token);
  res.json({ ok: true });
};
