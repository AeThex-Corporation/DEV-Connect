import { useEffect, useState } from "react";
import { useTheme } from "@/lib/theme";
import { useAuth, useUser } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signout } = useAuth();
  const user = useUser();
  const nav = useNavigate();

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [tab, setTab] = useState<"dashboard" | "appearance" | "profile" | "security">("dashboard");
  const [incoming, setIncoming] = useState<any[]>([]);
  const [pwd, setPwd] = useState({ current: "", next: "" });

  useEffect(() => {
    if (!user) {
      nav("/onboarding", { replace: true });
      return;
    }
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
          avatar_url: data?.avatar_url ?? "",
          banner_url: data?.banner_url ?? "",
        });
      })
      .finally(() => setLoading(false));
    fetch(`/api/applications/incoming?owner=${encodeURIComponent(sid)}`)
      .then((r) => r.json())
      .then(setIncoming);
  }, [user]);

  const save = async () => {
    setLoading(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setLoading(false);
  };

  const changePassword = async () => {
    if (!user) return;
    await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stack_user_id: user.id, current_password: pwd.current, new_password: pwd.next }),
    });
    setPwd({ current: "", next: "" });
  };

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Manage your account, profile, and jobs.</p>
        </div>
        <div className="flex gap-2">
          <Button variant={tab === "dashboard" ? undefined : "outline"} onClick={() => setTab("dashboard")}>Dashboard</Button>
          <Button variant={tab === "appearance" ? undefined : "outline"} onClick={() => setTab("appearance")}>Appearance</Button>
          <Button variant={tab === "profile" ? undefined : "outline"} onClick={() => setTab("profile")}>Profile</Button>
          <Button variant={tab === "security" ? undefined : "outline"} onClick={() => setTab("security")}>Security</Button>
        </div>
      </div>

      {tab === "appearance" && (
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="mt-3 grid gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="theme"
              checked={theme === "light"}
              onChange={() => setTheme("light")}
            />{" "}
            Light
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="theme"
              checked={theme === "dark"}
              onChange={() => setTheme("dark")}
            />{" "}
            Dark
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="theme"
              checked={theme === "system"}
              onChange={() => setTheme("system")}
            />{" "}
            System
          </label>
        </div>
      </section>
      )}

      {tab === "profile" && (
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Profile</h2>
        {!form ? (
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading..." : "Sign in to edit your profile."}
          </div>
        ) : (
          <div className="mt-3 grid gap-4">
            <div className="relative rounded-lg border overflow-hidden">
              <div
                className="h-32 sm:h-40 w-full bg-muted"
                style={{
                  backgroundImage: form.banner_url ? `url(${form.banner_url})` : undefined,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <div className="absolute left-4 -bottom-8 flex items-end gap-4">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full ring-2 ring-background overflow-hidden bg-primary/10 text-primary flex items-center justify-center text-xl font-bold">
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    (form.display_name || "U").charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden sm:block pb-2">
                  <div className="font-semibold">{form.display_name || user?.displayName || ""}</div>
                  <div className="text-xs text-muted-foreground">{form.role || "Developer"}</div>
                </div>
              </div>
              <div className="absolute right-3 top-3 flex gap-2">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => setForm({ ...form, banner_url: String(reader.result) });
                      reader.readAsDataURL(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button variant="secondary" size="sm" type="button">
                    Upload banner
                  </Button>
                </label>
              </div>
              <div className="absolute left-24 bottom-2 sm:left-28 sm:bottom-3">
                <label className="inline-flex">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const reader = new FileReader();
                      reader.onload = () => setForm({ ...form, avatar_url: String(reader.result) });
                      reader.readAsDataURL(f);
                      e.currentTarget.value = "";
                    }}
                  />
                  <Button variant="outline" size="sm" type="button">
                    Upload avatar
                  </Button>
                </label>
              </div>
            </div>
            <div className="mt-10 grid gap-3">
              <Field label="Display name">
                <input
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={form.display_name ?? ""}
                  onChange={(e) =>
                    setForm({ ...form, display_name: e.target.value })
                  }
                />
              </Field>
              <Field label="Role">
                <input
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={form.role ?? ""}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  placeholder="Scripter, Builder, Designer..."
                />
              </Field>
              <Field label="Tags (comma separated)">
                <input
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={(form.tags ?? []).join(", ")}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      tags: e.target.value
                        .split(",")
                        .map((s: string) => s.trim())
                        .filter(Boolean),
                    })
                  }
                />
              </Field>
              <div className="grid sm:grid-cols-3 gap-3">
                <Field label="Discord">
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.contact_discord ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, contact_discord: e.target.value })
                    }
                  />
                </Field>
                <Field label="Roblox ID">
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.contact_roblox ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, contact_roblox: e.target.value })
                    }
                  />
                </Field>
                <Field label="Twitter">
                  <input
                    className="w-full rounded-md border bg-background px-3 py-2"
                    value={form.contact_twitter ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, contact_twitter: e.target.value })
                    }
                  />
                </Field>
              </div>
              <Field label="Availability">
                <select
                  className="w-full rounded-md border bg-background px-3 py-2"
                  value={form.availability ?? "Open to Work"}
                  onChange={(e) =>
                    setForm({ ...form, availability: e.target.value })
                  }
                >
                  <option>Open to Work</option>
                  <option>Only Networking</option>
                  <option>Unavailable</option>
                </select>
              </Field>
              <div className="flex justify-end">
                <Button onClick={save} disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </section>
      )}

      {tab === "dashboard" && (
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Dashboard</h2>
        <div className="mt-2 text-sm text-muted-foreground">Quick links and recent activity</div>
        <div className="mt-4 flex gap-2">
          <Button asChild>
            <a href="/jobs">Post a job</a>
          </Button>
          <Button asChild variant="outline">
            <a href={`/u/${encodeURIComponent(user?.id || "")}`}>View profile</a>
          </Button>
        </div>
        <div className="mt-6">
          <h3 className="font-medium">Incoming applications</h3>
          <ul className="mt-2 text-sm">
            {incoming.length === 0 && (
              <li className="text-muted-foreground">No applications yet.</li>
            )}
            {incoming.map((a) => (
              <li key={a.id} className="py-1">{a.job_title} — {a.applicant_stack_user_id} — {a.status}</li>
            ))}
          </ul>
        </div>
      </section>
      )}

      {tab === "security" && (
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Security</h2>
        <div className="mt-2 text-sm text-muted-foreground">Change your password (local accounts)</div>
        <div className="mt-3 grid sm:grid-cols-2 gap-3">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Current password</span>
            <input className="w-full rounded-md border bg-background px-3 py-2" type="password" value={pwd.current} onChange={(e) => setPwd({ ...pwd, current: e.target.value })} />
          </label>
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">New password</span>
            <input className="w-full rounded-md border bg-background px-3 py-2" type="password" value={pwd.next} onChange={(e) => setPwd({ ...pwd, next: e.target.value })} />
          </label>
        </div>
        <div className="mt-3 flex justify-end">
          <Button onClick={changePassword} disabled={!pwd.current || !pwd.next}>Change password</Button>
        </div>
      </section>
      )}

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Account</h2>
        <div className="mt-2 text-sm text-muted-foreground">
          Signed in as: {user?.displayName || user?.id || "—"}
        </div>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline">
            <a href={`/u/${encodeURIComponent(user?.id || "")}`}>
              View profile
            </a>
          </Button>
          <Button variant="destructive" onClick={signout}>
            Sign out
          </Button>
        </div>
      </section>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-1 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}
