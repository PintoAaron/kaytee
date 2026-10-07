// Synthetic responses for trying out the dashboard before fieldwork.
// They are flagged `is_demo` and excluded from analysis/export unless requested.
import { checkSubmission, cleanAnswers, failedScreening, isVisible } from "./survey-logic";
import type { Answers, ResponseStatus, SurveyConfig } from "./survey-types";

function normal(): number {
  const u = 1 - Math.random();
  const v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function pick<T>(xs: T[]): T {
  return xs[Math.floor(Math.random() * xs.length)];
}

export function generateDemoResponses(
  config: SurveyConfig,
  n: number,
): { status: ResponseStatus; answers: Answers; durationSec: number; isDemo: true; createdAt: string }[] {
  const out = [];
  const ivKeys = new Set(config.constructs.filter((c) => c.role === "independent").map((c) => c.key));
  for (let k = 0; k < n; k++) {
    // Latent traits with a moderate positive link, so the dashboard shows something meaningful.
    const it = normal();
    const acc = 0.55 * it + 0.8 * normal();
    const eligible = Math.random() > 0.12;
    const answers: Answers = {};
    for (const section of config.sections) {
      for (const item of section.items) {
        if (!isVisible(item, answers)) continue;
        switch (item.type) {
          case "single": {
            if (section.screening && item.eligibleIf) {
              const bad = item.options.filter((o) => !item.eligibleIf!.includes(o.value));
              answers[item.id] = !eligible && bad.length && Math.random() < 0.6 ? pick(bad).value : pick(item.eligibleIf);
            } else {
              answers[item.id] = pick(item.options).value;
            }
            break;
          }
          case "multi": {
            const choices = item.options.filter((o) => o.value !== item.exclusive);
            if (item.exclusive && Math.random() < 0.08) answers[item.id] = [item.exclusive];
            else {
              const count = 1 + Math.floor(Math.random() * Math.min(3, choices.length));
              answers[item.id] = [...choices].sort(() => Math.random() - 0.5).slice(0, count).map((o) => o.value);
            }
            break;
          }
          case "likert": {
            const latent = ivKeys.has(item.construct) ? it : acc;
            const v = Math.max(1, Math.min(5, Math.round(3.1 + 0.9 * latent + 0.7 * normal())));
            answers[item.id] = item.reverse ? 6 - v : v;
            break;
          }
          case "number": {
            const lo = item.min ?? 0;
            const hi = item.max ?? 10;
            answers[item.id] = Math.round(lo + Math.random() * Math.min(hi - lo, 20));
            break;
          }
          case "text":
            break;
        }
      }
      if (failedScreening(section, answers)) break;
    }
    const res = checkSubmission(config, answers);
    if (!res.ok) continue;
    const daysAgo = Math.random() * 21;
    out.push({
      status: res.status,
      answers: cleanAnswers(config, answers),
      durationSec: res.status === "complete" ? Math.round(300 + Math.random() * 600) : Math.round(30 + Math.random() * 60),
      isDemo: true as const,
      createdAt: new Date(Date.now() - daysAgo * 86400000).toISOString(),
    });
  }
  return out;
}
