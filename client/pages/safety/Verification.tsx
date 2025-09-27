import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Crown, Shield, Star } from "lucide-react";

export default function VerificationPage() {
  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <h1 className="text-2xl font-bold">Verification & Ratings</h1>
      <p className="text-sm text-muted-foreground">
        Verification confirms identity and credibility. Ratings reflect
        community feedback.
      </p>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Badges</h2>
        <ul className="mt-3 grid sm:grid-cols-3 gap-3 text-sm">
          <li className="rounded-md border p-3">
            <div className="flex items-center gap-2 font-medium">
              <BadgeCheck className="h-4 w-4 text-primary" /> Verified Talent
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Granted by admins after review. Independent from Passport.
            </p>
          </li>
          <li className="rounded-md border p-3">
            <div className="flex items-center gap-2 font-medium">
              <Shield className="h-4 w-4 text-blue-500" /> Admin
            </div>
            <p className="mt-2 text-muted-foreground text-xs">
              Platform moderator.
            </p>
          </li>
          <li className="rounded-md border p-3">
            <div className="flex items-center gap-2 font-medium">
              <Crown className="h-4 w-4 text-yellow-500" /> Owner
            </div>
            <p className="mt-2 text-muted-foreground text-xs">Site owner.</p>
          </li>
        </ul>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Ratings</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Users can rate profiles 1–5 stars after collaborations. We compute an
          average score.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 text-sm">
          <Star className="h-4 w-4 text-yellow-500" /> Example: 4.7 average from
          123 ratings
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Passport</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Passport proves account ownership via a unique ID. It does not grant
          Verified status.
        </p>
      </section>
    </div>
  );
}
