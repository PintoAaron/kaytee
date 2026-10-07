// Shape of a study definition. Each project only changes `src/survey.config.ts`.

export type Option = { value: string; label: string };

export type Condition = { item: string; in: string[] };

type BaseItem = {
  id: string; // also the export variable name, keep short (e.g. "IT3")
  text: string;
  help?: string;
  required?: boolean; // defaults to true
  showIf?: Condition;
};

export type SingleItem = BaseItem & {
  type: "single";
  options: Option[];
  /** Screening only: answers that keep the respondent in the study. */
  eligibleIf?: string[];
};

export type MultiItem = BaseItem & {
  type: "multi";
  options: Option[];
  /** Option value that cannot be combined with others (e.g. "none"). */
  exclusive?: string;
};

export type LikertItem = BaseItem & {
  type: "likert";
  scale: "agree" | "frequency";
  construct: string; // key of a Construct
  dimension: string; // label of a sub-dimension within the construct
  reverse?: boolean;
};

export type NumberItem = BaseItem & { type: "number"; min?: number; max?: number; unit?: string };
export type TextItem = BaseItem & { type: "text"; multiline?: boolean };

export type Item = SingleItem | MultiItem | LikertItem | NumberItem | TextItem;

export type Section = {
  id: string;
  title: string;
  intro?: string;
  /** Screening sections end the survey early when an `eligibleIf` check fails. */
  screening?: boolean;
  items: Item[];
};

export type Construct = {
  key: string;
  label: string;
  side: "IT" | "Accounting";
  role: "independent" | "dependent";
};

export type SurveyConfig = {
  slug: string;
  shortTitle: string;
  title: string;
  institution: string;
  studyArea: string;
  population: string;
  accent: string; // CSS colour
  problem: string;
  objectives: string[];
  hypotheses: string[];
  consent: string[];
  constructs: Construct[];
  /** Categorical items to break the dependent score down by on the dashboard. */
  groupBy: string[];
  sections: Section[];
};

export type AnswerValue = string | number | string[];
export type Answers = Record<string, AnswerValue | undefined>;

export type ResponseStatus = "complete" | "screened_out";

export type StoredResponse = {
  id: string;
  createdAt: string;
  status: ResponseStatus;
  durationSec: number | null;
  isDemo: boolean;
  answers: Answers;
};

export const SCALES: Record<LikertItem["scale"], string[]> = {
  agree: ["Strongly disagree", "Disagree", "Neutral", "Agree", "Strongly agree"],
  frequency: ["Never", "Rarely", "Sometimes", "Often", "Always"],
};
