import React, { useState } from "react";
import { useAuth, StackTheme } from "@/lib/fake-stack";

export default function AuthInner() {
  const { signin } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { getSupabase } = await import("@/lib/supabase");
      const sb = getSupabase();
      if (sb) {
        if (mode === "signup") {
          const { error } = await sb.auth.signUp({
            email,
            password,
            options: { data: { name } },
          });
          if (error) throw error;
        } else {
          const { error } = await sb.auth.signInWithPassword({
            email,
            password,
          });
          if (error) throw error;
        }
        await fetch("/api/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stack_user_id: `local:${email}`,
            email,
            display_name: name || email.split("@")[0],
          }),
        });
        signin(`local:${email}`, name || email.split("@")[0]);
      } else {
        const url = mode === "signup" ? "/api/auth/signup" : "/api/auth/login";
        const body: any = { email, password };
        if (mode === "signup") body.display_name = name;
        const r = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        if (!r.ok) throw new Error((await r.json()).error || "Auth failed");
        const data = await r.json();
        signin(data.id, data.displayName);
      }
      window.location.replace("/onboarding");
    } catch (err: any) {
      setError(err.message || "Auth failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl animate-page-fade">
      <StackTheme>
        <div className="grid md:grid-cols-2 rounded-2xl overflow-hidden border bg-card">
          <div className="hidden md:block bg-gradient-to-br from-primary/15 via-violet-500/10 to-indigo-500/10 p-8">
            <div className="h-full w-full rounded-xl border bg-background/50 p-6">
              <div className="text-sm font-medium text-primary">
                RBX Connect
              </div>
              <h2 className="mt-2 text-3xl font-extrabold tracking-tight">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Snappy auth, secure accounts, and a modern experience.
              </p>
              <ul className="mt-6 space-y-2 text-sm text-muted-foreground list-disc list-inside">
                <li>Unique Passport ID to verify ownership</li>
                <li>Fast onboarding to your dashboard</li>
                <li>Privacy-forward local auth</li>
              </ul>
            </div>
          </div>
          <div className="p-6 sm:p-8 grid gap-4">
            <div className="flex items-center gap-3">
              <button
                className={`text-sm font-medium ${mode === "signup" ? "text-foreground" : "text-muted-foreground"}`}
                onClick={() => setMode("signup")}
              >
                Create account
              </button>
              <span className="text-muted-foreground">·</span>
              <button
                className={`text-sm font-medium ${mode === "signin" ? "text-foreground" : "text-muted-foreground"}`}
                onClick={() => setMode("signin")}
              >
                Sign in
              </button>
            </div>
            <h1 className="text-2xl font-bold">
              {mode === "signup"
                ? "Create your account"
                : "Sign in to RBX Connect"}
            </h1>
            <form onSubmit={submit} className="grid gap-3">
              {mode === "signup" && (
                <label className="grid gap-1 text-sm">
                  <span className="text-muted-foreground">Display name</span>
                  <input
                    className="rounded-md border bg-background px-3 py-2"
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
              )}
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Email</span>
                <input
                  className="rounded-md border bg-background px-3 py-2"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Password</span>
                <input
                  className="rounded-md border bg-background px-3 py-2"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              {mode === "signin" && (
                <a
                  href="/auth/forgot"
                  className="text-xs underline text-muted-foreground"
                >
                  Forgot password?
                </a>
              )}
              {error && <div className="text-sm text-red-600">{error}</div>}
              <button
                className="rounded-md bg-primary text-primary-foreground px-4 py-2 disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Please wait…"
                  : mode === "signup"
                    ? "Create account"
                    : "Sign in"}
              </button>
            </form>
          </div>
        </div>
      </StackTheme>
    </div>
  );
}
