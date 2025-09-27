import { useEffect, useState } from "react";
import { useUser } from "@/lib/fake-stack";
import { Link } from "react-router-dom";

interface FavItem { stack_user_id: string; display_name: string; role?: string; tags?: string[]; availability?: string }

export default function FavoritesPage() {
  const user = useUser();
  const [items, setItems] = useState<FavItem[]>([]);

  useEffect(() => {
    if (!user) return;
    fetch(`/api/favorites?stack_user_id=${encodeURIComponent(user.id)}`).then(r=>r.json()).then(setItems);
  }, [user?.id]);

  if (!user) return <div className="text-sm text-muted-foreground">Sign in to view favorites.</div>;

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(p => (
        <article key={p.stack_user_id} className="rounded-xl border bg-card p-5">
          <h3 className="font-semibold">{p.display_name}</h3>
          <p className="text-sm text-muted-foreground">{p.role || 'Developer'}</p>
          <div className="mt-2 flex flex-wrap gap-2">{(p.tags||[]).slice(0,4).map(t=> <span key={t} className="text-xs rounded-md px-2 py-1 bg-muted text-muted-foreground">{t}</span>)}</div>
          <Link to={`/u/${encodeURIComponent(p.stack_user_id)}`} className="mt-3 inline-block text-sm underline">View profile</Link>
        </article>
      ))}
      {!items.length && <div className="text-sm text-muted-foreground">No favorites yet.</div>}
    </div>
  );
}
