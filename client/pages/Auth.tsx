import React, { Suspense, useEffect } from "react";
import { useUser } from "@/lib/fake-stack";
import { useNavigate } from "react-router-dom";
const Lazy = React.lazy(() => import("./AuthInner"));

export default function Auth() {
  const user = useUser();
  const nav = useNavigate();
  useEffect(() => {
    if (user) nav("/onboarding", { replace: true });
  }, [user]);
  if (user) return null;
  return (
    <Suspense fallback={<div className="text-center">Loading...</div>}>
      <Lazy />
    </Suspense>
  );
}
