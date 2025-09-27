import React, { Suspense } from "react";
const Lazy = React.lazy(() => import("./JobsInner"));

export default function Jobs() {
  return (
    <Suspense fallback={<div className="text-center">Loading jobs...</div>}>
      <Lazy />
    </Suspense>
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
