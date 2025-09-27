import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/fake-stack";
import {
  BadgeCheck,
  Star,
  Shield,
  Search,
  Sparkles,
  Clock,
  MessageSquare,
} from "lucide-react";

export default function Index() {
  const user = useUser();
  const [profile, setProfile] = useState<any | null>(null);
  useEffect(() => {
    (async () => {
      if (!user) {
        setProfile(null);
        return;
      }
      try {
        const r = await fetch(
          `/api/profile/me?stackUserId=${encodeURIComponent(user.id)}`,
        );
        if (!r.ok) {
          console.warn("Failed to load profile", r.status);
          setProfile(null);
          return;
        }
        setProfile(await r.json());
      } catch (err) {
        console.warn("Error loading profile", err);
        setProfile(null);
      }
    })();
  }, [user]);
  const incomplete = useMemo(() => {
    if (!user) return false;
    if (!profile) return true;
    const hasRole = !!profile.role;
    const hasTags = Array.isArray(profile.tags) && profile.tags.length > 0;
    return !(hasRole && hasTags);
  }, [user, profile]);
  return (
    <div className="space-y-20">
      <HeroSection user={user} incomplete={incomplete} />
      <KeyPillars />
      <FeaturedProfiles />
      <FeaturedJobs />
      <TrustSafety />
      <CTASection user={user} incomplete={incomplete} />
    </div>
  );
}

function HeroSection({
  user,
  incomplete,
}: {
  user: ReturnType<typeof useUser>;
  incomplete: boolean;
}) {
  const [stats, setStats] = useState<{
    profiles: number;
    verifiedProfiles: number;
    jobs: number;
    applications: number;
    messages: number;
    online: number;
  } | null>(null);
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch("/api/stats");
        if (!r.ok) throw new Error(String(r.status));
        const d = await r.json();
        if (alive) setStats(d);
      } catch {
        if (alive) setStats({ profiles: 0, verifiedProfiles: 0, jobs: 0, applications: 0, messages: 0, online: 0 });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);
  const nf = (n: number) => n.toLocaleString();
  return (
    <section className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-primary/5 via-violet-500/10 to-indigo-500/5 p-8 sm:p-12">
      <div className="absolute inset-0 -z-10 [background:radial-gradient(1200px_circle_at_10%_10%,hsl(var(--primary)/0.15),transparent_40%),radial-gradient(900px_circle_at_90%_20%,rgba(124,58,237,.15),transparent_35%)]" />
      <div className="max-w-3xl">
        <div className="inline-flex items-center gap-2 rounded-full bg-background/60 px-3 py-1 text-xs font-medium ring-1 ring-border backdrop-blur">
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          Built for Roblox developers
        </div>
        <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
          Connect with the right Roblox talent. Build faster.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg">
          Showcase your skills and portfolio, find filterable paid work, and
          chat securely—all in one place.
        </p>
        <div className="mt-6 flex flex-col sm:flex-row gap-3">
          <Button
            asChild
            size="lg"
            className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
          >
            <Link to="/jobs">Browse jobs</Link>
          </Button>
          {!user && (
            <Button asChild size="lg" variant="outline">
              <Link to="/onboarding">Create your profile</Link>
            </Button>
          )}
          {user && incomplete && (
            <Button asChild size="lg" variant="outline">
              <Link to="/settings">Set up your profile</Link>
            </Button>
          )}
          {user && !incomplete && (
            <Button asChild size="lg" variant="outline">
              <Link to={`/u/${encodeURIComponent(user.id!)}`}>
                View your profile
              </Link>
            </Button>
          )}
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat
          title="Verified talent"
          value={nf(stats?.verifiedProfiles ?? 0)}
          icon={<BadgeCheck className="h-4 w-4 text-primary" />}
        />
        <Stat
          title="Active jobs"
          value={nf(stats?.jobs ?? 0)}
          icon={<Search className="h-4 w-4 text-primary" />}
        />
        <Stat
          title="Online now"
          value={nf(stats?.online ?? 0)}
          icon={<Clock className="h-4 w-4 text-primary" />}
        />
      </div>
    </section>
  );
}

function Stat({
  title,
  value,
  icon,
}: {
  title: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground p-4 flex items-center gap-4">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <div className="text-2xl font-bold leading-none">{value}</div>
        <div className="text-xs text-muted-foreground mt-1">{title}</div>
      </div>
    </div>
  );
}

