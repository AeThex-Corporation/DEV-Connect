import { RequestHandler } from "express";
import { query } from "../db";

export const listThread: RequestHandler = async (req, res) => {
  const me = (req.query.stack_user_id as string) || "";
  const peer = (req.query.peer_stack_user_id as string) || "";
  if (!me || !peer) return res.status(400).json({ error: "stack_user_id and peer_stack_user_id required" });
  const rows = await query(
    `SELECT id, thread_id, sender_stack_user_id, recipient_stack_user_id, body, created_at
     FROM messages
     WHERE (sender_stack_user_id = $1 AND recipient_stack_user_id = $2)
        OR (sender_stack_user_id = $2 AND recipient_stack_user_id = $1)
     ORDER BY created_at ASC`,
    [me, peer],
  );
  res.json(rows);
};

export const sendMessage: RequestHandler = async (req, res) => {
  const { sender_stack_user_id, recipient_stack_user_id, body } = req.body ?? {};
  if (!sender_stack_user_id || !recipient_stack_user_id || !body) return res.status(400).json({ error: "sender_stack_user_id, recipient_stack_user_id, body required" });
  const rows = await query(
    `INSERT INTO messages (thread_id, sender_stack_user_id, recipient_stack_user_id, body)
     VALUES ($1,$2,$3,$4)
     RETURNING id, thread_id, sender_stack_user_id, recipient_stack_user_id, body, created_at`,
    [makeThreadId(sender_stack_user_id, recipient_stack_user_id), sender_stack_user_id, recipient_stack_user_id, body],
  );
  res.status(201).json(rows[0]);
};

function makeThreadId(a: string, b: string) {
  return [a, b].sort().join("::");
}
