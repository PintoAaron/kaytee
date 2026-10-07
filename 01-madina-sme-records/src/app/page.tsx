import Link from "next/link";
import config from "@/survey.config";
import { allItems } from "@/lib/survey-logic";

export default function Home() {
  const questionCount = allItems(config).length;
  const iv = config.constructs.find((c) => c.role === "independent");
  const dv = config.constructs.find((c) => c.role === "dependent");

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <p className="text-sm font-medium text-accent">{config.institution}</p>
      <h1 className="mt-2 text-2xl font-semibold leading-tight sm:text-3xl">{config.title}</h1>
      <p className="mt-4 text-muted">{config.problem}</p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/survey" className="rounded-lg bg-accent px-5 py-3 font-medium text-white hover:opacity-90">
          Start the questionnaire
        </Link>
        <Link href="/admin" className="rounded-lg border border-border bg-surface px-5 py-3 font-medium hover:bg-background">
          Researcher dashboard
        </Link>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <Card title="Study population">{config.population}</Card>
        <Card title="Questionnaire">
          {config.sections.length} sections · {questionCount} questions · about 10 minutes
        </Card>
        {iv && (
          <Card title={`${iv.side} variable (independent)`}>
            {iv.label} <span className="text-muted">({iv.key})</span>
          </Card>
        )}
        {dv && (
          <Card title={`${dv.side} variable (dependent)`}>
            {dv.label} <span className="text-muted">({dv.key})</span>
          </Card>
        )}
      </div>

      <h2 className="mt-10 text-lg font-semibold">Research objectives</h2>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-muted">
        {config.objectives.map((o) => (
          <li key={o}>{o}</li>
        ))}
      </ol>

      <h2 className="mt-8 text-lg font-semibold">Hypotheses</h2>
      <ul className="mt-3 space-y-2 text-muted">
        {config.hypotheses.map((h) => (
          <li key={h}>{h}</li>
        ))}
      </ul>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
      <p className="mt-1">{children}</p>
    </div>
  );
}
