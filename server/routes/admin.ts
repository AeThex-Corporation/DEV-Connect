import express, { RequestHandler } from "express";
import type { RequestHandler } from "express";
import { getSupabase } from "../supabase";
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
  const supabase = getSupabase();
  const { data: fds, error: fdErr } = await supabase
    .from("featured_devs")
    .select("stack_user_id, created_at")
    .order("created_at", { ascending: false });
  if (fdErr) return res.status(500).json({ error: fdErr.message });
  const ids = (fds || []).map((r) => r.stack_user_id);
  if (ids.length === 0) return res.json([]);
  const { data: profiles, error: pErr } = await supabase
    .from("profiles")
    .select("stack_user_id, display_name, role, tags, avatar_url, created_at")
    .in("stack_user_id", ids);
  if (pErr) return res.status(500).json({ error: pErr.message });
  res.json(profiles || []);
});

router.post("/featured/devs", requireAdmin, async (req, res) => {
  const { stack_user_id } = req.body ?? {};
  if (!stack_user_id)
    return res.status(400).json({ error: "stack_user_id required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("featured_devs")
    .upsert({ stack_user_id }, { onConflict: "stack_user_id" })
    .select("id, stack_user_id, created_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? { ok: true });
});

router.delete("/featured/devs/:stackUserId", requireAdmin, async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  const supabase = getSupabase();
  const { error } = await supabase
    .from("featured_devs")
    .delete()
    .eq("stack_user_id", stackUserId);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Featured jobs
router.get("/featured/jobs", requireAdmin, async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("featured_jobs")
    .select(
      "job_id, created_at, jobs:job_id(id, title, role, comp, genre, scope, description, created_by, created_at)",
    )
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json((data || []).map((r: any) => r.jobs));
});

router.post("/featured/jobs", requireAdmin, async (req, res) => {
  const { job_id } = req.body ?? {};
  if (!job_id) return res.status(400).json({ error: "job_id required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("featured_jobs")
    .upsert({ job_id }, { onConflict: "job_id" })
    .select("id, job_id, created_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? { ok: true });
});

router.delete("/featured/jobs/:jobId", requireAdmin, async (req, res) => {
  const { jobId } = req.params as { jobId: string };
  const supabase = getSupabase();
  const { error } = await supabase
    .from("featured_jobs")
    .delete()
    .eq("job_id", Number(jobId));
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Admin status (no requireAdmin; reports user status from header)
router.get("/me", async (req, res) => {
  const id = req.header("x-user-id") || undefined;
  const adminEnv = (process.env.ADMIN_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const ownerEnv = (process.env.OWNER_IDS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const isAdminDirect = id ? adminEnv.includes(id) : false;
  const isOwnerDirect = id ? ownerEnv.includes(id) : false;
  const localEmail = id && id.startsWith("local:") ? id.slice(6) : undefined;
  const is_admin = Boolean(
    isAdminDirect || (localEmail ? adminEnv.includes(localEmail) : false),
  );
  const is_owner = Boolean(
    isOwnerDirect ||
      (localEmail ? ownerEnv.includes(localEmail) : false) ||
      (!ownerEnv.length && // fallback: first admin is owner if none specified
        adminEnv.length > 0 &&
        ((id && adminEnv[0] === id) ||
          (localEmail && adminEnv[0] === localEmail))),
  );
  res.json({ is_admin, is_owner });
});

// Reports moderation
router.get("/reports", requireAdmin, async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reports")
    .select("id, subject, description, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.patch("/reports/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("reports")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", Number(id))
    .select("id, subject, description, status, created_at, updated_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? null);
});

// Support tickets
router.get("/tickets", requireAdmin, async (_req, res) => {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .select("id, stack_user_id, subject, body, status, created_at, updated_at")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post("/tickets", async (req, res) => {
  const { stack_user_id, subject, body } = req.body ?? {};
  if (!subject || !body)
    return res.status(400).json({ error: "subject and body required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .insert({ stack_user_id: stack_user_id ?? null, subject, body })
    .select("id, stack_user_id, subject, body, status, created_at, updated_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

router.patch("/tickets/:id", requireAdmin, async (req, res) => {
  const { id } = req.params as { id: string };
  const { status } = req.body ?? {};
  if (!status) return res.status(400).json({ error: "status required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("tickets")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", Number(id))
    .select("id, stack_user_id, subject, body, status, created_at, updated_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? null);
});

// Verification management
router.get("/profiles/:stackUserId", requireAdmin, async (req, res) => {
  const { stackUserId } = req.params as { stackUserId: string };
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profiles")
    .select("id, stack_user_id, display_name, role, is_verified")
    .eq("stack_user_id", stackUserId)
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? null);
});

router.patch(
  "/profiles/:stackUserId/verify",
  requireAdmin,
  async (req, res) => {
    const { stackUserId } = req.params as { stackUserId: string };
    const { is_verified } = req.body ?? {};
    if (typeof is_verified !== "boolean")
      return res.status(400).json({ error: "is_verified boolean required" });
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("profiles")
      .update({ is_verified, updated_at: new Date().toISOString() })
      .eq("stack_user_id", stackUserId)
      .select("id, stack_user_id, display_name, role, is_verified, updated_at")
      .limit(1)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? null);
  },
);

// Badge management
router.get("/badges", requireAdmin, async (req, res) => {
  const stack_user_id = String(req.query.stack_user_id || "");
  const supabase = getSupabase();
  let qb = supabase
    .from("profile_badges")
    .select("id, stack_user_id, slug, label, icon, color, created_at")
    .order("created_at", { ascending: false });
  if (stack_user_id) qb = qb.eq("stack_user_id", stack_user_id);
  const { data, error } = await qb;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data || []);
});

router.post("/badges", requireAdmin, async (req, res) => {
  const { stack_user_id, slug, label, icon, color } = req.body ?? {};
  if (!stack_user_id || !slug)
    return res.status(400).json({ error: "stack_user_id and slug required" });
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("profile_badges")
    .upsert(
      {
        stack_user_id,
        slug,
        label: label ?? null,
        icon: icon ?? null,
        color: color ?? null,
      },
      { onConflict: "stack_user_id,slug" },
    )
    .select("id, stack_user_id, slug, label, icon, color, created_at")
    .limit(1)
    .maybeSingle();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? null);
});

router.delete("/badges/:stackUserId/:slug", requireAdmin, async (req, res) => {
  const { stackUserId, slug } = req.params as {
    stackUserId: string;
    slug: string;
  };
  const supabase = getSupabase();
  const { error } = await supabase
    .from("profile_badges")
    .delete()
    .eq("stack_user_id", stackUserId)
    .eq("slug", slug);
  if (error) return res.status(500).json({ error: error.message });
  res.json({ ok: true });
});

// Data migration endpoint (Neon -> Supabase)
router.post("/migrate/neon-to-supabase", requireAdmin, async (_req, res) => {
  const supabase = getSupabase();
  async function copy(table: string, selectSql: string, onConflict?: string) {
    const rows = await query<any>(selectSql);
    if (!rows.length) return { table, count: 0 };
    const chunkSize = 500;
    let total = 0;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      const { error } = await supabase
        .from(table)
        .upsert(chunk, onConflict ? { onConflict } : undefined);
      if (error) throw new Error(`${table}: ${error.message}`);
      total += chunk.length;
    }
    return { table, count: total };
  }
  try {
    const results = [] as any[];
    results.push(
      await copy("profiles", "SELECT * FROM profiles", "stack_user_id"),
    );
    results.push(
      await copy("users_local", "SELECT * FROM users_local", "email"),
    );
    results.push(await copy("jobs", "SELECT * FROM jobs", "id"));
    results.push(
      await copy("applications", "SELECT * FROM applications", "id"),
    );
    results.push(await copy("messages", "SELECT * FROM messages", "id"));
    results.push(
      await copy(
        "favorites",
        "SELECT * FROM favorites",
        "stack_user_id,favorite_stack_user_id",
      ),
    );
    results.push(await copy("reports", "SELECT * FROM reports", "id"));
    results.push(
      await copy(
        "featured_devs",
        "SELECT * FROM featured_devs",
        "stack_user_id",
      ),
    );
    results.push(
      await copy(
        "profile_badges",
        "SELECT * FROM profile_badges",
        "stack_user_id,slug",
      ),
    );
    results.push(
      await copy(
        "ratings",
        "SELECT * FROM ratings",
        "rater_stack_user_id,ratee_stack_user_id",
      ),
    );
    results.push(
      await copy("featured_jobs", "SELECT * FROM featured_jobs", "job_id"),
    );
    results.push(await copy("tickets", "SELECT * FROM tickets", "id"));
    results.push(
      await copy("password_resets", "SELECT * FROM password_resets", "token"),
    );
    results.push(
      await copy("presence", "SELECT * FROM presence", "stack_user_id"),
    );
    res.json({ ok: true, results });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
