import { useEffect } from "react";
import { useUser } from "@/lib/fake-stack";

export default function MyProfileRedirect() {
  const user = useUser();
  useEffect(() => {
    if (user?.id) {
      window.location.replace(`/u/${encodeURIComponent(user.id)}`);
    } else {
      window.location.replace(`/auth`);
    }
  }, [user?.id]);
  return null;
}
