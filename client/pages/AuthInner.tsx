import React, { useState } from "react";
import { useAuth, StackTheme } from "@/lib/fake-stack";

export default function AuthInner() {
  const { signin } = useAuth();
  const [mode, setMode] = useState<"signin" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
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
      window.location.replace("/onboarding");
    } catch (err: any) {
      setError(err.message || "Auth failed");
    }
  }

  return (
    <div className="mx-auto max-w-md grid gap-4">
      <StackTheme>
        <div className="rounded-xl border bg-card p-5 grid gap-4">
          <h1 className="text-xl font-bold">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h1>
          <div className="flex gap-2 text-sm">
            <button
              className={`underline-offset-4 ${mode === "signup" ? "underline" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign up
            </button>
            <span className="text-muted-foreground">·</span>
            <button
              className={`underline-offset-4 ${mode === "signin" ? "underline" : ""}`}
              onClick={() => setMode("signin")}
            >
              Sign in
            </button>
          </div>
          <form onSubmit={submit} className="grid gap-3">
            {mode === "signup" && (
              <input
                className="rounded-md border px-3 py-2"
                placeholder="Display name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            )}
            <input
              className="rounded-md border px-3 py-2"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              className="rounded-md border px-3 py-2"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            {mode === "signin" && (
              <a href="/auth/forgot" className="text-xs underline text-muted-foreground">Forgot password?</a>
            )}
            {error && <div className="text-sm text-red-600">{error}</div>}
            <button
              className="rounded-md bg-primary text-primary-foreground px-4 py-2"
              type="submit"
            >
              {mode === "signup" ? "Create account" : "Sign in"}
            </button>
          </form>
        </div>
      </StackTheme>
    </div>
  );
}
