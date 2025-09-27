import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageSquare, Briefcase, Home, Sparkles } from "lucide-react";

export function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 text-foreground">
      <SiteHeader />
      <main className="container px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

function SiteHeader() {
  const location = useLocation();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-gradient-to-br from-primary to-violet-500 text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          <span className="tracking-tight">RBX Connect</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          <NavItem to="/" icon={<Home className="h-4 w-4" />}
            active={location.pathname === "/"}>Home</NavItem>
          <NavItem to="/jobs" icon={<Briefcase className="h-4 w-4" />}
            active={location.pathname.startsWith("/jobs")}>Jobs</NavItem>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" className="hidden sm:inline-flex">Sign in</Button>
          <Button className="bg-gradient-to-r from-primary to-violet-500 hover:from-primary/90 hover:to-violet-500/90">Post a job</Button>
        </div>
      </div>
    </header>
  );
}

function NavItem({ to, children, icon, active }: { to: string; children: React.ReactNode; icon?: React.ReactNode; active?: boolean }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          (isActive || active)
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
          <p className="mt-3 text-sm text-muted-foreground">Connecting Roblox developers and teams with clarity, trust, and great projects.</p>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Platform</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/jobs" className="hover:text-foreground">Browse jobs</Link></li>
            <li><span className="cursor-default select-none">Profiles (soon)</span></li>
            <li><span className="cursor-default select-none">Messages (soon)</span></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Safety</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Verification & ratings</li>
            <li>Moderation & reporting</li>
            <li>Contract templates</li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-3">Contact</h4>
          <p className="text-sm text-muted-foreground">Discord: @rbxconnect</p>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} RBX Connect. All rights reserved.</div>
    </footer>
  );
}
