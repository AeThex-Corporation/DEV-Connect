import { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";

export const listThread: RequestHandler = async (req, res) => {
  const me = (req.query.stack_user_id as string) || "";
  const peer = (req.query.peer_stack_user_id as string) || "";
  if (!me || !peer)
    return res
      .status(400)
      .json({ error: "stack_user_id and peer_stack_user_id required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("messages")
    .select(
      "id, thread_id, sender_stack_user_id, recipient_stack_user_id, body, created_at",
    )
    .or(
      `and(sender_stack_user_id.eq.${me},recipient_stack_user_id.eq.${peer}),and(sender_stack_user_id.eq.${peer},recipient_stack_user_id.eq.${me})`,
    )
    .order("created_at", { ascending: true });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
};

export const sendMessage: RequestHandler = async (req, res) => {
  const { sender_stack_user_id, recipient_stack_user_id, body } =
    req.body ?? {};
  if (!sender_stack_user_id || !recipient_stack_user_id || !body)
    return res.status(400).json({
      error: "sender_stack_user_id, recipient_stack_user_id, body required",
    });
  const supabase = getSupabase();
  const threadId = makeThreadId(sender_stack_user_id, recipient_stack_user_id);
  const { data, error } = await supabase
    .from("messages")
    .insert({
      thread_id: threadId,
      sender_stack_user_id,
      recipient_stack_user_id,
      body,
    })
    .select(
      "id, thread_id, sender_stack_user_id, recipient_stack_user_id, body, created_at",
    )
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
};

function makeThreadId(a: string, b: string) {
  return [a, b].sort().join("::");
}
