import { useSearchParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/lib/fake-stack";

export default function AuthReset() {
  const [sp] = useSearchParams();
  const nav = useNavigate();
  const { signin } = useAuth();
  const [token, setToken] = useState(sp.get("token") || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const r = await fetch("/api/auth/reset", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password: password }),
    });
    if (!r.ok) {
      setError((await r.json()).error || "Failed");
      return;
    }
    // After reset, send user to sign in
    nav("/auth");
  };
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-6 grid gap-3">
      <h1 className="text-xl font-bold">Set a new password</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input
          className="rounded-md border px-3 py-2"
          placeholder="Reset token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
        />
        <input
          className="rounded-md border px-3 py-2"
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button
          className="rounded-md bg-primary text-primary-foreground px-4 py-2"
          type="submit"
        >
          Reset password
        </button>
      </form>
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
