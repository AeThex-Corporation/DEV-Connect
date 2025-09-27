import { useEffect, useState } from "react";
import { useUser, StackTheme } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";

interface ProfilePayload {
  stack_user_id: string;
  display_name?: string;
  role?: string;
  tags?: string[];
  contact_discord?: string;
  contact_roblox?: string;
  contact_twitter?: string;
  availability?: string;
  portfolio?: any[];
  trust_score?: number;
}

export default function ProfileInner() {
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<ProfilePayload | null>(null);

  useEffect(() => {
    if (!user) return;
    const sid = user.id;
    setLoading(true);
    fetch(`/api/profile/me?stackUserId=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then((data) => {
        setForm({
          stack_user_id: sid,
          display_name: data?.display_name ?? user.displayName ?? "",
          role: data?.role ?? "",
          tags: data?.tags ?? [],
          contact_discord: data?.contact_discord ?? "",
          contact_roblox: data?.contact_roblox ?? "",
          contact_twitter: data?.contact_twitter ?? "",
          availability: data?.availability ?? "Open to Work",
          portfolio: data?.portfolio ?? [],
          trust_score: data?.trust_score ?? 0,
        });
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (!user) {
    return (
      <div className="text-center">
        <p className="text-muted-foreground">Please sign in to edit your profile.</p>
      </div>
    );
  }

  if (!form) return null;

  const save = async () => {
    setLoading(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
  };

  return (
    <StackTheme>
      <div className="mx-auto max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Your Profile</h1>
          <p className="text-sm text-muted-foreground">Showcase your skills and how to contact you.</p>
        </div>
        <div className="grid gap-4 rounded-xl border bg-card p-5">
          <Field label="Display name">
            <input className="w-full rounded-md border bg-background px-3 py-2" value={form.display_name ?? ""} onChange={(e)=>setForm({ ...form!, display_name: e.target.value })} />
          </Field>
          <Field label="Role">
            <input className="w-full rounded-md border bg-background px-3 py-2" value={form.role ?? ""} onChange={(e)=>setForm({ ...form!, role: e.target.value })} placeholder="Scripter, Builder, Designer..." />
          </Field>
          <Field label="Tags (comma separated)">
            <input className="w-full rounded-md border bg-background px-3 py-2" value={(form.tags ?? []).join(", ")} onChange={(e)=>setForm({ ...form!, tags: e.target.value.split(",").map(s=>s.trim()).filter(Boolean) })} />
          </Field>
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="Discord"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.contact_discord ?? ""} onChange={(e)=>setForm({ ...form!, contact_discord: e.target.value })} /></Field>
            <Field label="Roblox ID"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.contact_roblox ?? ""} onChange={(e)=>setForm({ ...form!, contact_roblox: e.target.value })} /></Field>
            <Field label="Twitter"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.contact_twitter ?? ""} onChange={(e)=>setForm({ ...form!, contact_twitter: e.target.value })} /></Field>
          </div>
          <Field label="Availability">
            <select className="w-full rounded-md border bg-background px-3 py-2" value={form.availability ?? "Open to Work"} onChange={(e)=>setForm({ ...form!, availability: e.target.value })}>
              <option>Open to Work</option>
              <option>Only Networking</option>
              <option>Unavailable</option>
            </select>
          </Field>
          <div className="flex justify-end">
            <Button onClick={save} disabled={loading}>{loading ? "Saving..." : "Save"}</Button>
          </div>
        </div>
      </div>
    </StackTheme>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
