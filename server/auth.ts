import express, { RequestHandler } from "express";
import session from "express-session";
import passport from "passport";
import {
  Strategy as DiscordStrategy,
  Profile as DiscordProfile,
} from "passport-discord";
import {
  Strategy as GitHubStrategy,
  Profile as GitHubProfile,
} from "passport-github2";

const router = express.Router();

const {
  DISCORD_CLIENT_ID,
  DISCORD_CLIENT_SECRET,
  DISCORD_CALLBACK_URL,
  GITHUB_CLIENT_ID,
  GITHUB_CLIENT_SECRET,
  GITHUB_CALLBACK_URL,
  SESSION_SECRET,
} = process.env;

// Session (dev: MemoryStore)
router.use(
  session({
    secret: SESSION_SECRET || "dev-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false },
  }),
);

router.use(passport.initialize());
router.use(passport.session());

passport.serializeUser((user: any, done) => done(null, user));
passport.deserializeUser((obj: any, done) => done(null, obj));

if (DISCORD_CLIENT_ID && DISCORD_CLIENT_SECRET && DISCORD_CALLBACK_URL) {
  passport.use(
    new DiscordStrategy(
      {
        clientID: DISCORD_CLIENT_ID,
        clientSecret: DISCORD_CLIENT_SECRET,
        callbackURL: DISCORD_CALLBACK_URL,
        scope: ["identify"],
      },
      (accessToken, refreshToken, profile: DiscordProfile, done) => {
        const user = {
          provider: "discord",
          id: `discord:${profile.id}`,
          displayName: profile.username,
          avatar: profile.avatar,
        };
        return done(null, user);
      },
    ),
  );
}

if (GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET && GITHUB_CALLBACK_URL) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
        callbackURL: GITHUB_CALLBACK_URL,
      },
      (accessToken, refreshToken, profile: GitHubProfile, done) => {
        const user = {
          provider: "github",
          id: `github:${profile.id}`,
          displayName: profile.username || profile.displayName,
          avatar: profile.photos?.[0]?.value,
        };
        return done(null, user);
      },
    ),
  );
}

const ensureConfigured: RequestHandler = (req, res, next) => {
  if (!DISCORD_CLIENT_ID && !GITHUB_CLIENT_ID) {
    return res.status(500).json({ error: "OAuth not configured" });
  }
  next();
};

// Discord
router.get("/auth/discord", ensureConfigured, passport.authenticate("discord"));
router.get(
  "/auth/discord/callback",
  passport.authenticate("discord", { failureRedirect: "/auth?error=discord" }),
  (req, res) => {
    const user = req.user as any;
    res.redirect(
      `/auth/success?id=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.displayName || "User")}`,
    );
  },
);

// GitHub
router.get(
  "/auth/github",
  ensureConfigured,
  passport.authenticate("github", { scope: ["user:email"] }),
);
router.get(
  "/auth/github/callback",
  passport.authenticate("github", { failureRedirect: "/auth?error=github" }),
  (req, res) => {
    const user = req.user as any;
    res.redirect(
      `/auth/success?id=${encodeURIComponent(user.id)}&name=${encodeURIComponent(user.displayName || "User")}`,
    );
  },
);

router.get("/auth/logout", (req, res) => {
  req.logout?.(() => {});
  req.session?.destroy(() => {});
  res.redirect("/");
});

export default router;
