export default function ContractsPage() {
  return (
    <div className="mx-auto max-w-3xl grid gap-6">
      <h1 className="text-2xl font-bold">Contract Templates</h1>
      <p className="text-sm text-muted-foreground">
        Use these basics to set expectations on scope, pay, and timelines.
      </p>
      <section className="rounded-xl border bg-card p-5 grid gap-3">
        <h2 className="font-semibold">Templates</h2>
        <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
          <li>
            <a
              download
              href={URL.createObjectURL(
                new Blob([BASIC_TEXT], { type: "text/plain" }),
              )}
              className="underline"
            >
              Basic Work Agreement.txt
            </a>
          </li>
          <li>
            <a
              download
              href={URL.createObjectURL(
                new Blob([REVSHARE_TEXT], { type: "text/plain" }),
              )}
              className="underline"
            >
              Rev Share Addendum.txt
            </a>
          </li>
        </ul>
      </section>
    </div>
  );
}

const BASIC_TEXT = `Title: Work Agreement\n\nParties: [Employer] and [Developer]\nScope: [Describe]\nCompensation: [Robux/USD/%]\nMilestones: [Dates]\nOwnership: [Terms]\nConfidentiality: [Terms]\nTermination: [Terms]\n`;
const REVSHARE_TEXT = `Rev Share Addendum\n\nShare: [%]\nReporting: [Frequency]\nPayouts: [Method]`;
