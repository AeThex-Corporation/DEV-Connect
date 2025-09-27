import React from "react";
import { SignIn, StackTheme } from "@/lib/fake-stack";

export default function AuthInner() {
  return (
    <div className="mx-auto max-w-md">
      <StackTheme>
        <SignIn />
      </StackTheme>
    </div>
  );
}
