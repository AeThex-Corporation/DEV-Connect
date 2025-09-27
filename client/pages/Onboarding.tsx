import { useEffect, useState } from "react";
import { useUser } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Onboarding() {
  const user = useUser();
  const nav = useNavigate();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    stack_user_id: "",
    display_name: "",
    role: "",
    tags: [] as string[],
    contact_discord: "",
    contact_roblox: "",
    contact_twitter: "",
    availability: "Open to Work",
  });

  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      stack_user_id: user.id,
      display_name: user.displayName || f.display_name,
    }));
  }, [user]);

  if (!user)
    return (
      <div className="text-center text-sm text-muted-foreground">
        Sign in to start onboarding.
      </div>
    );

  const next = () => setStep((s) => Math.min(3, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));
  const save = async () => {
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    nav(`/settings?tab=dashboard`);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">Welcome! Let's set up your profile</h1>
      <div className="mt-6 rounded-xl border bg-card p-6 grid gap-5">
        {step === 1 && (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Display name</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={form.display_name}
                onChange={(e) =>
                  setForm({ ...form, display_name: e.target.value })
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Primary role</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                placeholder="Scripter, Builder, Designer..."
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              />
            </label>
          </div>
        )}
        {step === 2 && (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">
                Skills / tags (comma separated)
              </span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={form.tags.join(", ")}
                onChange={(e) =>
                  setForm({
                    ...form,
                    tags: e.target.value
                      .split(",")
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </label>
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Availability</span>
              <select
                className="rounded-md border bg-background px-3 py-2"
                value={form.availability}
                onChange={(e) =>
                  setForm({ ...form, availability: e.target.value })
                }
              >
                <option>Open to Work</option>
                <option>Only Networking</option>
                <option>Unavailable</option>
              </select>
            </label>
          </div>
        )}
        {step === 3 && (
          <div className="grid gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Discord</span>
              <input
                className="rounded-md border bg-background px-3 py-2"
                value={form.contact_discord}
                onChange={(e) =>
                  setForm({ ...form, contact_discord: e.target.value })
                }
              />
            </label>
            <div className="grid sm:grid-cols-2 gap-3">
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Roblox ID</span>
                <input
                  className="rounded-md border bg-background px-3 py-2"
                  value={form.contact_roblox}
                  onChange={(e) =>
                    setForm({ ...form, contact_roblox: e.target.value })
                  }
                />
              </label>
              <label className="grid gap-1 text-sm">
                <span className="text-muted-foreground">Twitter</span>
                <input
                  className="rounded-md border bg-background px-3 py-2"
                  value={form.contact_twitter}
                  onChange={(e) =>
                    setForm({ ...form, contact_twitter: e.target.value })
                  }
                />
              </label>
            </div>
          </div>
        )}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={step === 1}>
            Back
          </Button>
          {step < 3 ? (
            <Button onClick={next}>Next</Button>
          ) : (
            <Button onClick={save} disabled={!form.display_name || !form.role}>
              Finish
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
