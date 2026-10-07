import Link from "next/link";
import type { SurveyConfig } from "@/lib/survey-types";
import { level, type Analysis, type ConstructStat, type Relationship } from "@/lib/analysis";
import { fmt, fmtP, strengthLabel, type Regression } from "@/lib/stats";
import { addDemoData, clearDemoData, logout } from "@/app/admin/actions";
import Scatter from "./Scatter";

const ALPHA = 0.05;

export default function Dashboard({
  config,
  analysis,
  includeDemo,
  counts,
}: {
  config: SurveyConfig;
  analysis: Analysis;
  includeDemo: boolean;
  counts: { real: number; demo: number };
}) {
  const { totals } = analysis;
  const demoQuery = includeDemo ? "&demo=1" : "";
  const enough = totals.complete >= 10;

  return (
    <div className="space-y-10">
      <div className="no-print flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Research dashboard</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted">{config.title}</p>
        </div>
        <form action={logout}>
          <button className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-surface">Sign out</button>
        </form>
      </div>

      {/* Data source + tools */}
      <div className="no-print grid gap-4 md:grid-cols-3">
        <Panel title="Data source">
          <p className="text-sm">
            <strong>{counts.real}</strong> real · <strong>{counts.demo}</strong> demo responses stored
          </p>
          <div className="mt-3 flex gap-2 text-sm">
            <Link
              href="/admin"
              className={`rounded-md px-3 py-1.5 ${!includeDemo ? "bg-accent text-white" : "border border-border"}`}
            >
              Real only
            </Link>
            <Link
              href="/admin?demo=1"
              className={`rounded-md px-3 py-1.5 ${includeDemo ? "bg-accent text-white" : "border border-border"}`}
            >
              Include demo
            </Link>
          </div>
          {includeDemo && counts.demo > 0 && (
            <p className="mt-3 text-xs text-amber-700 dark:text-amber-300">
              Demo responses are synthetic. Don&apos;t report results computed from them.
            </p>
          )}
        </Panel>
        <Panel title="Demo data">
          <form action={addDemoData} className="flex items-center gap-2 text-sm">
            <input
              name="count"
              type="number"
              defaultValue={120}
              min={10}
              max={500}
              className="w-20 rounded-md border border-border bg-background px-2 py-1.5"
              aria-label="Number of demo responses"
            />
            <button className="rounded-md border border-border px-3 py-1.5 hover:bg-background">Generate</button>
          </form>
          <form action={clearDemoData} className="mt-2">
            <button className="text-sm text-red-600 hover:underline dark:text-red-400" disabled={!counts.demo}>
              Delete all demo responses
            </button>
          </form>
        </Panel>
        <Panel title="Export">
          <ul className="space-y-1 text-sm">
            <li>
              <a className="text-accent hover:underline" href={`/api/export?format=csv${demoQuery}`}>
                Responses: coded CSV (for SPSS/Excel)
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href={`/api/export?format=labels${demoQuery}`}>
                Responses: labelled CSV
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="/api/export?format=codebook">
                Codebook (CSV)
              </a>
            </li>
            <li>
              <a className="text-accent hover:underline" href="/api/export?format=sps">
                SPSS syntax for labels (.sps)
              </a>
            </li>
          </ul>
        </Panel>
      </div>

      <nav className="no-print flex flex-wrap gap-2 text-sm">
        {[
          ["overview", "Overview"],
          ["profile", "Respondent profile"],
          ...config.constructs.map((c) => [`c-${c.key}`, c.label]),
          ["relationship", "Relationship"],
          ["groups", "Group comparisons"],
        ].map(([id, label]) => (
          <a key={id} href={`#${id}`} className="rounded-full border border-border bg-surface px-3 py-1 hover:bg-background">
            {label}
          </a>
        ))}
      </nav>

      <section id="overview" className="scroll-mt-4">
        <H2>Overview</H2>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat label="All submissions" value={totals.all} />
          <Stat label="Completed (analysed)" value={totals.complete} />
          <Stat label="Screened out" value={totals.screenedOut} />
          <Stat label="Median time" value={Number.isFinite(totals.medianMinutes) ? `${fmt(totals.medianMinutes, 1)} min` : "–"} />
        </div>
        {totals.screenedOut > 0 && (
          <Table
            caption="Reasons for screening out (first failed eligibility question)"
            head={["Question", "n", "%"]}
            rows={analysis.screening.map((s) => [s.label, s.n, `${fmt(s.pct, 1)}%`])}
          />
        )}
        {!enough && (
          <p className="mt-4 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
            Fewer than 10 completed responses, so the statistical tests below are not meaningful yet. Collect more data, or
            generate demo data to preview the dashboard.
          </p>
        )}
        {analysis.relationships.map((rel) => (
          <Headline key={`${rel.iv.key}-${rel.dv.key}`} rel={rel} />
        ))}
      </section>

      <section id="profile" className="scroll-mt-4">
        <H2>Respondent profile</H2>
        <p className="mb-4 text-sm text-muted">Completed responses only. For multiple-response questions, percentages are of respondents and can sum to more than 100%.</p>
        <div className="grid gap-6 lg:grid-cols-2">
          {analysis.profile.map((t) => (
            <FreqTable key={t.id} id={t.id} title={t.text} base={t.base} multi={t.kind === "multi"} rows={t.rows} />
          ))}
        </div>
        {analysis.numeric.length > 0 && (
          <Table
            caption="Numeric questions"
            head={["Question", "n", "Mean", "SD", "Median", "Min", "Max"]}
            rows={analysis.numeric.map((q) => [
              `${q.id}. ${q.text}`,
              q.desc.n,
              fmt(q.desc.mean),
              fmt(q.desc.sd),
              fmt(q.desc.median),
              fmt(q.desc.min, 0),
              fmt(q.desc.max, 0),
            ])}
          />
        )}
      </section>

      {analysis.constructs.map((c) => (
        <ConstructSection key={c.construct.key} stat={c} />
      ))}

      <section id="relationship" className="scroll-mt-4">
        <H2>Relationship between the variables</H2>
        {analysis.relationships.map((rel) => (
          <RelationshipBlock key={`${rel.iv.key}-${rel.dv.key}`} rel={rel} />
        ))}
      </section>

      <section id="groups" className="scroll-mt-4">
        <H2>Group comparisons</H2>
        <p className="mb-4 text-sm text-muted">
          Mean composite scores by respondent group. These are descriptive. Use the exported data for formal tests
          (e.g. Kruskal-Wallis) if you need them.
        </p>
        <div className="space-y-6">
          {analysis.groups.map((g) => {
            const iv = config.constructs.find((c) => c.role === "independent")!;
            const dv = config.constructs.find((c) => c.role === "dependent")!;
            return (
              <Table
                key={g.id}
                caption={`${g.id}. ${g.text}`}
                head={["Group", "n", `${iv.key} mean`, `${dv.key} mean`, `${dv.key} SD`]}
                rows={g.rows.map((r) => [r.label, r.n, fmt(r.iv), fmt(r.dv), fmt(r.dvSd)])}
              />
            );
          })}
        </div>
      </section>

      <section className="text-xs text-muted">
        <H3>Notes on interpretation</H3>
        <ul className="list-disc space-y-1 pl-5">
          <li>Composite scores are the mean of a construct&apos;s 5-point items. Reverse-worded items (marked ®) are recoded as 6 − x first.</li>
          <li>Levels: 1.00–2.49 = Low, 2.50–3.49 = Moderate, 3.50–5.00 = High.</li>
          <li>Cronbach&apos;s α ≥ .70 is usually treated as acceptable internal consistency.</li>
          <li>Correlation strength (Cohen): |r| &lt; .10 negligible, .10–.29 weak, .30–.49 moderate, ≥ .50 strong.</li>
          <li>Spearman&apos;s rho is the main test because Likert composites are ordinal. Pearson and regression are shown for comparison.</li>
          <li>Significance level α = {ALPHA}.</li>
        </ul>
      </section>
    </div>
  );
}

