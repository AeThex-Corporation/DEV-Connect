import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useAuth, useUser } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signout } = useAuth();
  const user = useUser();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);

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

  const save = async () => {
    setLoading(true);
    await fetch("/api/profile", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage appearance, account, and profile.</p>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="mt-3 grid gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="theme" checked={theme==='light'} onChange={()=>setTheme('light')} /> Light
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="theme" checked={theme==='dark'} onChange={()=>setTheme('dark')} /> Dark
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="theme" checked={theme==='system'} onChange={()=>setTheme('system')} /> System
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Profile</h2>
        {!form ? (
          <div className="text-sm text-muted-foreground">{loading ? 'Loading...' : 'Sign in to edit your profile.'}</div>
        ) : (
          <div className="mt-3 grid gap-3">
            <Field label="Display name"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.display_name ?? ''} onChange={(e)=>setForm({ ...form, display_name: e.target.value })} /></Field>
            <Field label="Role"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.role ?? ''} onChange={(e)=>setForm({ ...form, role: e.target.value })} placeholder="Scripter, Builder, Designer..." /></Field>
            <Field label="Tags (comma separated)"><input className="w-full rounded-md border bg-background px-3 py-2" value={(form.tags ?? []).join(', ')} onChange={(e)=>setForm({ ...form, tags: e.target.value.split(',').map((s:string)=>s.trim()).filter(Boolean) })} /></Field>
            <div className="grid sm:grid-cols-3 gap-3">
              <Field label="Discord"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.contact_discord ?? ''} onChange={(e)=>setForm({ ...form, contact_discord: e.target.value })} /></Field>
              <Field label="Roblox ID"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.contact_roblox ?? ''} onChange={(e)=>setForm({ ...form, contact_roblox: e.target.value })} /></Field>
              <Field label="Twitter"><input className="w-full rounded-md border bg-background px-3 py-2" value={form.contact_twitter ?? ''} onChange={(e)=>setForm({ ...form, contact_twitter: e.target.value })} /></Field>
            </div>
            <Field label="Availability">
              <select className="w-full rounded-md border bg-background px-3 py-2" value={form.availability ?? 'Open to Work'} onChange={(e)=>setForm({ ...form, availability: e.target.value })}>
                <option>Open to Work</option>
                <option>Only Networking</option>
                <option>Unavailable</option>
              </select>
            </Field>
            <div className="flex justify-end"><Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save'}</Button></div>
          </div>
        )}
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Account</h2>
        <div className="mt-2 text-sm text-muted-foreground">Signed in as: {user?.displayName || user?.id || '—'}</div>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline"><a href={`/u/${encodeURIComponent(user?.id || '')}`}>View profile</a></Button>
          <Button variant="destructive" onClick={signout}>Sign out</Button>
        </div>
      </section>
    </div>
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
