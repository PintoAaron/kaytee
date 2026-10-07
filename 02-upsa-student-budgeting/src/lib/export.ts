// CSV / codebook / SPSS syntax builders. Single-choice answers are exported as
// numeric codes (1 = first option) so they load straight into SPSS or Excel.
import { level, LEVELS, scoreRespondent, dimensionsOf, slug } from "./analysis";
import { allItems } from "./survey-logic";
import type { StoredResponse, SurveyConfig } from "./survey-types";
import { SCALES } from "./survey-types";

type Variable = {
  name: string;
  label: string;
  values?: [number, string][];
  get: (r: StoredResponse, scores: Record<string, number | null>, labels: boolean) => string | number | null;
};

function variables(config: SurveyConfig): Variable[] {
  const vars: Variable[] = [
    { name: "response_id", label: "Response ID", get: (r) => r.id },
    { name: "submitted_at", label: "Submission time (UTC)", get: (r) => r.createdAt },
    {
      name: "status",
      label: "Response status",
      values: [
        [1, "Complete"],
        [2, "Screened out"],
      ],
      get: (r, _s, labels) => (labels ? (r.status === "complete" ? "Complete" : "Screened out") : r.status === "complete" ? 1 : 2),
    },
    { name: "duration_sec", label: "Time taken (seconds)", get: (r) => r.durationSec },
    { name: "is_demo", label: "Demo record (1 = synthetic)", get: (r) => (r.isDemo ? 1 : 0) },
  ];

  for (const item of allItems(config)) {
    switch (item.type) {
      case "single":
        vars.push({
          name: item.id,
          label: item.text,
          values: item.options.map((o, i) => [i + 1, o.label]),
          get: (r, _s, labels) => {
            const i = item.options.findIndex((o) => o.value === r.answers[item.id]);
            return i < 0 ? null : labels ? item.options[i].label : i + 1;
          },
        });
        break;
      case "multi":
        for (const o of item.options) {
          vars.push({
            name: `${item.id}_${slug(o.value)}`,
            label: `${item.text} – ${o.label}`,
            values: [
              [0, "Not selected"],
              [1, "Selected"],
            ],
            get: (r, _s, labels) => {
              const v = r.answers[item.id];
              if (!Array.isArray(v)) return null;
              const sel = v.includes(o.value);
              return labels ? (sel ? "Selected" : "Not selected") : sel ? 1 : 0;
            },
          });
        }
        break;
      case "likert":
        vars.push({
          name: item.id,
          label: `${item.text}${item.reverse ? " (reverse-worded; raw value)" : ""}`,
          values: SCALES[item.scale].map((l, i) => [i + 1, l]),
          get: (r, _s, labels) => {
            const v = r.answers[item.id];
            return typeof v !== "number" ? null : labels ? SCALES[item.scale][v - 1] : v;
          },
        });
        break;
      case "number":
      case "text":
        vars.push({
          name: item.id,
          label: item.text,
          get: (r) => {
            const v = r.answers[item.id];
            return v === undefined || Array.isArray(v) ? null : v;
          },
        });
        break;
    }
  }

  for (const c of config.constructs) {
    vars.push({
      name: c.key,
      label: `${c.label} – composite mean score (1–5)`,
      get: (_r, s) => (s[c.key] == null ? null : Number(s[c.key]!.toFixed(3))),
    });
    vars.push({
      name: `${c.key}_level`,
      label: `${c.label} – level`,
      values: LEVELS.map((l, i) => [i + 1, l]),
      get: (_r, s, labels) => {
        const v = s[c.key];
        if (v == null) return null;
        const l = level(v);
        return labels ? l : LEVELS.indexOf(l) + 1;
      },
    });
    for (const d of dimensionsOf(config, c.key)) {
      const key = `${c.key}_${slug(d)}`;
      vars.push({
        name: key,
        label: `${c.label} – ${d} (mean 1–5)`,
        get: (_r, s) => (s[key] == null ? null : Number(s[key]!.toFixed(3))),
      });
    }
  }
  return vars;
}

function csvCell(v: string | number | null): string {
  if (v === null || v === undefined) return "";
  // Neutralise spreadsheet formulas in free-text answers.
  const s = typeof v === "string" && /^[=+\-@\t\r]/.test(v) ? `'${v}` : String(v);
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function responsesCsv(config: SurveyConfig, responses: StoredResponse[], labels: boolean): string {
  const vars = variables(config);
  const lines = [vars.map((v) => v.name).join(",")];
  for (const r of responses) {
    const scores = r.status === "complete" ? scoreRespondent(config, r.answers) : {};
    lines.push(vars.map((v) => csvCell(v.get(r, scores, labels))).join(","));
  }
  return lines.join("\r\n") + "\r\n";
}

export function codebookCsv(config: SurveyConfig): string {
  const lines = ["variable,label,values"];
  for (const v of variables(config)) {
    lines.push(
      [v.name, v.label, v.values ? v.values.map(([k, l]) => `${k} = ${l}`).join("; ") : ""].map(csvCell).join(","),
    );
  }
  return lines.join("\r\n") + "\r\n";
}

/** SPSS syntax to label variables after importing the coded CSV. */
export function spssSyntax(config: SurveyConfig): string {
  const q = (s: string) => `"${s.replace(/"/g, "'").slice(0, 250)}"`;
  const vars = variables(config);
  const out = [
    `* ${config.title}.`,
    "* 1) File > Import Data > CSV Data, choose the coded responses CSV.",
    "* 2) Run this syntax to apply variable and value labels.",
    "",
    "VARIABLE LABELS",
    vars.map((v) => `  ${v.name} ${q(v.label)}`).join("\n") + ".",
    "",
  ];
  const labelled = vars.filter((v) => v.values);
  if (labelled.length) {
    out.push("VALUE LABELS");
    out.push(labelled.map((v) => `  ${v.name} ${v.values!.map(([k, l]) => `${k} ${q(l)}`).join(" ")}`).join("\n /") + ".");
    out.push("");
  }
  out.push("EXECUTE.", "");
  return out.join("\n");
}
