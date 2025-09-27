import React, { Suspense } from "react";
const Lazy = React.lazy(() => import("./UserStatusInner"));

export function UserStatus() {
  return (
    <Suspense fallback={<a href="/auth" className="hidden sm:inline text-sm underline">Sign in</a>}>
      <Lazy />
    </Suspense>
  );
}
