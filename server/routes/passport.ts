import { RequestHandler } from "express";
import { query } from "../db";
import crypto from "crypto";

export const getPassport: RequestHandler = async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  if (!stackUserId)
    return res.status(400).json({ error: "stackUserId required" });
  const rows = await query<{ passport_id: string }>(
    `SELECT passport_id FROM profiles WHERE stack_user_id=$1`,
    [stackUserId],
  );
  res.json({ passport_id: rows[0]?.passport_id || null });
};

export const claimPassport: RequestHandler = async (req, res) => {
  const { stack_user_id } = req.body ?? {};
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  // Generate if missing
  const token = `rbx_${crypto.randomBytes(6).toString("hex")}`;
  const rows = await query<{ passport_id: string }>(
    `UPDATE profiles SET passport_id = COALESCE(passport_id, $2), updated_at=now() WHERE stack_user_id=$1 RETURNING passport_id`,
    [stack_user_id, token],
  );
  res.json({ passport_id: rows[0]?.passport_id || token });
};
