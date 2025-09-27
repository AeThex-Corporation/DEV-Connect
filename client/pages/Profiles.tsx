import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useUser } from "@/lib/fake-stack";

interface ProfileListItem {
  stack_user_id: string;
  display_name: string;
  role?: string;
  tags?: string[];
  availability?: string;
  avatar_url?: string;
}

export default function ProfilesPage() {
  const user = useUser();
  const [q, setQ] = useState("");
  const [role, setRole] = useState("");
  const [availability, setAvailability] = useState("");
  const [items, setItems] = useState<ProfileListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [incomplete, setIncomplete] = useState(false);

  useEffect(() => {
    (async () => {
      if (!user) {
        setIncomplete(false);
        return;
      }
      const r = await fetch(
        `/api/profile/me?stackUserId=${encodeURIComponent(user.id)}`,
      );
      const data = await r.json();
      const hasRole = !!data?.role;
      const hasTags = Array.isArray(data?.tags) && data.tags.length > 0;
      setIncomplete(!(hasRole && hasTags));
    })();
  }, [user]);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (role) params.set("role", role);
    if (availability) params.set("availability", availability);
    const res = await fetch(`/api/profiles?${params.toString()}`);
    const data = await res.json();
    setItems(data);
    setLoading(false);
  };

  useEffect(() => {
    load(); /* eslint-disable-next-line */
  }, []);

  return (
    <div className="animate-page-fade">
      {!user && (
        <div className="rounded-xl border bg-card p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold">New here?</div>
            <div className="text-sm text-muted-foreground">
              Create a profile to get discovered and message developers.
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/onboarding">Create your profile</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/auth">Sign in</Link>
            </Button>
          </div>
        </div>
      )}
      {user && incomplete && (
        <div className="rounded-xl border bg-card p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <div className="font-semibold">Finish setting up your profile</div>
            <div className="text-sm text-muted-foreground">
              Add your role and a few tags to help others find you.
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link to="/settings">Set up profile</Link>
            </Button>
          </div>
        </div>
      )}
      <div className="rounded-xl border bg-card p-4 flex flex-col gap-3">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <input
            className="w-full sm:max-w-md rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Search developers..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                load();
              }
            }}
          />
          <div className="text-sm text-muted-foreground">
            {loading ? "Loading..." : `${items.length} results`}
          </div>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">All roles</option>
            <option>Scripter</option>
            <option>Builder</option>
            <option>Designer</option>
            <option>Animator</option>
            <option>UI/UX</option>
            <option>Composer</option>
          </select>
          <select
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            value={availability}
            onChange={(e) => setAvailability(e.target.value)}
          >
            <option value="">Any availability</option>
            <option>Open to Work</option>
            <option>Only Networking</option>
            <option>Unavailable</option>
          </select>
          <Button onClick={load}>Search</Button>
        </div>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading && (
          <>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-5">
                <div className="h-4 w-32 skeleton" />
                <div className="mt-2 h-3 w-24 skeleton" />
                <div className="mt-4 h-6 w-full skeleton" />
              </div>
            ))}
          </>
        )}
        {!loading && items.map((p) => (
          <article
            key={p.stack_user_id}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold overflow-hidden">
                {p.avatar_url ? (
                  <img
                    src={p.avatar_url}
                    alt={p.display_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (p.display_name || "U").charAt(0).toUpperCase()
                )}
              </div>
              <div>
                <h3 className="font-semibold">{p.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.role || "Developer"}
                </p>
              </div>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {(p.tags || []).slice(0, 4).map((t) => (
                <span
                  key={t}
                  className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <Button asChild variant="outline" className="mt-4">
              <Link to={`/u/${encodeURIComponent(p.stack_user_id)}`}>
                View profile
              </Link>
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
