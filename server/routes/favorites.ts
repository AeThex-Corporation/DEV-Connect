import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const listFavorites: RequestHandler = async (req, res) => {
  const stack_user_id = (req.query.stack_user_id as string) || "";
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("favorites")
    .select("created_at, favorite_stack_user_id, profiles:favorite_stack_user_id(stack_user_id, display_name, role, tags, availability)")
    .eq("stack_user_id", stack_user_id)
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  const rows = (data || []).map((r: any) => ({
    stack_user_id: r.profiles?.stack_user_id,
    display_name: r.profiles?.display_name,
    role: r.profiles?.role,
    tags: r.profiles?.tags,
    availability: r.profiles?.availability,
  }));
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
