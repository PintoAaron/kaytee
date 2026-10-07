import type { Metadata } from "next";
import config from "@/survey.config";
import SurveyForm from "@/components/SurveyForm";

export const metadata: Metadata = { title: `Questionnaire · ${config.shortTitle}` };

export default function SurveyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <h1 className="mb-6 text-lg font-semibold leading-snug text-muted">{config.title}</h1>
      <SurveyForm config={config} />
    </div>
  );
}
