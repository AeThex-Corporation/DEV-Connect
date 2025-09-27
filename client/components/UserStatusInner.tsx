import React from "react";
import { useUser, UserButton } from "@/lib/fake-stack";
import { Link } from "react-router-dom";

export default function UserStatusInner() {
  const user = useUser();
  if (user) {
    return (
      <>
        <Link
          to="/profile"
          className="hidden sm:inline text-sm text-muted-foreground hover:text-foreground"
        >
          Profile
        </Link>
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
