import { useState } from "react";
import { Button } from "@/components/ui/button";

export default function ModerationPage(){
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [sent, setSent] = useState(false);

  const submit = async () => {
    await fetch('/api/report', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subject, description }) });
    setSent(true); setSubject(""); setDescription("");
  };

  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <h1 className="text-2xl font-bold">Moderation & Reporting</h1>
      <p className="text-sm text-muted-foreground">Report scams, abusive behavior, or exploitative postings.</p>
      <section className="rounded-xl border bg-card p-5 grid gap-3">
        <h2 className="font-semibold">Submit a report</h2>
        {sent && <div className="text-sm text-emerald-600">Thanks! We received your report.</div>}
        <input className="rounded-md border bg-background px-3 py-2" placeholder="Subject" value={subject} onChange={(e)=>setSubject(e.target.value)} />
        <textarea className="rounded-md border bg-background px-3 py-2" placeholder="Describe the issue" value={description} onChange={(e)=>setDescription(e.target.value)} />
        <div className="flex justify-end"><Button onClick={submit} disabled={!subject || !description}>Send</Button></div>
      </section>
    </div>
  );
}
