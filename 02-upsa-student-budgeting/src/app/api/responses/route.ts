import config from "@/survey.config";
import { insertResponse } from "@/lib/db";
import { checkSubmission, cleanAnswers } from "@/lib/survey-logic";
import type { Answers } from "@/lib/survey-types";

export async function POST(request: Request) {
  let body: { answers?: unknown; durationSec?: unknown };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON." }, { status: 400 });
  }
  if (!body.answers || typeof body.answers !== "object" || Array.isArray(body.answers)) {
    return Response.json({ error: "Missing answers." }, { status: 400 });
  }

  const answers = cleanAnswers(config, body.answers as Answers);
  const check = checkSubmission(config, answers);
  if (!check.ok) return Response.json({ error: check.error }, { status: 422 });

  const d = Number(body.durationSec);
  const durationSec = Number.isFinite(d) && d >= 0 && d < 86400 ? Math.round(d) : null;
  const id = insertResponse({ status: check.status, answers, durationSec });
  return Response.json({ id, status: check.status }, { status: 201 });
}
