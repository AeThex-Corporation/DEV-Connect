import React, { Suspense } from "react";
const Lazy = React.lazy(() => import("./MessagesInner"));

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="text-center">Loading messages...</div>}>
      <Lazy />
    </Suspense>
  );
}
