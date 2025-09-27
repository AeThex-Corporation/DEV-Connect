import { RequestHandler } from "express";
import { query } from "../db";

export const listFavorites: RequestHandler = async (req, res) => {
  const stack_user_id = (req.query.stack_user_id as string) || "";
  if (!stack_user_id) return res.status(400).json({ error: "stack_user_id required" });
  const rows = await query(
    `SELECT p.stack_user_id, p.display_name, p.role, p.tags, p.availability
     FROM favorites f
     JOIN profiles p ON p.stack_user_id = f.favorite_stack_user_id
     WHERE f.stack_user_id = $1
     ORDER BY f.created_at DESC`,
    [stack_user_id],
  );
  res.json(rows);
};

export const toggleFavorite: RequestHandler = async (req, res) => {
  const { stack_user_id, favorite_stack_user_id } = req.body ?? {};
  if (!stack_user_id || !favorite_stack_user_id) return res.status(400).json({ error: "stack_user_id and favorite_stack_user_id required" });
  const existing = await query<{ id: number }>(
    `SELECT id FROM favorites WHERE stack_user_id=$1 AND favorite_stack_user_id=$2 LIMIT 1`,
    [stack_user_id, favorite_stack_user_id],
  );
  if (existing[0]) {
    await query(`DELETE FROM favorites WHERE id=$1`, [existing[0].id]);
    return res.json({ favorited: false });
  }
  await query(`INSERT INTO favorites (stack_user_id, favorite_stack_user_id) VALUES ($1,$2)`, [stack_user_id, favorite_stack_user_id]);
  res.json({ favorited: true });
};
