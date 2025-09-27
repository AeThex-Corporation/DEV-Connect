import { useEffect } from "react";
import { useAuth } from "@/lib/fake-stack";

export default function AuthSuccess() {
  const { signin } = useAuth();
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = p.get("id");
    const name = p.get("name") || undefined;
    if (id) {
      signin(id, name);
      window.location.replace("/onboarding");
    } else {
      window.location.replace("/auth?error=missing");
    }
  }, []);
  return null;
}
