import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import {
  getMyProfile,
  getPublicProfile,
  listProfiles,
  upsertProfile,
} from "./routes/profiles";
import {
  listJobs,
  createJob,
  getJob,
  applyToJob,
  listIncomingApplications,
} from "./routes/jobs";
import { listThread, sendMessage } from "./routes/messages";
import { listFavorites, toggleFavorite } from "./routes/favorites";
import { claimPassport, getPassport } from "./routes/passport";
import { submitReport } from "./routes/reports";
import authRouter from "./auth";
import {
  signup,
  login,
  changePassword,
  forgotPassword,
  resetPassword,
} from "./routes/auth-local";
import { query } from "./db";
import { getSupabase } from "./supabase";
import adminRouter from "./routes/admin";
import { listFeaturedDevs, listFeaturedJobs } from "./routes/featured";

async function ensureSchema() {
  // If Supabase is configured, assume schema is managed there
  if (process.env.SUPABASE_URL) return;
  // Otherwise, ensure local Postgres schema (development fallback)
  // Profiles
  await query(
    `CREATE TABLE IF NOT EXISTS profiles (
      id SERIAL PRIMARY KEY,
      stack_user_id TEXT UNIQUE NOT NULL,
      display_name TEXT,
      role TEXT,
      tags TEXT[],
      contact_discord TEXT,
      contact_roblox TEXT,
      contact_twitter TEXT,
      availability TEXT,
      trust_score INTEGER,
      portfolio JSONB,
      avatar_url TEXT,
      banner_url TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  );
  await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
  await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS banner_url TEXT`);
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS passport_id TEXT UNIQUE`,
  );
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email TEXT UNIQUE`,
  );
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`,
  );
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS payment_pref TEXT`,
  );
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS devforum_url TEXT`,
  );
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS discord_handle TEXT`,
  );
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roblox_user_id TEXT`,
  );
  await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS github_url TEXT`);
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS artstation_url TEXT`,
  );
  await query(`ALTER TABLE profiles ADD COLUMN IF NOT EXISTS youtube_url TEXT`);
  await query(
    `ALTER TABLE profiles ADD COLUMN IF NOT EXISTS roblox_game_url TEXT`,
  );

  // Local users (email unique)
  await query(
    `CREATE TABLE IF NOT EXISTS users_local (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Jobs
  await query(
    `CREATE TABLE IF NOT EXISTS jobs (
      id SERIAL PRIMARY KEY,
      title TEXT NOT NULL,
      role TEXT NOT NULL,
      comp TEXT NOT NULL,
      genre TEXT,
      scope TEXT,
      description TEXT,
      created_by TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS applications (
      id SERIAL PRIMARY KEY,
      job_id INTEGER REFERENCES jobs(id) ON DELETE CASCADE,
      applicant_stack_user_id TEXT NOT NULL,
      message TEXT,
      status TEXT DEFAULT 'pending',
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Messages
  await query(
    `CREATE TABLE IF NOT EXISTS messages (
      id SERIAL PRIMARY KEY,
      thread_id TEXT NOT NULL,
      sender_stack_user_id TEXT NOT NULL,
      recipient_stack_user_id TEXT NOT NULL,
      body TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Favorites
  await query(
    `CREATE TABLE IF NOT EXISTS favorites (
      id SERIAL PRIMARY KEY,
      stack_user_id TEXT NOT NULL,
      favorite_stack_user_id TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (stack_user_id, favorite_stack_user_id)
    )`,
  );

  // Reports table
  await query(
    `CREATE TABLE IF NOT EXISTS reports (
      id SERIAL PRIMARY KEY,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Featured
  await query(
    `CREATE TABLE IF NOT EXISTS featured_devs (
      id SERIAL PRIMARY KEY,
      stack_user_id TEXT UNIQUE NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Profile badges
  await query(
    `CREATE TABLE IF NOT EXISTS profile_badges (
      id SERIAL PRIMARY KEY,
      stack_user_id TEXT NOT NULL,
      slug TEXT NOT NULL,
      label TEXT,
      icon TEXT,
      color TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (stack_user_id, slug)
    )`,
  );

  // Ratings
  await query(
    `CREATE TABLE IF NOT EXISTS ratings (
      id SERIAL PRIMARY KEY,
      rater_stack_user_id TEXT NOT NULL,
      ratee_stack_user_id TEXT NOT NULL,
      score INTEGER NOT NULL CHECK (score >= 1 AND score <= 5),
      comment TEXT,
      created_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE (rater_stack_user_id, ratee_stack_user_id)
    )`,
  );
  await query(
    `CREATE TABLE IF NOT EXISTS featured_jobs (
      id SERIAL PRIMARY KEY,
      job_id INTEGER UNIQUE NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Support tickets
  await query(
    `CREATE TABLE IF NOT EXISTS tickets (
      id SERIAL PRIMARY KEY,
      stack_user_id TEXT,
      subject TEXT NOT NULL,
      body TEXT NOT NULL,
      status TEXT DEFAULT 'open',
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Password resets
  await query(
    `CREATE TABLE IF NOT EXISTS password_resets (
      id SERIAL PRIMARY KEY,
      email TEXT NOT NULL,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMPTZ NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Presence
  await query(
    `CREATE TABLE IF NOT EXISTS presence (
      id SERIAL PRIMARY KEY,
      stack_user_id TEXT UNIQUE,
      updated_at TIMESTAMPTZ DEFAULT now()
    )`,
  );

  // Applications viewed flag
  await query(
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS viewed_by_owner BOOLEAN DEFAULT false`,
  );
  await query(
    `ALTER TABLE applications ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ`,
  );
}

export function createServer() {
  const app = express();

  // Ensure DB schema on cold start
  ensureSchema().catch(() => {});

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: "8mb" }));
  app.use(express.urlencoded({ extended: true, limit: "8mb" }));

  // Auth router (includes session and passport)
  app.use("/api", authRouter);
  app.post("/api/auth/signup", signup);
  app.post("/api/auth/login", login);
  app.post("/api/auth/change-password", changePassword);
  app.post("/api/auth/forgot", forgotPassword);
  app.post("/api/auth/reset", resetPassword);

  // Admin routes
  app.use("/api/admin", adminRouter);

  // Public badges API
  app.get("/api/badges/:stackUserId", async (req, res) => {
    const { stackUserId } = req.params as { stackUserId: string };
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("profile_badges")
      .select("id, stack_user_id, slug, label, icon, color, created_at")
      .eq("stack_user_id", stackUserId)
      .order("created_at", { ascending: false });
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? []);
  });

  // Public ratings API
  app.get("/api/ratings/:stackUserId", async (req, res) => {
    const { stackUserId } = req.params as { stackUserId: string };
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("ratings")
      .select("score")
      .eq("ratee_stack_user_id", stackUserId);
    if (error) return res.status(500).json({ error: error.message });
    const scores = (data || []).map((r: any) => r.score as number);
    const count = scores.length;
    const average = count ? scores.reduce((a, b) => a + b, 0) / count : 0;
    res.json({ average, count });
  });

  app.post("/api/ratings", async (req, res) => {
    const { rater_stack_user_id, ratee_stack_user_id, score, comment } =
      req.body ?? {};
    if (!rater_stack_user_id || !ratee_stack_user_id || !score)
      return res.status(400).json({ error: "rater, ratee and score required" });
    const supabase = getSupabase();
    // Check collaboration relation
    const { data: rel, error: relErr } = await supabase
      .from("applications")
      .select("id, status, jobs:job_id(created_by)")
      .or(
        `and(applicant_stack_user_id.eq.${rater_stack_user_id},jobs.created_by.eq.${ratee_stack_user_id}),and(applicant_stack_user_id.eq.${ratee_stack_user_id},jobs.created_by.eq.${rater_stack_user_id})`,
      )
      .in("status", ["hired", "completed"])
      .limit(1);
    if (relErr) return res.status(500).json({ error: relErr.message });
    if (!rel || rel.length === 0)
      return res
        .status(403)
        .json({ error: "rating not allowed without collaboration" });
    const { data, error } = await supabase
      .from("ratings")
      .upsert(
        {
          rater_stack_user_id,
          ratee_stack_user_id,
          score,
          comment: comment ?? null,
          created_at: new Date().toISOString(),
        },
        { onConflict: "rater_stack_user_id,ratee_stack_user_id" },
      )
      .select("id, rater_stack_user_id, ratee_stack_user_id, score, comment, created_at")
      .limit(1)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data);
  });

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

  // Featured (public)
  app.get("/api/featured/devs", listFeaturedDevs);
  app.get("/api/featured/jobs", listFeaturedJobs);

  // Profiles
  app.get("/api/profile/me", getMyProfile);
  app.get("/api/profiles", listProfiles);
  app.get("/api/profile/:stackUserId", getPublicProfile);
  app.post("/api/profile", upsertProfile);

  // Passport
  app.get("/api/passport/:stackUserId", getPassport);
  app.post("/api/passport/claim", claimPassport);

  // Jobs
  app.get("/api/jobs", listJobs);
  app.post("/api/jobs", createJob);
  app.get("/api/jobs/:id", getJob);
  app.post("/api/jobs/:id/apply", applyToJob);
  // Jobs count for a specific owner
  app.get("/api/jobs/mine/count", async (req, res) => {
    const owner = String(req.query.owner || "");
    if (!owner) return res.json({ count: 0 });
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("created_by", owner);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ count: count || 0 });
  });

  // Messages
  app.get("/api/messages", listThread);
  app.post("/api/messages", sendMessage);

  // Applications
  app.get("/api/applications/incoming", listIncomingApplications);
  app.patch("/api/applications/:id/status", async (req, res) => {
    const { id } = req.params as { id: string };
    const { status } = req.body ?? {};
    const owner = req.header("x-user-id") || "";
    if (!status) return res.status(400).json({ error: "status required" });
    const supabase = getSupabase();
    const { data: apps, error: ownerErr } = await supabase
      .from("applications")
      .select("id, job_id, jobs:job_id(created_by)")
      .eq("id", Number(id))
      .limit(1)
      .maybeSingle();
    if (ownerErr) return res.status(500).json({ error: ownerErr.message });
    if (!apps) return res.status(404).json({ error: "not found" });
    if (!owner || apps.jobs?.created_by !== owner)
      return res.status(403).json({ error: "forbidden" });
    const completed_at = status === "completed" ? new Date().toISOString() : null;
    const { data, error } = await supabase
      .from("applications")
      .update({ status, completed_at })
      .eq("id", Number(id))
      .select("id, job_id, applicant_stack_user_id, message, status, created_at, completed_at")
      .limit(1)
      .maybeSingle();
    if (error) return res.status(500).json({ error: error.message });
    res.json(data ?? null);
  });
  app.get("/api/applications/mine/count", async (req, res) => {
    const applicant = String(req.query.applicant || "");
    if (!applicant) return res.json({ count: 0 });
    const supabase = getSupabase();
    const { count, error } = await supabase
      .from("applications")
      .select("id", { count: "exact", head: true })
      .eq("applicant_stack_user_id", applicant);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ count: count || 0 });
  });

  // Favorites
  app.get("/api/favorites", listFavorites);
  app.post("/api/favorites/toggle", toggleFavorite);

  // Reports
  app.post("/api/report", submitReport);

  // Presence
  app.post("/api/presence/ping", async (req, res) => {
    const { stack_user_id } = req.body ?? {};
    if (!stack_user_id)
      return res.status(400).json({ error: "stack_user_id required" });
    const supabase = getSupabase();
    // Upsert by unique stack_user_id
    const { error } = await supabase
      .from("presence")
      .upsert({ stack_user_id, updated_at: new Date().toISOString() }, { onConflict: "stack_user_id" });
    if (error) return res.status(500).json({ error: error.message });
    res.json({ ok: true });
  });
  app.get("/api/presence/online", async (_req, res) => {
    const supabase = getSupabase();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const { count, error } = await supabase
      .from("presence")
      .select("id", { count: "exact", head: true })
      .gt("updated_at", fiveMinutesAgo);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ online: count || 0 });
  });

  // Incoming applications count for owner
  app.get("/api/applications/incoming/count", async (req, res) => {
    const owner = String(req.query.owner || "");
    if (!owner) return res.json({ count: 0 });
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("applications")
      .select("id, status, jobs:job_id(created_by)")
      .eq("status", "pending")
      .eq("jobs.created_by", owner);
    if (error) return res.status(500).json({ error: error.message });
    res.json({ count: (data || []).length });
  });

  // Project history (completed collaborations)
  app.get("/api/history/:stackUserId", async (req, res) => {
    const { stackUserId } = req.params as { stackUserId: string };
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("applications")
      .select("id, job_id, status, completed_at, applicant_stack_user_id, jobs:job_id(title, created_by)")
      .eq("status", "completed")
      .or(`applicant_stack_user_id.eq.${stackUserId},jobs.created_by.eq.${stackUserId}`)
      .order("completed_at", { ascending: false, nullsFirst: false })
      .limit(50);
    if (error) return res.status(500).json({ error: error.message });
    const rows = (data || []).map((r: any) => ({
      id: r.id,
      job_id: r.job_id,
      status: r.status,
      completed_at: r.completed_at,
      title: r.jobs?.title,
      created_by: r.jobs?.created_by,
      applicant_stack_user_id: r.applicant_stack_user_id,
    }));
    res.json(rows);
  });

  // Site stats
  app.get("/api/stats", async (_req, res) => {
    const supabase = getSupabase();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    const [profiles, verifiedProfiles, jobs, applications, messages, online] =
      await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .is("is_verified", true),
        supabase.from("jobs").select("id", { count: "exact", head: true }),
        supabase
          .from("applications")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("messages")
          .select("id", { count: "exact", head: true }),
        supabase
          .from("presence")
          .select("id", { count: "exact", head: true })
          .gt("updated_at", fiveMinutesAgo),
      ]);
    res.json({
      profiles: profiles.count || 0,
      verifiedProfiles: verifiedProfiles.count || 0,
      jobs: jobs.count || 0,
      applications: applications.count || 0,
      messages: messages.count || 0,
      online: online.count || 0,
    });
  });

  return app;
}
