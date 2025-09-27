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
import { signup, login } from "./routes/auth-local";
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

  return app;
}
