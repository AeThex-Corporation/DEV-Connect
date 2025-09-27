import { useState } from "react";

export default function AuthForgot() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const sb = (await import("@/lib/supabase")).getSupabase();
      if (sb) {
        const { error } = await sb.auth.resetPasswordForEmail(email, {
          redirectTo: `${location.origin}/auth/reset`,
        });
        if (error) throw error;
        setSent("sent");
      } else {
        const r = await fetch("/api/auth/forgot", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        if (!r.ok) throw new Error((await r.json()).error || "Failed");
        const data = await r.json();
        setSent(data.token || "ok");
      }
    } catch (err: any) {
      setError(err.message || "Failed");
    }
  };
  return (
    <div className="mx-auto max-w-md rounded-xl border bg-card p-6 grid gap-3">
      <h1 className="text-xl font-bold">Reset your password</h1>
      <form onSubmit={submit} className="grid gap-3">
        <input
          className="rounded-md border px-3 py-2"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <button
          className="rounded-md bg-primary text-primary-foreground px-4 py-2"
          type="submit"
        >
          Send reset link
        </button>
      </form>
      {sent && (
        <div className="text-sm text-muted-foreground">
          Use this token on the reset page:{" "}
          <code className="bg-muted px-1 py-0.5 rounded">{sent}</code>
        </div>
      )}
      {error && <div className="text-sm text-red-600">{error}</div>}
    </div>
  );
}
