import React from "react";
import { SignIn, StackTheme } from "@/lib/fake-stack";

export default function AuthInner() {
  return (
    <div className="mx-auto max-w-md grid gap-4">
      <StackTheme>
        <div className="rounded-xl border bg-card p-5 grid gap-3">
          <h1 className="text-xl font-bold">Sign in</h1>
          <a className="rounded-md bg-[#5865F2] text-white px-4 py-2 text-center" href="/api/auth/discord">Continue with Discord</a>
          <a className="rounded-md bg-black text-white px-4 py-2 text-center" href="/api/auth/github">Continue with GitHub</a>
          <div className="text-xs text-muted-foreground text-center">or</div>
          <SignIn />
        </div>
      </StackTheme>
    </div>
  );
}
