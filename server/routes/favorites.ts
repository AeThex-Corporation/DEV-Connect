import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const listFavorites: RequestHandler = async (req, res) => {
  const stack_user_id = (req.query.stack_user_id as string) || "";
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  const supabase = getSupabase();
  const { data: favs, error: fErr } = await supabase
    .from("favorites")
    .select("favorite_stack_user_id, created_at")
    .eq("stack_user_id", stack_user_id)
    .order("created_at", { ascending: false });
  if (fErr) return res.status(500).json({ error: fErr.message });
  const ids = (favs || []).map((f) => f.favorite_stack_user_id);
  if (ids.length === 0) return res.json([]);
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("stack_user_id, display_name, role, tags, availability")
    .in("stack_user_id", ids);
  if (pErr) return res.status(500).json({ error: pErr.message });
  const map = new Map((profiles || []).map((p: any) => [p.stack_user_id, p]));
  const rows = ids.map((id) => map.get(id)).filter(Boolean);
  res.json(rows);
};

export const toggleFavorite: RequestHandler = async (req, res) => {
  const { stack_user_id, favorite_stack_user_id } = req.body ?? {};
  if (!stack_user_id || !favorite_stack_user_id)
    return res
      .status(400)
      .json({ error: "stack_user_id and favorite_stack_user_id required" });
  const supabase = getSupabase();
  const { data: existing, error: findErr } = await supabase
    .from("favorites")
    .select("id")
    .eq("stack_user_id", stack_user_id)
    .eq("favorite_stack_user_id", favorite_stack_user_id)
    .limit(1)
    .maybeSingle();
  if (findErr && findErr.code !== "PGRST116")
    return res.status(500).json({ error: findErr.message });
  if (existing) {
    const { error } = await supabase.from("favorites").delete().eq("id", existing.id);
    if (error) return res.status(500).json({ error: error.message });
    return res.json({ favorited: false });
  }
  const { error } = await supabase
    .from("favorites")
    .insert({ stack_user_id, favorite_stack_user_id });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ favorited: true });
};
