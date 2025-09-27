import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Star } from "lucide-react";

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
  passport_id?: string;
  is_verified?: boolean;
}

export default function ProfileView() {
  const { stackUserId } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState<{ average: number; count: number }>({ average: 0, count: 0 });
  const [history, setHistory] = useState<any[]>([]);
  const [badges, setBadges] = useState<Array<{ slug: string; label?: string; icon?: string; color?: string }>>([]);

  useEffect(() => {
    if (!stackUserId) return;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(
          `/api/profile/${encodeURIComponent(stackUserId)}`,
        );
        if (!r.ok) {
          console.warn("Failed to load public profile", r.status);
          setP(null);
          return;
        }
        const d = await r.json();
        setP(d);
        try {
          const rr = await fetch(`/api/ratings/${encodeURIComponent(stackUserId)}`);
          const rv = await rr.json();
          setRating({ average: Number(rv.average || 0), count: Number(rv.count || 0) });
        } catch (e) {}
        try {
          const br = await fetch(`/api/badges/${encodeURIComponent(stackUserId)}`);
          const bl = await br.json();
          setBadges(Array.isArray(bl) ? bl : []);
        } catch (e) {}
        try {
          const hr = await fetch(`/api/history/${encodeURIComponent(stackUserId)}`);
          const hv = await hr.json();
          setHistory(Array.isArray(hv)? hv: []);
        } catch (e) {}
      } catch (err) {
        console.warn("Error loading public profile", err);
        setP(null);
      } finally {
        setLoading(false);
      }
    })();
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
    try {
      const r = await fetch("/api/favorites/toggle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          favorite_stack_user_id: p!.stack_user_id,
          stack_user_id: localStorage.getItem("rbx_user")
            ? JSON.parse(localStorage.getItem("rbx_user") as string).id
            : "",
        }),
      });
      if (!r.ok) console.warn("Failed to toggle favorite", r.status);
    } catch (err) {
      console.warn("Error toggling favorite", err);
    }
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
                <h1 className="text-2xl sm:text-3xl font-bold leading-tight flex items-center gap-2">
                  {p.display_name}
                  {p.is_verified && (
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <BadgeCheck className="h-3 w-3 text-primary" /> Verified
                    </Badge>
                  )}
                </h1>
                <p className="text-muted-foreground flex items-center gap-2">
                  {p.role || "Developer"}
                  {rating.count > 0 && (
                    <span className="inline-flex items-center gap-1 text-xs">
                      <Star className="h-3 w-3 text-yellow-500" />
                      {rating.average.toFixed(1)} ({rating.count})
                    </span>
                  )}
                </p>
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
          <div className="mt-2 text-sm text-muted-foreground">
            Payment preference: {p.payment_pref ?? "—"}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            Passport ID:{" "}
            <span className="font-mono select-all">{p.passport_id || "—"}</span>
          </div>
          <div className="mt-3 grid sm:grid-cols-2 gap-2 text-sm">
            {p.roblox_game_url && (
              <a className="underline" href={p.roblox_game_url} target="_blank" rel="noreferrer">Roblox game</a>
            )}
            {p.devforum_url && (
              <a className="underline" href={p.devforum_url} target="_blank" rel="noreferrer">DevForum</a>
            )}
            {p.github_url && (
              <a className="underline" href={p.github_url} target="_blank" rel="noreferrer">GitHub</a>
            )}
            {p.artstation_url && (
              <a className="underline" href={p.artstation_url} target="_blank" rel="noreferrer">ArtStation</a>
            )}
            {p.youtube_url && (
              <a className="underline" href={p.youtube_url} target="_blank" rel="noreferrer">YouTube</a>
            )}
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
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Badges</h2>
          {badges.length === 0 ? (
            <div className="mt-2 text-sm text-muted-foreground">No badges yet.</div>
          ) : (
            <div className="mt-2 flex flex-wrap gap-2">
              {badges.map((b) => (
                <Badge key={b.slug} variant="secondary">
                  {b.label || b.slug}
                </Badge>
              ))}
            </div>
          )}
        </section>
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Rate this profile</h2>
          <div className="mt-2 flex items-center gap-1">
            {[1,2,3,4,5].map((s) => (
              <button
                key={s}
                className="p-2"
                title={`Rate ${s}`}
                onClick={async () => {
                  try {
                    const meRaw = localStorage.getItem("rbx_user");
                    const me = meRaw ? JSON.parse(meRaw) : null;
                    if (!me?.id) return;
                    await fetch("/api/ratings", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        rater_stack_user_id: me.id,
                        ratee_stack_user_id: p!.stack_user_id,
                        score: s,
                      }),
                    });
                    const rr = await fetch(`/api/ratings/${encodeURIComponent(p!.stack_user_id)}`);
                    const rv = await rr.json();
                    setRating({ average: Number(rv.average || 0), count: Number(rv.count || 0) });
                  } catch (e) {}
                }}
              >
                <Star className={`h-5 w-5 ${rating.average >= s ? "text-yellow-500" : "text-muted-foreground"}`} />
              </button>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Project history</h2>
        {history.length === 0 ? (
          <div className="mt-2 text-sm text-muted-foreground">No completed collaborations yet.</div>
        ) : (
          <ul className="mt-2 text-sm space-y-1">
            {history.map((h)=> (
              <li key={h.id}>#{h.job_id} · {h.title} · {h.completed_at ? new Date(h.completed_at).toLocaleDateString() : ""}</li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
