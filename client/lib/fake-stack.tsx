import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSupabase } from "./supabase";
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Crown, Shield } from "lucide-react";

type User = { id: string; displayName?: string } | null;

const AuthContext = createContext<{
  user: User;
  signin: (id: string, displayName?: string) => void;
  signout: () => void;
}>({ user: null, signin: () => {}, signout: () => {} });

export function FakeStackProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rbx_user");
      if (raw) setUser(JSON.parse(raw));
    } catch (e) {}
    const sb = getSupabase();
    if (!sb) return; // supabase not configured
    sb.auth.getSession().then(({ data }) => {
      const email = data.session?.user?.email || null;
      const display = (data.session?.user?.user_metadata as any)?.name || email || undefined;
      if (email) setUser({ id: `local:${email}`, displayName: display });
    });
    const { data: sub } = sb.auth.onAuthStateChange((_event, session) => {
      const email = session?.user?.email || null;
      const display = (session?.user?.user_metadata as any)?.name || email || undefined;
      if (email) setUser({ id: `local:${email}`, displayName: display });
      else setUser(null);
    });
    return () => {
      sub?.subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("rbx_user", JSON.stringify(user));
    } catch (e) {}
  }, [user]);

  const signin = (id: string, displayName?: string) =>
    setUser({ id, displayName });
  const signout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, signin, signout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useUser(): User {
  return useContext(AuthContext).user;
}

export function useAuth() {
  return useContext(AuthContext);
}

export function UserButton() {
  const { user, signout } = useContext(AuthContext);
  const nav = useNavigate();
  const [status, setStatus] = useState<{ is_admin: boolean; is_owner: boolean } | null>(null);
  const [verified, setVerified] = useState<boolean>(false);
  useEffect(() => {
    if (!user?.id) return;
    fetch("/api/admin/me", { headers: { "x-user-id": user.id } })
      .then((r) => r.json())
      .then((d) => setStatus(d))
      .catch(() => setStatus(null));
    fetch(`/api/profile/me?stackUserId=${encodeURIComponent(user.id)}`)
      .then((r) => r.json())
      .then((p) => setVerified(Boolean(p?.is_verified)))
      .catch(() => setVerified(false));
  }, [user?.id]);
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        className="text-sm"
        onClick={() => nav(`/u/${encodeURIComponent(user.id)}`)}
      >
        {user.displayName ?? user.id}
      </button>
      {verified && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <BadgeCheck className="h-3 w-3 text-primary" /> Verified
        </Badge>
      )}
      {status?.is_owner && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Crown className="h-3 w-3 text-yellow-500" /> Owner
        </Badge>
      )}
      {!status?.is_owner && status?.is_admin && (
        <Badge variant="secondary" className="flex items-center gap-1">
          <Shield className="h-3 w-3 text-blue-500" /> Admin
        </Badge>
      )}
      <button
        className="text-sm text-muted-foreground"
        onClick={() => {
          signout();
          nav("/");
        }}
      >
        Sign out
      </button>
    </div>
  );
}

export function SignIn() {
  const [id, setId] = useState("");
  const [name, setName] = useState("");
  const { signin } = useAuth();
  const nav = useNavigate();
  const submit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!id) return;
    signin(id, name || id);
    nav("/profile");
  };
  return (
    <form onSubmit={submit} className="grid gap-3">
      <input
        className="rounded-md border px-3 py-2"
        placeholder="Stack user id (e.g. your handle)"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <input
        className="rounded-md border px-3 py-2"
        placeholder="Display name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <div className="flex justify-end">
        <button
          className="rounded-md bg-primary text-primary-foreground px-4 py-2"
          type="submit"
        >
          Sign in
        </button>
      </div>
    </form>
  );
}

export const StackTheme = ({ children }: { children: React.ReactNode }) => (
  <>{children}</>
);
export const StackProvider = FakeStackProvider;
export default FakeStackProvider;
