import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Filter, Search, Star } from "lucide-react";

interface Job {
  id: string;
  title: string;
  role: string;
  comp: "Percent" | "Robux" | "USD/Hourly" | "Rev Share";
  genre: string;
  scope: "Small task" | "Full Game" | "Long-term";
  experience: "Junior" | "Mid" | "Senior";
}

const JOBS: Job[] = [
  { id: "1", title: "Lead Scripter for Simulator", role: "Scripter", comp: "USD/Hourly", genre: "Simulator", scope: "Long-term", experience: "Senior" },
  { id: "2", title: "Terrain Artist", role: "Builder", comp: "Robux", genre: "Adventure", scope: "Small task", experience: "Mid" },
  { id: "3", title: "UI/UX Designer", role: "Designer", comp: "Rev Share", genre: "FPS", scope: "Full Game", experience: "Senior" },
  { id: "4", title: "Animator for RPG", role: "Animator", comp: "Percent", genre: "RPG", scope: "Long-term", experience: "Mid" },
];

export default function Jobs() {
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<string | null>(null);
  const [comp, setComp] = useState<string | null>(null);
  const [genre, setGenre] = useState<string | null>(null);
  const [experience, setExperience] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return JOBS.filter((j) =>
      (!query || j.title.toLowerCase().includes(query.toLowerCase())) &&
      (!role || j.role === role) &&
      (!comp || j.comp === comp) &&
      (!genre || j.genre === genre) &&
      (!experience || j.experience === experience)
    );
  }, [query, role, comp, genre, experience]);

  return (
    <div className="grid gap-6 lg:grid-cols-[280px,1fr]">
      <aside className="rounded-xl border bg-card p-4 h-fit">
        <div className="flex items-center gap-2 font-semibold"><Filter className="h-4 w-4" /> Filters</div>
        <FilterGroup title="Role" value={role} onChange={setRole} options={["Scripter","Builder","Designer","Animator"]} />
        <FilterGroup title="Compensation" value={comp} onChange={setComp} options={["USD/Hourly","Robux","Percent","Rev Share"]} />
        <FilterGroup title="Genre" value={genre} onChange={setGenre} options={["Simulator","FPS","Adventure","RPG"]} />
        <FilterGroup title="Experience" value={experience} onChange={setExperience} options={["Junior","Mid","Senior"]} />
        <Button variant="ghost" className="w-full mt-2" onClick={() => { setRole(null); setComp(null); setGenre(null); setExperience(null); setQuery(""); }}>Reset</Button>
      </aside>

      <section>
        <div className="rounded-xl border bg-card p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search jobs..."
                className="w-full rounded-md border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div className="text-sm text-muted-foreground">{filtered.length} results</div>
          </div>
        </div>

        <div className="mt-4 grid gap-4">
          {filtered.map((j) => (
            <JobCard key={j.id} job={j} />
          ))}
        </div>
      </section>
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

function JobCard({ job }: { job: Job }) {
  return (
    <article className="rounded-xl border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold leading-tight">{job.title}</h3>
          <dl className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 text-sm">
            <div><dt className="text-muted-foreground">Role</dt><dd>{job.role}</dd></div>
            <div><dt className="text-muted-foreground">Compensation</dt><dd>{job.comp}</dd></div>
            <div><dt className="text-muted-foreground">Genre</dt><dd>{job.genre}</dd></div>
            <div><dt className="text-muted-foreground">Scope</dt><dd>{job.scope}</dd></div>
          </dl>
          <div className="mt-3 flex items-center gap-1 text-amber-500">
            {[...Array(job.experience === "Senior" ? 5 : job.experience === "Mid" ? 4 : 3)].map((_, i) => (
              <Star key={i} className="h-4 w-4 fill-current" />
            ))}
          </div>
        </div>
        <div className="shrink-0 flex flex-col gap-2">
          <Button>Apply</Button>
          <Button variant="outline">Save</Button>
        </div>
      </div>
    </article>
  );
}
