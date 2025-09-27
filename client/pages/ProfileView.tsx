import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface PublicProfile {
  stack_user_id: string;
  display_name: string;
  role?: string;
  tags?: string[];
  contact_discord?: string;
  contact_roblox?: string;
  contact_twitter?: string;
  availability?: string;
  trust_score?: number;
  portfolio?: any[];
  avatar_url?: string;
  banner_url?: string;
}

export default function ProfileView() {
  const { stackUserId } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stackUserId) return;
    setLoading(true);
    fetch(`/api/profile/${encodeURIComponent(stackUserId)}`)
      .then((r) => r.json())
      .then(setP)
      .finally(() => setLoading(false));
  }, [stackUserId]);

  if (loading)
    return (
      <div className="animate-page-fade mx-auto max-w-4xl">
        <div className="rounded-2xl border bg-card overflow-hidden">
          <div className="h-40 skeleton" />
          <div className="p-6">
            <div className="h-8 w-40 skeleton" />
            <div className="mt-2 h-4 w-24 skeleton" />
          </div>
        </div>
      </div>
    );
  if (!p)
    return (
      <div className="text-sm text-muted-foreground">Profile not found.</div>
    );

  const tags = p.tags ?? [];

  async function favorite() {
    await fetch("/api/favorites/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        favorite_stack_user_id: p!.stack_user_id,
        stack_user_id: localStorage.getItem("rbx_user")
          ? JSON.parse(localStorage.getItem("rbx_user") as string).id
          : "",
      }),
    });
  }

  async function connect() {
    window.location.href = `/messages?peer=${encodeURIComponent(p!.stack_user_id)}`;
  }

  const initial = (p.display_name || "U").charAt(0).toUpperCase();
  return (
    <div className="mx-auto max-w-4xl animate-page-fade">
      <section className="rounded-2xl border bg-card overflow-hidden">
        <div
          className="h-32 sm:h-40 w-full bg-muted"
          style={{
            backgroundImage: p.banner_url ? `url(${p.banner_url})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full -mt-16 ring-2 ring-background overflow-hidden bg-primary/10 text-primary flex items-center justify-center text-2xl font-bold">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  initial
                )}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
                  {p.display_name}
                </h1>
                <p className="text-muted-foreground">{p.role || "Developer"}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {tags.slice(0, 6).map((t) => (
                    <span
                      key={t}
                      className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button onClick={connect}>Connect</Button>
              <Button variant="outline" onClick={favorite}>
                Favorite
              </Button>
              <Button asChild variant="outline">
                <Link
                  to={`/messages?peer=${encodeURIComponent(p.stack_user_id)}`}
                >
                  Message
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-card p-5 lg:col-span-2">
          <h2 className="font-semibold">About</h2>
          <div className="mt-3 text-sm text-muted-foreground">
            Availability: {p.availability ?? "—"}
          </div>
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Contact</h2>
          <ul className="mt-2 text-sm text-muted-foreground space-y-1">
            <li>Discord: {p.contact_discord || "—"}</li>
            <li>Roblox ID: {p.contact_roblox || "—"}</li>
            <li>Twitter: {p.contact_twitter || "—"}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
