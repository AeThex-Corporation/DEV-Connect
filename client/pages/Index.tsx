import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
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
  return (
    <div className="space-y-20">
      <HeroSection />
      <KeyPillars />
      <FeaturedProfiles />
      <FeaturedJobs />
      <TrustSafety />
      <CTASection />
    </div>
  );
}

function HeroSection() {
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
          <Button size="lg" variant="outline">
            Create your profile
          </Button>
        </div>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        <Stat
          title="Verified talent"
          value="1,200+"
          icon={<BadgeCheck className="h-4 w-4 text-primary" />}
        />
        <Stat
          title="Active jobs"
          value="340"
          icon={<Search className="h-4 w-4 text-primary" />}
        />
        <Stat
          title="Avg. response"
          value="< 24h"
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
  const profiles = [
    {
      name: "NovaScripts",
      role: "Scripter (Lua)",
      tags: ["Lua", "ProfileService", "AeroGameFramework"],
      status: "Open to Work",
    },
    {
      name: "VoxelVista",
      role: "Builder / Terrain",
      tags: ["Blender", "Terrain Editor", "Optimization"],
      status: "Only Networking",
    },
    {
      name: "PixelPulse",
      role: "UI/UX Designer",
      tags: ["Figma", "Roblox UI", "Prototyping"],
      status: "Open to Work",
    },
  ];
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
        {profiles.map((p) => (
          <article key={p.name} className="rounded-xl border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{p.name}</h3>
                <p className="text-sm text-muted-foreground">{p.role}</p>
              </div>
              <span className="text-xs rounded-full px-2 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                {p.status}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {p.tags.map((t) => (
                <span
                  key={t}
                  className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground"
                >
                  {t}
                </span>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-1 text-amber-500">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-current" />
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function FeaturedJobs() {
  const jobs = [
    {
      title: "Lead Scripter for Simulator",
      comp: "USD/Hourly",
      genre: "Simulator",
      scope: "Long-term",
    },
    {
      title: "Terrain Artist",
      comp: "Fixed Robux",
      genre: "Adventure",
      scope: "Small task",
    },
    {
      title: "UI/UX Designer",
      comp: "Rev Share",
      genre: "FPS",
      scope: "Full Game",
    },
  ];
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
        {jobs.map((j) => (
          <article key={j.title} className="rounded-xl border bg-card p-5">
            <h3 className="font-semibold">{j.title}</h3>
            <dl className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Compensation</dt>
                <dd>{j.comp}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Genre</dt>
                <dd>{j.genre}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Scope</dt>
                <dd>{j.scope}</dd>
              </div>
            </dl>
            <Button asChild variant="outline" className="mt-4">
              <Link to="/jobs">Apply</Link>
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

function CTASection() {
  return (
    <section className="text-center">
      <h2 className="text-3xl font-bold">
        Ready to find your next collaborator?
      </h2>
      <p className="mt-2 text-muted-foreground">
        Create a profile or browse jobs with clear compensation and scope.
      </p>
      <div className="mt-5 flex items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link to="/jobs">Browse jobs</Link>
        </Button>
        <Button size="lg" variant="outline">
          Create profile
        </Button>
      </div>
    </section>
  );
}