// ---------- blocks ----------

function Headline({ rel }: { rel: Relationship }) {
  const s = rel.spearman;
  if (!Number.isFinite(s.r)) return null;
  const sig = s.p < ALPHA;
  return (
    <div className="mt-4 rounded-xl border-l-4 border-accent bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">Hypothesis test</p>
      <p className="mt-1">
        <strong>
          {rel.iv.label} → {rel.dv.label}:
        </strong>{" "}
        r<sub>s</sub>({s.df}) = {fmt(s.r)}, p {fmtP(s.p).startsWith("<") ? fmtP(s.p) : `= ${fmtP(s.p)}`}.{" "}
        {sig ? (
          <span className="font-medium text-accent">H₀ rejected</span>
        ) : (
          <span className="font-medium">H₀ not rejected</span>
        )}
      </p>
      <p className="mt-2 text-sm text-muted">{interpretation(rel)}</p>
    </div>
  );
}

function interpretation(rel: Relationship): string {
  const s = rel.spearman;
  const dir = s.r >= 0 ? "positive" : "negative";
  const pText = fmtP(s.p).startsWith("<") ? `p ${fmtP(s.p)}` : `p = ${fmtP(s.p)}`;
  const base = `A Spearman's rank-order correlation was run to assess the relationship between ${rel.iv.label.toLowerCase()} and ${rel.dv.label.toLowerCase()} among ${s.n} respondents. There was a ${strengthLabel(s.r)} ${dir} correlation, rs(${s.df}) = ${fmt(s.r)}, ${pText}.`;
  if (s.p < ALPHA)
    return `${base} The relationship is statistically significant at the 5% level, so the null hypothesis is rejected: higher ${rel.iv.label.toLowerCase()} is associated with ${s.r >= 0 ? "better" : "poorer"} ${rel.dv.label.toLowerCase()}.`;
  return `${base} The relationship is not statistically significant at the 5% level, so the null hypothesis is not rejected.`;
}

