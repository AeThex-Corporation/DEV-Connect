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
import { listJobs, createJob, getJob, applyToJob } from "./routes/jobs";
import { listThread, sendMessage } from "./routes/messages";
import { listFavorites, toggleFavorite } from "./routes/favorites";
import { submitReport } from "./routes/reports";
import authRouter from "./auth";
import { signup, login, changePassword, forgotPassword, resetPassword } from "./routes/auth-local";
import { query } from "./db";
import adminRouter from "./routes/admin";
import { listFeaturedDevs, listFeaturedJobs } from "./routes/featured";

async function ensureSchema() {
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
  await query(`ALTER TABLE applications ADD COLUMN IF NOT EXISTS viewed_by_owner BOOLEAN DEFAULT false`);
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

  // Jobs
  app.get("/api/jobs", listJobs);
  app.post("/api/jobs", createJob);
  app.get("/api/jobs/:id", getJob);
  app.post("/api/jobs/:id/apply", applyToJob);

  // Messages
  app.get("/api/messages", listThread);
  app.post("/api/messages", sendMessage);

  // Favorites
  app.get("/api/favorites", listFavorites);
  app.post("/api/favorites/toggle", toggleFavorite);

  // Reports
  app.post("/api/report", submitReport);

  // Presence
  app.post("/api/presence/ping", async (req, res) => {
    const { stack_user_id } = req.body ?? {};
    if (!stack_user_id) return res.status(400).json({ error: "stack_user_id required" });
    await query(
      `INSERT INTO presence (stack_user_id, updated_at) VALUES ($1, now())
       ON CONFLICT (stack_user_id) DO UPDATE SET updated_at=now()`,
      [stack_user_id],
    );
    res.json({ ok: true });
  });
  app.get("/api/presence/online", async (_req, res) => {
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM presence WHERE updated_at > now() - interval '5 minutes'`,
    );
    res.json({ online: Number(rows[0]?.count || 0) });
  });

  // Incoming applications count for owner
  app.get("/api/applications/incoming/count", async (req, res) => {
    const owner = String(req.query.owner || "");
    if (!owner) return res.json({ count: 0 });
    const rows = await query<{ count: string }>(
      `SELECT COUNT(*)::text as count FROM applications a JOIN jobs j ON j.id=a.job_id WHERE j.created_by=$1 AND a.status='pending'`,
      [owner],
    );
    res.json({ count: Number(rows[0]?.count || 0) });
  });

  return app;
}
