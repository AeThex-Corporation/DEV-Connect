import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter, Search } from "lucide-react";
import { apiGet, apiPost, Job } from "@/services/api";
import { useUser } from "@/lib/fake-stack";

export default function JobsInner() {
  const user = useUser();
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [comp, setComp] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (role) params.set("role", role);
    if (comp) params.set("comp", comp);
    if (genre) params.set("genre", genre);
    const data = await apiGet<Job[]>(`/api/jobs?${params.toString()}`);
    setJobs(data);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const filtered = useMemo(() => jobs, [jobs]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <aside className="rounded-xl border bg-card p-4 h-fit">
        <div className="flex items-center gap-2 font-semibold"><Filter className="h-4 w-4" /> Filters</div>
        <FilterGroup title="Role" value={role} onChange={setRole} options={["Scripter","Builder","Designer","Animator"]} />
        <FilterGroup title="Compensation" value={comp} onChange={setComp} options={["USD/Hourly","Robux","Percent","Rev Share"]} />
        <FilterGroup title="Genre" value={genre} onChange={setGenre} options={["Simulator","FPS","Adventure","RPG"]} />
        <Button variant="ghost" className="w-full mt-2" onClick={() => { setRole(null); setComp(null); setGenre(null); setQuery(""); load(); }}>Reset</Button>
      </aside>

      <section>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e)=>{ if(e.key==='Enter'){ load(); } }}
                placeholder="Search jobs..."
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="text-sm text-muted-foreground">{loading ? "Loading..." : `${filtered.length} results`}</div>
          </div>
        </div>

        {user && <CreateJob onCreated={load} stackUserId={user.id} />}

        <div className="mt-4 grid gap-4">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} stackUserId={user?.id} onApplied={load} />
          ))}
          {!filtered.length && !loading && (
            <div className="rounded-xl border bg-card p-6 text-center text-sm text-muted-foreground">No jobs found.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function CreateJob({ onCreated, stackUserId }: { onCreated: () => void; stackUserId: string }) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [comp, setComp] = useState("USD/Hourly");
  const [genre, setGenre] = useState("");
  const [scope, setScope] = useState("");
  const [description, setDescription] = useState("");
  const submit = async () => {
    await apiPost(`/api/jobs`, { title, role, comp, genre, scope, description, stack_user_id: stackUserId });
    setOpen(false);
    setTitle(""); setRole(""); setGenre(""); setScope(""); setDescription("");
    onCreated();
  };
  return (
    <div className="mt-4 rounded-xl border bg-card p-5">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">Post a job</h3>
        <Button variant="outline" onClick={()=>setOpen(v=>!v)}>{open ? "Close" : "Open"}</Button>
      </div>
      {open && (
        <div className="mt-4 grid gap-3">
          <input className="rounded-md border bg-background px-3 py-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
          <div className="grid sm:grid-cols-3 gap-3">
            <input className="rounded-md border bg-background px-3 py-2" placeholder="Role" value={role} onChange={(e)=>setRole(e.target.value)} />
            <select className="rounded-md border bg-background px-3 py-2" value={comp} onChange={(e)=>setComp(e.target.value)}>
              <option>USD/Hourly</option><option>Robux</option><option>Percent</option><option>Rev Share</option>
            </select>
            <input className="rounded-md border bg-background px-3 py-2" placeholder="Genre" value={genre} onChange={(e)=>setGenre(e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input className="rounded-md border bg-background px-3 py-2" placeholder="Scope" value={scope} onChange={(e)=>setScope(e.target.value)} />
            <textarea className="rounded-md border bg-background px-3 py-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
          </div>
          <div className="flex justify-end"><Button onClick={submit} disabled={!title || !role}>Publish</Button></div>
        </div>
      )}
    </div>
  );
}

function FilterGroup({ title, options, value, onChange }: { title: string; options: string[]; value: string | null; onChange: (v: string | null) => void }) {
  return (
    <div className="mt-4">
      <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</div>
      <div className="mt-2 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              type="button"
              key={opt}
              onClick={() => onChange(active ? null : opt)}
              className={cn(
                "rounded-md border px-2.5 py-1.5 text-xs",
                active ? "bg-primary text-primary-foreground border-transparent" : "bg-background hover:bg-accent"
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function JobCard({ job, stackUserId, onApplied }: { job: Job; stackUserId?: string; onApplied: () => void }) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const apply = async () => {
    if (!stackUserId) return;
    await apiPost(`/api/jobs/${job.id}/apply`, { applicant_stack_user_id: stackUserId, message });
    setOpen(false); setMessage(""); onApplied();
  };
  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold leading-tight">{job.title}</h3>
          <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-muted-foreground">Role</dt><dd>{job.role}</dd></div>
            <div><dt className="text-muted-foreground">Compensation</dt><dd>{job.comp}</dd></div>
            <div><dt className="text-muted-foreground">Genre</dt><dd>{job.genre ?? "—"}</dd></div>
            <div><dt className="text-muted-foreground">Scope</dt><dd>{job.scope ?? "—"}</dd></div>
          </dl>
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          {stackUserId ? (
            <>
              <Button onClick={()=>setOpen(v=>!v)}>{open ? "Cancel" : "Apply"}</Button>
            </>
          ) : (
            <a href="/auth" className="text-sm underline">Sign in to apply</a>
          )}
        </div>
      </div>
      {open && (
        <div className="mt-3 grid gap-2">
          <textarea className="rounded-md border bg-background px-3 py-2" placeholder="Your pitch / relevant portfolio" value={message} onChange={(e)=>setMessage(e.target.value)} />
          <div className="flex justify-end"><Button onClick={apply} disabled={!message}>Send application</Button></div>
        </div>
      )}
    </article>
  );
}