function ConstructSection({ stat }: { stat: ConstructStat }) {
  const c = stat.construct;
  return (
    <section id={`c-${c.key}`} className="scroll-mt-4">
      <H2>
        {c.label} <span className="text-base font-normal text-muted">({c.key} · {c.side} variable)</span>
      </H2>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Items" value={stat.itemCount} />
        <Stat label="Cronbach's α" value={fmt(stat.alpha)} hint={alphaLabel(stat.alpha)} />
        <Stat label="Mean (1–5)" value={fmt(stat.desc.mean)} hint={Number.isFinite(stat.desc.mean) ? level(stat.desc.mean) : undefined} />
        <Stat label="SD" value={fmt(stat.desc.sd)} />
        <Stat label="n" value={stat.desc.n} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <FreqTable id={`${c.key}_level`} title={`Level of ${c.label.toLowerCase()}`} base={stat.desc.n} rows={stat.levels} />
        <Table
          caption="Sub-dimensions"
          head={["Dimension", "Items", "α", "Mean", "SD", "Level"]}
          rows={stat.dimensions.map((d) => [
            d.name,
            d.itemCount,
            fmt(d.alpha),
            fmt(d.desc.mean),
            fmt(d.desc.sd),
            Number.isFinite(d.desc.mean) ? level(d.desc.mean) : "–",
          ])}
        />
      </div>

      <Table
        caption="Item statistics (means after reverse-coding; distribution shows raw answers 1–5 in %)"
        head={["Item", "Statement", "Mean", "SD", "Level", "1", "2", "3", "4", "5"]}
        rows={stat.items.map((i) => {
          const n = i.dist.reduce((a, b) => a + b, 0) || 1;
          return [
            i.id,
            `${i.text}${i.reverse ? " ®" : ""}`,
            fmt(i.mean),
            fmt(i.sd),
            Number.isFinite(i.mean) ? level(i.mean) : "–",
            ...i.dist.map((d) => fmt((100 * d) / n, 0)),
          ];
        })}
      />
    </section>
  );
}

