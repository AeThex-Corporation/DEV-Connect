import { useEffect, useMemo, useState } from "react";
import { useUser } from "@/lib/fake-stack";
import { Button } from "@/components/ui/button";

export default function AdminPage() {
  const user = useUser();
  const [tab, setTab] = useState<
    "featured" | "tickets" | "reports" | "verification"
  >("featured");
  const headers = useMemo(
    () => ({
      "Content-Type": "application/json",
      "x-user-id": user?.id || "",
    }),
    [user?.id],
  );

  if (!user) {
    return (
      <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
        Sign in to access admin.
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="flex items-center gap-2">
        <Button
          variant={tab === "featured" ? undefined : "outline"}
          onClick={() => setTab("featured")}
        >
          Featured
        </Button>
        <Button
          variant={tab === "tickets" ? undefined : "outline"}
          onClick={() => setTab("tickets")}
        >
          Tickets
        </Button>
        <Button
          variant={tab === "reports" ? undefined : "outline"}
          onClick={() => setTab("reports")}
        >
          Reports
        </Button>
        <Button
          variant={tab === "verification" ? undefined : "outline"}
          onClick={() => setTab("verification")}
        >
          Verification
        </Button>
      </div>
      {tab === "featured" && <Featured headers={headers} />}
      {tab === "tickets" && <Tickets headers={headers} />}
      {tab === "reports" && <Reports headers={headers} />}
      {tab === "verification" && <VerificationAdmin headers={headers} />}
    </div>
  );
}

function VerificationAdmin({ headers }: { headers: Record<string, string> }) {
  const [stackUserId, setStackUserId] = useState("");
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const load = async () => {
    if (!stackUserId) return;
    setLoading(true);
    const p = await fetch(
      `/api/admin/profiles/${encodeURIComponent(stackUserId)}`,
      {
        headers,
      },
    ).then((r) => r.json());
    setProfile(p);
    setLoading(false);
  };
  const setVerified = async (val: boolean) => {
    if (!stackUserId) return;
    setLoading(true);
    const p = await fetch(
      `/api/admin/profiles/${encodeURIComponent(stackUserId)}/verify`,
      {
        method: "PATCH",
        headers,
        body: JSON.stringify({ is_verified: val }),
      },
    ).then((r) => r.json());
    setProfile(p);
    setLoading(false);
  };
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Verification</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input
          className="rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2"
          placeholder="stack_user_id"
          value={stackUserId}
          onChange={(e) => setStackUserId(e.target.value)}
        />
        <Button onClick={load} disabled={!stackUserId || loading}>
          {loading ? "Loading..." : "Load"}
        </Button>
      </div>
      {profile && (
        <div className="mt-4 text-sm flex items-center justify-between">
          <div>
            <div className="text-muted-foreground">{profile.stack_user_id}</div>
            <div className="mt-1">
              Status: {profile.is_verified ? "Verified" : "Not verified"}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setVerified(false)}
              disabled={loading || !profile.is_verified}
            >
              Unverify
            </Button>
            <Button
              onClick={() => setVerified(true)}
              disabled={loading || profile.is_verified}
            >
              Verify
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}

function Featured({ headers }: { headers: Record<string, string> }) {
  const [devs, setDevs] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [stackUserId, setStackUserId] = useState("");
  const [jobId, setJobId] = useState("");

  const load = async () => {
    const d = await fetch("/api/admin/featured/devs", { headers }).then((r) =>
      r.json(),
    );
    const j = await fetch("/api/admin/featured/jobs", { headers }).then((r) =>
      r.json(),
    );
    setDevs(d);
    setJobs(j);
  };
  useEffect(() => {
    load(); /* eslint-disable-line */
  }, []);

  const addDev = async () => {
    if (!stackUserId) return;
    await fetch("/api/admin/featured/devs", {
      method: "POST",
      headers,
      body: JSON.stringify({ stack_user_id: stackUserId }),
    });
    setStackUserId("");
    load();
  };
  const addJob = async () => {
    if (!jobId) return;
    await fetch("/api/admin/featured/jobs", {
      method: "POST",
      headers,
      body: JSON.stringify({ job_id: Number(jobId) }),
    });
    setJobId("");
    load();
  };
  const removeDev = async (id: string) => {
    await fetch(`/api/admin/featured/devs/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers,
    });
    load();
  };
  const removeJob = async (id: number) => {
    await fetch(`/api/admin/featured/jobs/${id}`, {
      method: "DELETE",
      headers,
    });
    load();
  };

  return (
    <div className="grid gap-4">
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Featured developers</h2>
        <div className="mt-3 flex gap-2">
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="stack_user_id"
            value={stackUserId}
            onChange={(e) => setStackUserId(e.target.value)}
          />
          <Button onClick={addDev}>Add</Button>
        </div>
        <ul className="mt-3 text-sm">
          {devs.map((d) => (
            <li
              key={d.stack_user_id}
              className="flex items-center justify-between py-1"
            >
              <span>{d.display_name || d.stack_user_id}</span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeDev(d.stack_user_id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </section>
      <section className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Featured jobs</h2>
        <div className="mt-3 flex gap-2">
          <input
            className="rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="job id"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
          />
          <Button onClick={addJob}>Add</Button>
        </div>
        <ul className="mt-3 text-sm">
          {jobs.map((j) => (
            <li key={j.id} className="flex items-center justify-between py-1">
              <span>
                {j.title} (#{j.id})
              </span>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeJob(j.id)}
              >
                Remove
              </Button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Tickets({ headers }: { headers: Record<string, string> }) {
  const [items, setItems] = useState<any[]>([]);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const load = async () => {
    const data = await fetch("/api/admin/tickets", { headers }).then((r) =>
      r.json(),
    );
    setItems(data);
  };
  useEffect(() => {
    load(); /* eslint-disable-line */
  }, []);

  const create = async () => {
    await fetch("/api/admin/tickets", {
      method: "POST",
      headers,
      body: JSON.stringify({
        stack_user_id: headers["x-user-id"],
        subject,
        body,
      }),
    });
    setSubject("");
    setBody("");
    load();
  };
  const update = async (id: number, status: string) => {
    await fetch(`/api/admin/tickets/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    load();
  };

  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Support tickets</h2>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        <input
          className="rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Subject"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
        />
        <input
          className="rounded-md border bg-background px-3 py-2 text-sm sm:col-span-2"
          placeholder="Body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <div className="sm:col-span-3 flex justify-end">
          <Button onClick={create}>Create ticket</Button>
        </div>
      </div>
      <ul className="mt-4 text-sm">
        {items.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-1">
            <span>
              #{t.id} · {t.subject} · {t.status}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(t.id, "in_progress")}
              >
                In progress
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(t.id, "closed")}
              >
                Close
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Reports({ headers }: { headers: Record<string, string> }) {
  const [items, setItems] = useState<any[]>([]);
  const load = async () => {
    const data = await fetch("/api/admin/reports", { headers }).then((r) =>
      r.json(),
    );
    setItems(data);
  };
  useEffect(() => {
    load(); /* eslint-disable-line */
  }, []);
  const update = async (id: number, status: string) => {
    await fetch(`/api/admin/reports/${id}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    load();
  };
  return (
    <section className="rounded-xl border bg-card p-5">
      <h2 className="font-semibold">Reports</h2>
      <ul className="mt-3 text-sm">
        {items.map((r) => (
          <li key={r.id} className="flex items-center justify-between py-1">
            <span>
              #{r.id} · {r.subject} · {r.status}
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(r.id, "in_review")}
              >
                In review
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => update(r.id, "resolved")}
              >
                Resolve
              </Button>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
