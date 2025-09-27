import React from "react";
import { useUser, UserButton } from "@/lib/fake-stack";
import { Link } from "react-router-dom";

export default function UserStatusInner() {
  const user = useUser();
  if (user) {
    return (
      <>
        <UserButton />
      </>
    );
  }
  return (
    <Link to="/auth" className="hidden sm:inline text-sm underline">
      Sign in
    </Link>
  );
}