function RelationshipBlock({ rel }: { rel: Relationship }) {
  const ct = rel.crosstab;
  return (
    <div className="space-y-8">
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <Table
            caption="Correlation between composite scores"
            head={["Test", "n", "r", "p", "Strength"]}
            rows={[
              ["Spearman's rho", rel.spearman.n, fmt(rel.spearman.r, 3), fmtP(rel.spearman.p), strengthLabel(rel.spearman.r)],
              ["Pearson's r", rel.pearson.n, fmt(rel.pearson.r, 3), fmtP(rel.pearson.p), strengthLabel(rel.pearson.r)],
            ]}
          />
          <Table
            caption={`Spearman correlation of ${rel.iv.key} with each ${rel.dv.key} dimension`}
            head={["Dimension", "rho", "p", "Strength"]}
            rows={rel.byDimension.map((d) => [d.name, fmt(d.spearman.r, 3), fmtP(d.spearman.p), strengthLabel(d.spearman.r)])}
          />
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <p className="mb-2 text-sm font-medium">
            Scatter plot: {rel.iv.key} (x) vs {rel.dv.key} (y)
          </p>
          <Scatter points={rel.points} xLabel={rel.iv.label} yLabel={rel.dv.label} slope={rel.simple} />
        </div>
      </div>

      <div>
        <H3>
          Cross-tabulation of levels: {rel.iv.key} × {rel.dv.key} (chi-square test of independence)
        </H3>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted">
                <th className="py-2 pr-3 font-medium">
                  {rel.iv.key} level ↓ / {rel.dv.key} level →
                </th>
                {ct.cols.map((c) => (
                  <th key={c} className="py-2 pr-3 font-medium">
                    {c}
                  </th>
                ))}
                <th className="py-2 pr-3 font-medium">Total</th>
              </tr>
            </thead>
            <tbody>
              {ct.rows.map((r, i) => {
                const rowTotal = ct.observed[i].reduce((a, b) => a + b, 0);
                return (
                  <tr key={r} className="border-b border-border">
                    <td className="py-2 pr-3 font-medium">{r}</td>
                    {ct.observed[i].map((v, j) => (
                      <td key={j} className="py-2 pr-3 tabular-nums">
                        {v} <span className="text-muted">({fmt(rowTotal ? (100 * v) / rowTotal : 0, 0)}%)</span>
                      </td>
                    ))}
                    <td className="py-2 pr-3 tabular-nums">{rowTotal}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-sm">
          χ²({ct.df}, N = {ct.n}) = {fmt(ct.x2)}, p {fmtP(ct.p).startsWith("<") ? fmtP(ct.p) : `= ${fmtP(ct.p)}`}, Cramér&apos;s V ={" "}
          {fmt(ct.cramersV)}.
          {ct.lowExpectedShare > 0.2 && (
            <span className="text-amber-700 dark:text-amber-300">
              {" "}
              {fmt(ct.lowExpectedShare * 100, 0)}% of cells have expected counts below 5, so treat this result with caution.
            </span>
          )}
        </p>
      </div>

      {rel.simple && <RegressionTable title={`Simple linear regression: ${rel.dv.key} = b₀ + b₁·${rel.iv.key}`} reg={rel.simple} />}
      {rel.multiple && (
        <RegressionTable
          title={`Multiple regression: ${rel.dv.key} on the ${rel.iv.key} sub-dimensions`}
          reg={rel.multiple}
        />
      )}
    </div>
  );
}

function RegressionTable({ title, reg }: { title: string; reg: Regression }) {
  return (
    <div>
      <H3>{title}</H3>
      <p className="mb-2 text-sm">
        R² = {fmt(reg.r2, 3)}, adjusted R² = {fmt(reg.adjR2, 3)}, F({reg.df1}, {reg.df2}) = {fmt(reg.f)}, p{" "}
        {fmtP(reg.p).startsWith("<") ? fmtP(reg.p) : `= ${fmtP(reg.p)}`}, n = {reg.n}
      </p>
      <Table
        head={["Predictor", "B", "Std. error", "β (standardised)", "t", "p"]}
        rows={reg.coefficients.map((c) => [c.name, fmt(c.b, 3), fmt(c.se, 3), fmt(c.beta, 3), fmt(c.t), fmtP(c.p)])}
      />
    </div>
  );
}

// ---------- primitives ----------

function alphaLabel(a: number): string | undefined {
  if (!Number.isFinite(a)) return undefined;
  if (a >= 0.9) return "excellent";
  if (a >= 0.8) return "good";
  if (a >= 0.7) return "acceptable";
  if (a >= 0.6) return "questionable";
  return "poor";
}

function H2({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 border-b border-border pb-2 text-xl font-semibold">{children}</h2>;
}

function H3({ children }: { children: React.ReactNode }) {
  return <h3 className="mb-2 mt-4 font-semibold">{children}</h3>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted">{title}</p>
      {children}
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
      {hint && <p className="text-xs text-muted">{hint}</p>}
    </div>
  );
}

function Table({ caption, head, rows }: { caption?: string; head: string[]; rows: React.ReactNode[][] }) {
  return (
    <div className="mt-4 overflow-x-auto">
      {caption && <p className="mb-2 text-sm font-medium">{caption}</p>}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-muted">
            {head.map((h) => (
              <th key={h} className="py-2 pr-3 font-medium">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i} className="border-b border-border align-top">
              {row.map((cell, j) => (
                <td key={j} className={`py-2 pr-3 ${typeof cell === "number" || j > 0 ? "tabular-nums" : ""}`}>
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FreqTable({
  id,
  title,
  base,
  rows,
  multi,
}: {
  id: string;
  title: string;
  base: number;
  rows: { label: string; n: number; pct: number }[];
  multi?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <p className="text-sm font-medium">
        <span className="mr-1 text-muted">{id}.</span>
        {title}
      </p>
      <p className="mb-3 text-xs text-muted">
        n = {base}
        {multi ? " · multiple response" : ""}
      </p>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 text-sm">
            <div className="min-w-0">
              <div className="truncate" title={r.label}>
                {r.label}
              </div>
              <div className="mt-0.5 h-1.5 rounded-full bg-border">
                <div className="h-full rounded-full bg-accent" style={{ width: `${Math.min(100, r.pct)}%` }} />
              </div>
            </div>
            <div className="w-24 text-right tabular-nums">
              {r.n} <span className="text-muted">({fmt(r.pct, 1)}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
