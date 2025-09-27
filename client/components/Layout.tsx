import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Briefcase, Home, Sparkles } from "lucide-react";
import { UserStatus } from "./UserStatus";
import { useUser } from "@/lib/fake-stack";
import { useEffect, useMemo, useState } from "react";
import { safeFetch } from "@/lib/safe-fetch";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      <SiteHeader />
      <main className="container px-4 sm:px-6 lg:px-8 py-8">
        <div key={location.pathname} className="animate-page-fade">
          <Outlet />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const location = useLocation();
  const user = useUser();
  const [incomingCount, setIncomingCount] = useState(0);
  useEffect(() => {
    let t: any;
    async function load() {
      if (!user) {
        setIncomingCount(0);
        return;
      }

      if (typeof navigator !== "undefined" && !navigator.onLine) {
        // Avoid noisy fetch attempts when offline
        setIncomingCount(0);
        return;
      }

      try {
        // Use AbortController to avoid long-hanging fetches
        const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
        const id = controller ? setTimeout(() => controller.abort(), 8000) : null;
        const r = await safeFetch(
          `/api/applications/incoming/count?owner=${encodeURIComponent(user.id)}`,
          controller ? { signal: controller.signal } : undefined,
        );
        if (id) clearTimeout(id);
        if (!r) {
          // safeFetch returned null due to network or fetch not available
          setIncomingCount(0);
          return;
        }
        if (!r.ok) {
          console.warn("Failed to fetch incoming count", r.status);
          setIncomingCount(0);
          return;
        }
        const d = await r.json();
        setIncomingCount(d.count || 0);
      } catch (err) {
        console.warn("Error fetching incoming count", err);
        setIncomingCount(0);
      }
    }
    load();
    t = setInterval(load, 30000);
    return () => clearInterval(t);
  }, [user?.id]);
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg text-foreground"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet-500 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="tracking-tight">RBX Connect</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavItem
            to="/"
            icon={<Home className="h-4 w-4" />}
            active={location.pathname === "/"}
          >
            Home
          </NavItem>
          <NavItem
            to="/profiles"
            active={location.pathname.startsWith("/profiles")}
          >
            Network
          </NavItem>
          <NavItem
            to="/jobs"
            icon={<Briefcase className="h-4 w-4" />}
            active={location.pathname.startsWith("/jobs")}
          >
            Jobs{user && incomingCount > 0 ? ` (${incomingCount})` : ""}
          </NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <UserStatus />
          {user && (
            <Link
              to="/settings"
              className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
            >
              Settings
            </Link>
          )}
          <Button
            asChild
            className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90"
          >
            <Link to="/jobs">Post a job</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

function NavItem({
  to,
  children,
  icon,
  active,
}: {
  to: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  active?: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive || active
            ? "bg-accent text-accent-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )
      }
    >
      {icon}
      {children}
    </NavLink>
  );
}

function SiteFooter() {
  const user = useUser();
  const [online, setOnline] = useState(0);
  useEffect(() => {
    let t: any;
    async function ping() {
      try {
        if (user?.id) {
          try {
            // Prefer sendBeacon for lightweight background pings when available
            if (typeof navigator !== "undefined" && typeof navigator.sendBeacon === "function") {
              try {
                // sendBeacon sends a POST; provide stack_user_id as query so server can accept it
                const url = `/api/presence/ping?stack_user_id=${encodeURIComponent(user.id)}`;
                navigator.sendBeacon(url);
              } catch (sbErr) {
                // fall back to fetch if sendBeacon fails
                await safeFetch(`/api/presence/ping?stack_user_id=${encodeURIComponent(user.id)}`);
              }
            } else if (typeof navigator !== "undefined" && !navigator.onLine) {
              // offline: skip
            } else {
              const resp = await safeFetch(`/api/presence/ping`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stack_user_id: user.id }),
              });
              if (!resp) {
                console.warn("Presence ping failed: no response from fetch");
              } else if (!resp.ok) {
                console.warn("Presence ping failed", resp.status);
              }
            }
          } catch (err) {
            // Network or other error when sending presence ping
            console.warn("Error sending presence ping", err);
          }
        }
        try {
          if (typeof navigator !== "undefined" && !navigator.onLine) {
            setOnline(0);
            return;
          }
          const controller = typeof AbortController !== "undefined" ? new AbortController() : null;
          const idc = controller ? setTimeout(() => controller.abort(), 8000) : null;
          const r = await safeFetch(`/api/presence/online`, controller ? { signal: controller.signal } : undefined);
          if (idc) clearTimeout(idc);
          if (!r) {
            console.warn("Failed to fetch online count (no response)");
            setOnline(0);
            return;
          }
          if (!r.ok) {
            console.warn("Failed to fetch online count", r.status);
            setOnline(0);
            return;
          }
          const d = await r.json();
          setOnline(d.online || 0);
        } catch (err) {
          console.warn("Error fetching online count", err);
          setOnline(0);
        }
      } catch (err) {
        console.warn("Unexpected error in presence ping", err);
      }
    }
    ping();
    t = setInterval(ping, 60000);
    return () => clearInterval(t);
  }, [user?.id]);
  return (
    <footer className="border-t bg-background">
      <div className="container px-4 sm:px-6 lg:px-8 py-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-bold text-lg">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet-500 text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            RBX Connect
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Connecting Roblox developers and teams with clarity, trust, and
            great projects.
          </p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link
                to="/jobs"
                className="text-foreground/80 hover:text-foreground"
              >
                Browse jobs
              </Link>
            </li>
            <li>
              <Link
                to="/profiles"
                className="text-foreground/80 hover:text-foreground"
              >
                Network
              </Link>
            </li>
            <li>
              <Link
                to="/messages"
                className="text-foreground/80 hover:text-foreground"
              >
                Messages
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Safety</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/safety/verification">Verification & ratings</Link>
            </li>
            <li>
              <Link to="/safety/moderation">Moderation & reporting</Link>
            </li>
            <li>
              <Link to="/safety/contracts">Contract templates</Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-sm text-muted-foreground">Discord: @rbxconnect</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">
        {online} online • Developed & Powered By AeThex.Dev • ©{" "}
        {new Date().getFullYear()} RBX Connect. All rights reserved.
      </div>
    </footer>
  );
}
