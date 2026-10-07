// Visibility, validation and eligibility rules shared by the form and the API.
import type { Answers, AnswerValue, Item, Section, SurveyConfig } from "./survey-types";

export function isAnswered(v: AnswerValue | undefined): boolean {
  if (v === undefined || v === null) return false;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "string") return v.trim().length > 0;
  return Number.isFinite(v);
}

export function isVisible(item: Item, answers: Answers): boolean {
  if (!item.showIf) return true;
  const v = answers[item.showIf.item];
  const values = Array.isArray(v) ? v : v === undefined ? [] : [String(v)];
  return values.some((x) => item.showIf!.in.includes(x));
}

/** Returns an error message, or null when the answer is acceptable. */
export function validateItem(item: Item, answers: Answers): string | null {
  if (!isVisible(item, answers)) return null;
  const v = answers[item.id];
  const required = item.required ?? true;
  if (!isAnswered(v)) return required ? "This question is required." : null;

  switch (item.type) {
    case "single":
      return typeof v === "string" && item.options.some((o) => o.value === v) ? null : "Choose one option.";
    case "multi": {
      if (!Array.isArray(v) || !v.every((x) => item.options.some((o) => o.value === x))) return "Invalid selection.";
      if (item.exclusive && v.includes(item.exclusive) && v.length > 1) {
        const label = item.options.find((o) => o.value === item.exclusive)?.label;
        return `"${label}" cannot be combined with other options.`;
      }
      return null;
    }
    case "likert":
      return typeof v === "number" && Number.isInteger(v) && v >= 1 && v <= 5 ? null : "Choose a point on the scale.";
    case "number": {
      if (typeof v !== "number" || !Number.isFinite(v)) return "Enter a number.";
      if (item.min !== undefined && v < item.min) return `Must be at least ${item.min}.`;
      if (item.max !== undefined && v > item.max) return `Must be at most ${item.max}.`;
      return null;
    }
    case "text":
      return typeof v === "string" && v.length <= 2000 ? null : "Answer is too long.";
  }
}

export function validateSection(section: Section, answers: Answers): Record<string, string> {
  const errors: Record<string, string> = {};
  for (const item of section.items) {
    const e = validateItem(item, answers);
    if (e) errors[item.id] = e;
  }
  return errors;
}

/** First screening item the respondent fails, if any. */
export function failedScreening(section: Section, answers: Answers): Item | null {
  if (!section.screening) return null;
  for (const item of section.items) {
    if (item.type === "single" && item.eligibleIf && isVisible(item, answers)) {
      const v = answers[item.id];
      if (typeof v === "string" && !item.eligibleIf.includes(v)) return item;
    }
  }
  return null;
}

export function allItems(config: SurveyConfig): Item[] {
  return config.sections.flatMap((s) => s.items);
}

/** Drops unknown keys and answers to hidden questions. */
export function cleanAnswers(config: SurveyConfig, answers: Answers): Answers {
  const out: Answers = {};
  for (const item of allItems(config)) {
    if (isVisible(item, answers) && isAnswered(answers[item.id])) out[item.id] = answers[item.id];
  }
  return out;
}

/**
 * Server-side check of a full submission. Validates sections in order and stops
 * at the first failed screening question, which is a valid "screened_out" record.
 */
export function checkSubmission(
  config: SurveyConfig,
  answers: Answers,
): { ok: true; status: "complete" | "screened_out" } | { ok: false; error: string } {
  for (const section of config.sections) {
    const errors = validateSection(section, answers);
    const first = Object.entries(errors)[0];
    if (first) return { ok: false, error: `${first[0]}: ${first[1]}` };
    if (failedScreening(section, answers)) return { ok: true, status: "screened_out" };
  }
  return { ok: true, status: "complete" };
}
