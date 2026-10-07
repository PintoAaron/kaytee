"use client";

import { useEffect, useRef, useState } from "react";
import type { Answers, AnswerValue, Item, SurveyConfig } from "@/lib/survey-types";
import { SCALES } from "@/lib/survey-types";
import { cleanAnswers, failedScreening, isVisible, validateSection } from "@/lib/survey-logic";

type Phase = "consent" | "questions" | "submitting" | "complete" | "screened_out" | "declined";

type Draft = { answers: Answers; step: number; startedAt: number };

export default function SurveyForm({ config }: { config: SurveyConfig }) {
  const storageKey = `survey-draft:${config.slug}`;
  const [phase, setPhase] = useState<Phase>("consent");
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const startedAt = useRef<number>(0);
  const topRef = useRef<HTMLDivElement>(null);

  // Resume an unfinished questionnaire (e.g. after an accidental refresh).
  function start(now: number) {
    let draft: Draft | null = null;
    try {
      const raw = sessionStorage.getItem(storageKey);
      if (raw) draft = JSON.parse(raw) as Draft;
    } catch {
      /* storage unavailable */
    }
    if (draft) {
      setAnswers(draft.answers);
      setStep(Math.min(draft.step, config.sections.length - 1));
      startedAt.current = draft.startedAt;
    } else {
      startedAt.current = now;
    }
    setPhase("questions");
    scrollTop();
  }

  useEffect(() => {
    if (phase !== "questions") return;
    try {
      sessionStorage.setItem(storageKey, JSON.stringify({ answers, step, startedAt: startedAt.current } satisfies Draft));
    } catch {
      /* storage unavailable */
    }
  }, [answers, step, phase, storageKey]);

  const section = config.sections[step];
  const total = config.sections.length;

  function scrollTop() {
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setAnswer(id: string, value: AnswerValue | undefined) {
    setAnswers((a) => ({ ...a, [id]: value }));
    setErrors((e) => {
      if (!e[id]) return e;
      const next = { ...e };
      delete next[id];
      return next;
    });
  }

  async function submit(final: Answers) {
    setPhase("submitting");
    setSubmitError(null);
    try {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: cleanAnswers(config, final),
          durationSec: Math.round((Date.now() - startedAt.current) / 1000),
        }),
      });
      const body = (await res.json()) as { status?: "complete" | "screened_out"; error?: string };
      if (!res.ok || !body.status) throw new Error(body.error ?? `Server returned ${res.status}`);
      try {
        sessionStorage.removeItem(storageKey);
      } catch {
        /* ignore */
      }
      setPhase(body.status);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : "Could not submit. Please try again.");
      setPhase("questions");
    }
    scrollTop();
  }

  function next() {
    const errs = validateSection(section, answers);
    setErrors(errs);
    if (Object.keys(errs).length) {
      const first = section.items.find((i) => errs[i.id]);
      if (first) document.getElementById(`q-${first.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    if (failedScreening(section, answers)) {
      // Record the screened-out attempt (only screening answers are kept).
      const screeningOnly: Answers = {};
      for (const s of config.sections.slice(0, step + 1)) for (const i of s.items) screeningOnly[i.id] = answers[i.id];
      void submit(screeningOnly);
      return;
    }
    if (step === total - 1) {
      void submit(answers);
      return;
    }
    setStep(step + 1);
    scrollTop();
  }

  function back() {
    setErrors({});
    setStep(Math.max(0, step - 1));
    scrollTop();
  }

  if (phase === "consent") {
    return (
      <div ref={topRef} className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
        <h2 className="text-xl font-semibold">Participant information and consent</h2>
        <div className="mt-4 space-y-3 text-muted">
          {config.consent.map((p) => (
            <p key={p}>{p}</p>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            type="button"
            className="rounded-lg bg-accent px-5 py-3 font-medium text-white hover:opacity-90"
            onClick={() => start(Date.now())}
          >
            I agree to take part
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-5 py-3 font-medium hover:bg-background"
            onClick={() => setPhase("declined")}
          >
            I do not wish to take part
          </button>
        </div>
      </div>
    );
  }

  if (phase === "declined" || phase === "complete" || phase === "screened_out") {
    const msg = {
      declined: ["Thank you for your time.", "You have chosen not to take part. No answers have been recorded."],
      complete: ["Thank you!", "Your responses have been recorded. We appreciate your contribution to this study."],
      screened_out: [
        "Thank you for your interest.",
        "Based on your answers, this study does not apply to you, so there are no further questions.",
      ],
    }[phase];
    return (
      <div ref={topRef} className="rounded-2xl border border-border bg-surface p-8 text-center">
        <h2 className="text-2xl font-semibold">{msg[0]}</h2>
        <p className="mt-3 text-muted">{msg[1]}</p>
        <button
          type="button"
          className="mt-6 rounded-lg border border-border px-4 py-2 text-sm hover:bg-background"
          onClick={() => {
            setAnswers({});
            setStep(0);
            setPhase("consent");
          }}
        >
          Start a new questionnaire (for the next respondent)
        </button>
      </div>
    );
  }

  const visibleItems = section.items.filter((i) => isVisible(i, answers));
  const submitting = phase === "submitting";

  return (
    <div ref={topRef} className="scroll-mt-4">
      <div className="mb-4">
        <div className="flex justify-between text-xs text-muted">
          <span>
            Part {step + 1} of {total}
          </span>
          <span>{Math.round((step / total) * 100)}% done</span>
        </div>
        <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-border">
          <div className="h-full bg-accent transition-all" style={{ width: `${(step / total) * 100}%` }} />
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-8">
        <h2 className="text-xl font-semibold">{section.title}</h2>
        {section.intro && <p className="mt-2 text-muted">{section.intro}</p>}

        <div className="mt-6 space-y-8">
          {visibleItems.map((item) => (
            <Question
              key={item.id}
              item={item}
              value={answers[item.id]}
              error={errors[item.id]}
              onChange={(v) => setAnswer(item.id, v)}
            />
          ))}
        </div>

        {submitError && (
          <p role="alert" className="mt-6 rounded-lg bg-red-50 p-3 text-sm text-red-800 dark:bg-red-950 dark:text-red-200">
            {submitError}
          </p>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button
            type="button"
            onClick={back}
            disabled={step === 0 || submitting}
            className="rounded-lg border border-border px-5 py-3 font-medium hover:bg-background disabled:opacity-40"
          >
            Back
          </button>
          <button
            type="button"
            onClick={next}
            disabled={submitting}
            className="rounded-lg bg-accent px-6 py-3 font-medium text-white hover:opacity-90 disabled:opacity-60"
          >
            {submitting ? "Submitting…" : step === total - 1 ? "Submit" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Question({
  item,
  value,
  error,
  onChange,
}: {
  item: Item;
  value: AnswerValue | undefined;
  error?: string;
  onChange: (v: AnswerValue | undefined) => void;
}) {
  const required = item.required ?? true;
  const name = `q-${item.id}`;
  return (
    <fieldset id={name} className="scroll-mt-24">
      <legend className="font-medium">
        <span className="mr-2 text-xs text-muted">{item.id}</span>
        {item.text}
        {!required && <span className="ml-1 text-sm font-normal text-muted">(optional)</span>}
      </legend>
      {item.help && <p className="mt-1 text-sm text-muted">{item.help}</p>}

      <div className="mt-3">
        {item.type === "single" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {item.options.map((o) => (
              <Choice key={o.value} type="radio" name={name} checked={value === o.value} onChange={() => onChange(o.value)}>
                {o.label}
              </Choice>
            ))}
          </div>
        )}

        {item.type === "multi" && (
          <div className="grid gap-2 sm:grid-cols-2">
            {item.options.map((o) => {
              const selected = Array.isArray(value) ? value : [];
              const checked = selected.includes(o.value);
              return (
                <Choice
                  key={o.value}
                  type="checkbox"
                  name={name}
                  checked={checked}
                  onChange={() => {
                    let nextVal: string[];
                    if (checked) nextVal = selected.filter((v) => v !== o.value);
                    else if (o.value === item.exclusive) nextVal = [o.value];
                    else nextVal = [...selected.filter((v) => v !== item.exclusive), o.value];
                    onChange(nextVal.length ? nextVal : undefined);
                  }}
                >
                  {o.label}
                </Choice>
              );
            })}
          </div>
        )}

        {item.type === "likert" && (
          <div className="grid grid-cols-5 gap-1.5">
            {SCALES[item.scale].map((label, i) => {
              const v = i + 1;
              const checked = value === v;
              return (
                <label
                  key={v}
                  className={`flex cursor-pointer flex-col items-center gap-1 rounded-lg border px-1 py-2 text-center text-[11px] leading-tight sm:text-xs ${
                    checked ? "border-accent bg-accent text-white" : "border-border hover:bg-background"
                  }`}
                >
                  <input type="radio" name={name} className="sr-only" checked={checked} onChange={() => onChange(v)} />
                  <span className="text-base font-semibold">{v}</span>
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        )}

        {item.type === "number" && (
          <div className="flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={item.min}
              max={item.max}
              value={typeof value === "number" ? value : ""}
              onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
              className="w-40 rounded-lg border border-border bg-background px-3 py-2"
            />
            {item.unit && <span className="text-muted">{item.unit}</span>}
          </div>
        )}

        {item.type === "text" &&
          (item.multiline ? (
            <textarea
              rows={4}
              maxLength={2000}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value || undefined)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          ) : (
            <input
              type="text"
              maxLength={300}
              value={typeof value === "string" ? value : ""}
              onChange={(e) => onChange(e.target.value || undefined)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2"
            />
          ))}
      </div>

      {error && (
        <p role="alert" className="mt-2 text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </fieldset>
  );
}

function Choice({
  type,
  name,
  checked,
  onChange,
  children,
}: {
  type: "radio" | "checkbox";
  name: string;
  checked: boolean;
  onChange: () => void;
  children: React.ReactNode;
}) {
  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 ${
        checked ? "border-accent bg-accent/10" : "border-border hover:bg-background"
      }`}
    >
      <input type={type} name={name} checked={checked} onChange={onChange} className="mt-1 accent-[var(--accent)]" />
      <span>{children}</span>
    </label>
  );
}
