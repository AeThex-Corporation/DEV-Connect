import React, { useEffect, useState } from "react";

export function StackClient({ children }: { children: React.ReactNode }) {
  const [mod, setMod] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    // Dynamically import to avoid server-only code during build
    import("@stackframe/stack")
      .then((m) => {
        if (mounted) setMod(m);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  if (!mod) return <>{children}</>;

  const { StackProvider, StackTheme } = mod;
  const projectId =
    (import.meta as any).env.VITE_STACK_PROJECT_ID ||
    (import.meta as any).env.NEXT_PUBLIC_STACK_PROJECT_ID;
  const publishableClientKey =
    (import.meta as any).env.VITE_STACK_PUBLISHABLE_CLIENT_KEY ||
    (import.meta as any).env.NEXT_PUBLIC_STACK_PUBLISHABLE_CLIENT_KEY;

  return (
    <StackProvider
      projectId={projectId}
      publishableClientKey={publishableClientKey}
    >
      <StackTheme>{children}</StackTheme>
    </StackProvider>
  );
}
