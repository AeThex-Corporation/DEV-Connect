import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

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
  if (!user) return null;
  return (
    <div className="flex items-center gap-2">
      <button
        className="text-sm"
        onClick={() => nav(`/u/${encodeURIComponent(user.id)}`)}
      >
        {user.displayName ?? user.id}
      </button>
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
