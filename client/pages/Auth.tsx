import React, { Suspense } from "react";
const Lazy = React.lazy(() => import("./AuthInner"));

export default function Auth() {
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <Lazy />
    </Suspense>
  );
}