function KeyPillars() {
  const items = [
    {
      title: "Profiles & Portfolios",
      desc: "Showcase skills, tags, work history, and availability.",
      icon: <BadgeCheck className="h-5 w-5" />,
    },
    {
      title: "Filterable Job Listings",
      desc: "Roles, compensation, genre, and scope at a glance.",
      icon: <Search className="h-5 w-5" />,
    },
    {
      title: "Direct Messaging",
      desc: "Start conversations and keep everything in one place.",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ];
  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-bold">MVP essentials</h2>
      <p className="text-muted-foreground mt-2">
        Everything you need to launch: comprehensive profiles, clear job
        listings, and basic DMs.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-xl border p-5 bg-card text-card-foreground"
          >
            <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary h-10 w-10">
              {it.icon}
            </div>
            <h3 className="mt-3 font-semibold">{it.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function FeaturedProfiles() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/featured/devs")
      .then((r) => r.json())
      .then(setItems);
  }, []);
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Featured talent</h2>
          <p className="text-muted-foreground mt-2">
            Explore verified developers with strong portfolios and ratings.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link to="/jobs">Hire talent</Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((p) => (
          <article
            key={p.stack_user_id}
            className="rounded-xl border bg-card p-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.display_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {p.role || "Developer"}
                </p>
              </div>
              <span className="text-xs rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                {p.availability || "—"}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {(p.tags || []).slice(0, 6).map((t: string) => (
                <span
                  key={t}
                  className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeaturedJobs() {
  const [items, setItems] = useState<any[]>([]);
  useEffect(() => {
    fetch("/api/featured/jobs")
      .then((r) => r.json())
      .then(setItems);
  }, []);
  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold">Hot jobs</h2>
          <p className="text-muted-foreground mt-2">
            Pay type is always visible. Filter by role, genre, and experience.
          </p>
        </div>
        <Button asChild>
          <Link to="/jobs">Browse all jobs</Link>
        </Button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {items.map((j) => (
          <article key={j.id} className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">{j.title}</h3>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Compensation</dt>
                <dd>{j.comp}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Genre</dt>
                <dd>{j.genre || "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Scope</dt>
                <dd>{j.scope || "—"}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-4">
              <Link to={`/jobs`}>Apply</Link>
            </Button>
          </article>
        ))}
      </div>
    </section>
  );
}

function TrustSafety() {
  const items = [
    {
      title: "Verification",
      desc: "Link DevForum or Roblox ID to build a trust score.",
      icon: <Shield className="h-5 w-5" />,
    },
    {
      title: "Ratings & reviews",
      desc: "Leave feedback after completed contracts.",
      icon: <Star className="h-5 w-5" />,
    },
    {
      title: "Reporting & moderation",
      desc: "Report scams or exploitative posts for review.",
      icon: <Shield className="h-5 w-5" />,
    },
  ];
  return (
    <section className="rounded-2xl border bg-card p-6 sm:p-8">
      <div className="grid gap-6 lg:grid-cols-3">
        {items.map((it) => (
          <div key={it.title} className="rounded-xl bg-muted/50 p-5">
            <div className="inline-flex items-center justify-center rounded-md bg-primary/10 text-primary h-10 w-10">
              {it.icon}
            </div>
            <h3 className="mt-3 font-semibold">{it.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{it.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection({
  user,
  incomplete,
}: {
  user: ReturnType<typeof useUser>;
  incomplete: boolean;
}) {
  return (
    <section className="text-center">
      <h2 className="text-3xl font-bold">
        Ready to find your next collaborator?
      </h2>
      <p className="mt-2 text-muted-foreground">
        {user
          ? "Set up your profile or browse jobs with clear compensation and scope."
          : "Create a profile or browse jobs with clear compensation and scope."}
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/jobs">Browse jobs</Link>
        </Button>
        {!user && (
          <Button asChild size="lg" variant="outline">
            <Link to="/onboarding">Create profile</Link>
          </Button>
        )}
        {user && incomplete && (
          <Button asChild size="lg" variant="outline">
            <Link to="/settings">Set up profile</Link>
          </Button>
        )}
        {user && !incomplete && (
          <Button asChild size="lg" variant="outline">
            <Link to={`/u/${encodeURIComponent(user.id!)}`}>
              View your profile
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
