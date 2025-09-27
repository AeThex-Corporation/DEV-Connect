import express, { RequestHandler } from "express";
import { query } from "../db";

const router = express.Router();

function isAdmin(id: string | undefined): boolean {
  const env = process.env.ADMIN_IDS || ""; // comma-separated ids (e.g., local:you@example.com)
  const list = env
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!id) return false;
  if (list.includes(id)) return true;
  if (id.startsWith("local:")) {
    const email = id.slice("local:".length);
    if (list.includes(email)) return true;
  }
  return false;
}

const requireAdmin: RequestHandler = (req, res, next) => {
  const id = req.header("x-user-id") || undefined;
  if (!isAdmin(id)) return res.status(403).json({ error: "forbidden" });
  next();
};

// Featured devs
router.get("/featured/devs", requireAdmin, async (_req, res) => {
  const rows = await query(
    `SELECT fd.id, fd.stack_user_id, p.display_name, p.role, p.tags, p.avatar_url, p.created_at
     FROM featured_devs fd
     LEFT JOIN profiles p ON p.stack_user_id = fd.stack_user_id
     ORDER BY fd.created_at DESC`,
  );
  res.json(rows);
});

router.post("/featured/devs", requireAdmin, async (req, res) => {
  const { stack_user_id } = req.body ?? {};
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  const rows = await query(
    `INSERT INTO featured_devs (stack_user_id) VALUES ($1)
     ON CONFLICT (stack_user_id) DO NOTHING
     RETURNING id, stack_user_id, created_at`,
    [stack_user_id],
  );
  res.json(rows[0] ?? { ok: true });
});

router.delete("/featured/devs/:stackUserId", requireAdmin, async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  await query(`DELETE FROM featured_devs WHERE stack_user_id = $1`, [
    stackUserId,
  ]);
  res.json({ ok: true });
});

// Featured jobs
router.get("/featured/jobs", requireAdmin, async (_req, res) => {
  const rows = await query(
    `SELECT fj.id, j.* FROM featured_jobs fj LEFT JOIN jobs j ON j.id = fj.job_id ORDER BY fj.created_at DESC`,
  );
  res.json(rows);
});

router.post("/featured/jobs", requireAdmin, async (req, res) => {
  const { job_id } = req.body ?? {};
  if (!job_id) return res.status(400).json({ error: "job_id required" });
  const rows = await query(
    `INSERT INTO featured_jobs (job_id) VALUES ($1)
     ON CONFLICT (job_id) DO NOTHING
     RETURNING id, job_id, created_at`,
    [job_id],
  );
  res.json(rows[0] ?? { ok: true });
});

router.delete("/featured/jobs/:jobId", requireAdmin, async (req, res) => {
  const { jobId } = req.params as { jobId: string };
  await query(`DELETE FROM featured_jobs WHERE job_id = $1`, [jobId]);
  res.json({ ok: true });
});

// Reports moderation
router.get("/reports", requireAdmin, async (_req, res) => {
  const rows = await query(
    `SELECT id, subject, description, status, created_at, updated_at FROM reports ORDER BY created_at DESC LIMIT 200`,
  );
  res.json(rows);
});

router.patch("/reports/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status required" });
  const rows = await query(
    `UPDATE reports SET status=$1, updated_at=now() WHERE id=$2 RETURNING id, subject, description, status, created_at, updated_at`,
    [status, id],
  );
  res.json(rows[0] ?? null);
});

// Support tickets
router.get("/tickets", requireAdmin, async (_req, res) => {
  const rows = await query(
    `SELECT id, stack_user_id, subject, body, status, created_at, updated_at FROM tickets ORDER BY created_at DESC LIMIT 200`,
  );
  res.json(rows);
});

router.post("/tickets", async (req, res) => {
  const { stack_user_id, subject, body } = req.body ?? {};
  if (!subject || !body)
    return res.status(400).json({ error: "subject and body required" });
  const rows = await query(
    `INSERT INTO tickets (stack_user_id, subject, body) VALUES ($1,$2,$3)
     RETURNING id, stack_user_id, subject, body, status, created_at, updated_at`,
    [stack_user_id ?? null, subject, body],
  );
  res.status(201).json(rows[0]);
});

router.patch("/tickets/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status required" });
  const rows = await query(
    `UPDATE tickets SET status=$1, updated_at=now() WHERE id=$2
     RETURNING id, stack_user_id, subject, body, status, created_at, updated_at`,
    [status, id],
  );
  res.json(rows[0] ?? null);
});

export default router;
