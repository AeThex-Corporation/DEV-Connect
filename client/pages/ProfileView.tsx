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
}

export default function ProfileView() {
  const { stackUserId } = useParams();
  const nav = useNavigate();
  const [p, setP] = useState<PublicProfile | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stackUserId) return;
    setLoading(true);
    fetch(`/api/profile/${encodeURIComponent(stackUserId)}`).then(r=>r.json()).then(setP).finally(()=>setLoading(false));
  }, [stackUserId]);

  if (loading) return <div>Loading...</div>;
  if (!p) return <div className="text-sm text-muted-foreground">Profile not found.</div>;

  const tags = p.tags ?? [];

  async function favorite() {
    await fetch('/api/favorites/toggle', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ favorite_stack_user_id: p!.stack_user_id, stack_user_id: localStorage.getItem('rbx_user') ? JSON.parse(localStorage.getItem('rbx_user') as string).id : '' }) });
  }

  async function connect() {
    window.location.href = `/messages?peer=${encodeURIComponent(p!.stack_user_id)}`;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{p.display_name}</h1>
          <p className="text-muted-foreground">{p.role || "Developer"}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={connect}>Connect</Button>
          <Button variant="outline" onClick={favorite}>Favorite</Button>
          <Button asChild><Link to={`/messages?peer=${encodeURIComponent(p.stack_user_id)}`}>Message</Link></Button>
        </div>
      </div>
      <div className="mt-6 grid gap-6">
        <section className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">About</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t)=> (
              <span key={t} className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground">{t}</span>
            ))}
            {!tags.length && <span className="text-sm text-muted-foreground">No tags added.</span>}
          </div>
          <div className="mt-4 text-sm text-muted-foreground">Availability: {p.availability ?? "—"}</div>
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
