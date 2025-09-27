import React, { Suspense } from "react";
const Lazy = React.lazy(() => import("./ProfileInner"));

export default function ProfilePage() {
  return (
    <Suspense fallback={<div className="text-center">Loading profile...</div>}>
      <Lazy />
    </Suspense>
  );
}
