// Turns stored responses into the tables shown on the dashboard and in exports.
import type { Answers, Construct, LikertItem, StoredResponse, SurveyConfig } from "./survey-types";
import {
  chiSquare,
  cronbachAlpha,
  describe,
  ols,
  pearson,
  spearman,
  type ChiSquare,
  type Correlation,
  type Descriptives,
  type Regression,
} from "./stats";

export const LEVELS = ["Low", "Moderate", "High"] as const;

/** Mean-score bands commonly used for 5-point scales. */
export function level(score: number): (typeof LEVELS)[number] {
  if (score < 2.5) return "Low";
  if (score < 3.5) return "Moderate";
  return "High";
}

export function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function likertItems(config: SurveyConfig, construct?: string): LikertItem[] {
  return config.sections
    .flatMap((s) => s.items)
    .filter((i): i is LikertItem => i.type === "likert" && (!construct || i.construct === construct));
}

export function dimensionsOf(config: SurveyConfig, construct: string): string[] {
  return [...new Set(likertItems(config, construct).map((i) => i.dimension))];
}

function itemScore(item: LikertItem, answers: Answers): number | null {
  const v = answers[item.id];
  if (typeof v !== "number") return null;
  return item.reverse ? 6 - v : v;
}

function meanScore(items: LikertItem[], answers: Answers): number | null {
  const vals = items.map((i) => itemScore(i, answers)).filter((v): v is number => v !== null);
  // Require every item: the form makes all scale items mandatory.
  if (!vals.length || vals.length < items.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

/** Composite (construct) and sub-dimension mean scores for one respondent. */
export function scoreRespondent(config: SurveyConfig, answers: Answers): Record<string, number | null> {
  const out: Record<string, number | null> = {};
  for (const c of config.constructs) {
    const items = likertItems(config, c.key);
    out[c.key] = meanScore(items, answers);
    for (const d of dimensionsOf(config, c.key)) {
      out[`${c.key}_${slug(d)}`] = meanScore(
        items.filter((i) => i.dimension === d),
        answers,
      );
    }
  }
  return out;
}

// ---------- dashboard model ----------

export type Freq = { label: string; n: number; pct: number };
export type ProfileTable = { id: string; text: string; kind: "single" | "multi"; base: number; rows: Freq[] };

export type ItemStat = {
  id: string;
  text: string;
  reverse: boolean;
  mean: number;
  sd: number;
  dist: number[]; // counts for 1..5 (raw, before reverse coding)
};

export type DimensionStat = { name: string; key: string; itemCount: number; alpha: number; desc: Descriptives };

export type ConstructStat = {
  construct: Construct;
  itemCount: number;
  alpha: number;
  desc: Descriptives;
  levels: Freq[];
  dimensions: DimensionStat[];
  items: ItemStat[];
};

export type Relationship = {
  iv: Construct;
  dv: Construct;
  spearman: Correlation;
  pearson: Correlation;
  simple: Regression | null;
  byDimension: { name: string; spearman: Correlation }[];
  multiple: Regression | null;
  crosstab: ChiSquare;
  points: [number, number][];
};

export type GroupTable = {
  id: string;
  text: string;
  rows: { label: string; n: number; iv: number; dv: number; dvSd: number }[];
};

export type Analysis = {
  totals: { all: number; complete: number; screenedOut: number; medianMinutes: number };
  screening: Freq[];
  profile: ProfileTable[];
  numeric: { id: string; text: string; unit?: string; desc: Descriptives }[];
  constructs: ConstructStat[];
  relationships: Relationship[];
  groups: GroupTable[];
};

function freqTable(values: string[], options: { value: string; label: string }[], base: number): Freq[] {
  return options.map((o) => {
    const n = values.filter((v) => v === o.value).length;
    return { label: o.label, n, pct: base ? (100 * n) / base : 0 };
  });
}

export function analyse(config: SurveyConfig, responses: StoredResponse[]): Analysis {
  const complete = responses.filter((r) => r.status === "complete");
  const screenedOut = responses.filter((r) => r.status === "screened_out");
  const durations = complete.map((r) => r.durationSec).filter((d): d is number => d !== null);

  // Why people were screened out: the first failed eligibility question.
  const screeningItems = config.sections
    .filter((s) => s.screening)
    .flatMap((s) => s.items)
    .filter((i) => i.type === "single" && i.eligibleIf);
  const screening: Freq[] = screeningItems.map((item) => {
    const n = screenedOut.filter((r) => {
      const first = screeningItems.find(
        (i) => i.type === "single" && typeof r.answers[i.id] === "string" && !i.eligibleIf!.includes(r.answers[i.id] as string),
      );
      return first?.id === item.id;
    }).length;
    return { label: item.text, n, pct: screenedOut.length ? (100 * n) / screenedOut.length : 0 };
  });

  const profile: ProfileTable[] = [];
  const numeric: Analysis["numeric"] = [];
  for (const section of config.sections) {
    if (section.screening) continue;
    for (const item of section.items) {
      if (item.type === "single") {
        const vals = complete.map((r) => r.answers[item.id]).filter((v): v is string => typeof v === "string");
        profile.push({ id: item.id, text: item.text, kind: "single", base: vals.length, rows: freqTable(vals, item.options, vals.length) });
      } else if (item.type === "multi") {
        const answered = complete.map((r) => r.answers[item.id]).filter((v): v is string[] => Array.isArray(v));
        profile.push({
          id: item.id,
          text: item.text,
          kind: "multi",
          base: answered.length,
          rows: item.options.map((o) => {
            const n = answered.filter((a) => a.includes(o.value)).length;
            return { label: o.label, n, pct: answered.length ? (100 * n) / answered.length : 0 };
          }),
        });
      } else if (item.type === "number") {
        const vals = complete.map((r) => r.answers[item.id]).filter((v): v is number => typeof v === "number");
        numeric.push({ id: item.id, text: item.text, unit: item.unit, desc: describe(vals) });
      }
    }
  }

  const scores = complete.map((r) => scoreRespondent(config, r.answers));

  const constructs: ConstructStat[] = config.constructs.map((c) => {
    const items = likertItems(config, c.key);
    const matrix = complete
      .map((r) => items.map((i) => itemScore(i, r.answers)))
      .filter((row): row is number[] => row.every((v) => v !== null));
    const composite = scores.map((s) => s[c.key]).filter((v): v is number => v !== null);
    const levelVals = composite.map(level);
    return {
      construct: c,
      itemCount: items.length,
      alpha: cronbachAlpha(matrix),
      desc: describe(composite),
      levels: LEVELS.map((l) => {
        const n = levelVals.filter((v) => v === l).length;
        return { label: l, n, pct: composite.length ? (100 * n) / composite.length : 0 };
      }),
      dimensions: dimensionsOf(config, c.key).map((d) => {
        const idx = items.map((i, j) => (i.dimension === d ? j : -1)).filter((j) => j >= 0);
        const key = `${c.key}_${slug(d)}`;
        return {
          name: d,
          key,
          itemCount: idx.length,
          alpha: cronbachAlpha(matrix.map((row) => idx.map((j) => row[j]))),
          desc: describe(scores.map((s) => s[key]).filter((v): v is number => v !== null)),
        };
      }),
      items: items.map((i) => {
        const raw = complete.map((r) => r.answers[i.id]).filter((v): v is number => typeof v === "number");
        const scored = raw.map((v) => (i.reverse ? 6 - v : v));
        const d = describe(scored);
        return {
          id: i.id,
          text: i.text,
          reverse: !!i.reverse,
          mean: d.mean,
          sd: d.sd,
          dist: [1, 2, 3, 4, 5].map((k) => raw.filter((v) => v === k).length),
        };
      }),
    };
  });

  const relationships: Relationship[] = [];
  for (const iv of config.constructs.filter((c) => c.role === "independent")) {
    for (const dv of config.constructs.filter((c) => c.role === "dependent")) {
      const pairs = scores.filter((s) => s[iv.key] !== null && s[dv.key] !== null);
      const x = pairs.map((s) => s[iv.key]!);
      const y = pairs.map((s) => s[dv.key]!);
      const ivDims = dimensionsOf(config, iv.key);
      const dvDims = dimensionsOf(config, dv.key);
      relationships.push({
        iv,
        dv,
        spearman: spearman(x, y),
        pearson: pearson(x, y),
        simple: ols(y, [x], [iv.label]),
        byDimension: dvDims.map((d) => ({
          name: d,
          spearman: spearman(
            x,
            pairs.map((s) => s[`${dv.key}_${slug(d)}`] ?? NaN),
          ),
        })),
        multiple:
          ivDims.length > 1
            ? ols(
                y,
                ivDims.map((d) => pairs.map((s) => s[`${iv.key}_${slug(d)}`]!)),
                ivDims,
              )
            : null,
        crosstab: chiSquare(x.map(level), y.map(level), [...LEVELS], [...LEVELS]),
        points: x.map((xi, i) => [xi, y[i]]),
      });
    }
  }

  const iv = config.constructs.find((c) => c.role === "independent");
  const dv = config.constructs.find((c) => c.role === "dependent");
  const groups: GroupTable[] = [];
  for (const id of config.groupBy) {
    const item = config.sections.flatMap((s) => s.items).find((i) => i.id === id);
    if (!item || item.type !== "single" || !iv || !dv) continue;
    groups.push({
      id,
      text: item.text,
      rows: item.options
        .map((o) => {
          const idx = complete.map((r, i) => (r.answers[id] === o.value ? i : -1)).filter((i) => i >= 0);
          const ivs = idx.map((i) => scores[i][iv.key]).filter((v): v is number => v !== null);
          const dvs = idx.map((i) => scores[i][dv.key]).filter((v): v is number => v !== null);
          const d = describe(dvs);
          return { label: o.label, n: idx.length, iv: describe(ivs).mean, dv: d.mean, dvSd: d.sd };
        })
        .filter((r) => r.n > 0),
    });
  }

  const sorted = [...durations].sort((a, b) => a - b);
  return {
    totals: {
      all: responses.length,
      complete: complete.length,
      screenedOut: screenedOut.length,
      medianMinutes: sorted.length ? sorted[Math.floor(sorted.length / 2)] / 60 : NaN,
    },
    screening,
    profile,
    numeric,
    constructs,
    relationships,
    groups,
  };
}
