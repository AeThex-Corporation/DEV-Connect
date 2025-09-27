import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import { getMyProfile, getPublicProfile, listProfiles, upsertProfile } from "./routes/profiles";
import { listJobs, createJob, getJob, applyToJob } from "./routes/jobs";
import { listThread, sendMessage } from "./routes/messages";
import { listFavorites, toggleFavorite } from "./routes/favorites";
import { submitReport } from "./routes/reports";

export function createServer() {
  const app = express();

  // Middleware
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Example API routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/demo", handleDemo);

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

  return app;
}
