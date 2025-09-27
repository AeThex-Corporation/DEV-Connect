import { useTheme } from "@/lib/theme";
import { useAuth, useUser } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signout } = useAuth();
  const user = useUser();

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <div>
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your appearance and account preferences.</p>
      </div>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Appearance</h2>
        <div className="mt-3 grid gap-2">
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="theme" checked={theme==='light'} onChange={()=>setTheme('light')} /> Light
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="theme" checked={theme==='dark'} onChange={()=>setTheme('dark')} /> Dark
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input type="radio" name="theme" checked={theme==='system'} onChange={()=>setTheme('system')} /> System
          </label>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Account</h2>
        <div className="mt-2 text-sm text-muted-foreground">Signed in as: {user?.displayName || user?.id || '—'}</div>
        <div className="mt-3 flex gap-2">
          <Button asChild variant="outline"><a href="/profile">Edit profile</a></Button>
          <Button variant="destructive" onClick={signout}>Sign out</Button>
        </div>
      </section>
    </div>
  );
}
