import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const submitReport: RequestHandler = async (req, res) => {
  const { subject, description } = req.body ?? {};
  if (!subject || !description)
    return res.status(400).json({ error: "subject and description required" });
  const supabase = getSupabase();
  const { error } = await supabase
    .from("reports")
    .insert({ subject, description });
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
};
