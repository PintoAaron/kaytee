// Study definition for Project 1. Edit wording, options and items here;
// the form, dashboard and exports all follow this file.
import type { SurveyConfig } from "@/lib/survey-types";

const config: SurveyConfig = {
  slug: "madina-sme-records",
  shortTitle: "Madina SME Records Study",
  title:
    "Digital Accounting Tools and Financial Record-Keeping Practices among Small Businesses in Madina, Accra",
  institution: "University of Professional Studies, Accra (UPSA)",
  studyArea: "Madina, Accra",
  population: "Owners, managers or persons responsible for financial records in small businesses in Madina",
  accent: "#0f766e",
  problem:
    "Using digital tools does not automatically mean that financial records are kept properly. Some businesses use Excel, POS systems or other applications, yet the quality and regularity of their record keeping still differ. This study examines the relationship rather than assuming technology has already solved the problem.",
  objectives: [
    "To identify the digital accounting tools used by small businesses in Madina.",
    "To assess the extent and frequency of use of digital accounting tools.",
    "To assess the financial record-keeping practices of small businesses in Madina.",
    "To examine the relationship between the use of digital accounting tools and financial record-keeping practices.",
  ],
  hypotheses: [
    "H₀: There is no significant relationship between the use of digital accounting tools and financial record-keeping practices.",
    "H₁: There is a significant relationship between the use of digital accounting tools and financial record-keeping practices.",
  ],
  consent: [
    "You are invited to take part in an undergraduate research project by Accounting and Information Technology students of UPSA.",
    "The questionnaire takes about 10 minutes. It asks how your business records sales, purchases and expenses, and which tools you use.",
    "Participation is voluntary. You may stop at any time. We do not ask for your name, your business name or your phone number, and answers are reported only as group totals.",
    "The information is used for academic purposes only.",
  ],
  constructs: [
    { key: "DAT", label: "Use of digital accounting tools", side: "IT", role: "independent" },
    { key: "FRK", label: "Financial record-keeping practices", side: "Accounting", role: "dependent" },
  ],
  groupBy: ["C3", "C6", "D2"],
  sections: [
    {
      id: "screening",
      title: "Eligibility",
      screening: true,
      intro: "A few questions to confirm the study applies to your business.",
      items: [
        {
          id: "S1",
          type: "single",
          text: "Is your business located in Madina, Accra?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          eligibleIf: ["yes"],
        },
        {
          id: "S2",
          type: "single",
          text: "Are you the owner, a manager, or the person responsible for the business's financial records?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          eligibleIf: ["yes"],
        },
        {
          id: "S3",
          type: "single",
          text: "How many people work in the business, including the owner?",
          options: [
            { value: "1_5", label: "1 – 5" },
            { value: "6_30", label: "6 – 30" },
            { value: "31_plus", label: "More than 30" },
          ],
          eligibleIf: ["1_5", "6_30"],
          help: "This study covers micro and small businesses (up to 30 workers).",
        },
      ],
    },
    {
      id: "profile",
      title: "Section A: Respondent and business profile",
      items: [
        {
          id: "B1",
          type: "single",
          text: "What is your role in the business?",
          options: [
            { value: "owner", label: "Owner" },
            { value: "manager", label: "Manager" },
            { value: "accountant", label: "Accountant / bookkeeper" },
            { value: "other", label: "Other staff responsible for records" },
          ],
        },
        {
          id: "B2",
          type: "single",
          text: "Gender",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "na", label: "Prefer not to say" },
          ],
        },
        {
          id: "B3",
          type: "single",
          text: "Age group",
          options: [
            { value: "18_25", label: "18 – 25" },
            { value: "26_35", label: "26 – 35" },
            { value: "36_45", label: "36 – 45" },
            { value: "46_55", label: "46 – 55" },
            { value: "56_plus", label: "56 and above" },
          ],
        },
        {
          id: "B4",
          type: "single",
          text: "Highest level of education",
          options: [
            { value: "none", label: "No formal education" },
            { value: "basic", label: "Basic (Primary / JHS)" },
            { value: "secondary", label: "Secondary (SHS / Technical / Vocational)" },
            { value: "diploma", label: "Diploma / HND" },
            { value: "degree", label: "Bachelor's degree" },
            { value: "postgrad", label: "Postgraduate" },
          ],
        },
        {
          id: "B5",
          type: "single",
          text: "Have you received any training in bookkeeping or accounting?",
          options: [
            { value: "none", label: "No training" },
            { value: "informal", label: "Informal / on-the-job" },
            { value: "short", label: "Short course or workshop" },
            { value: "formal", label: "Formal (school / professional)" },
          ],
        },
        {
          id: "C1",
          type: "single",
          text: "What does the business mainly do?",
          options: [
            { value: "retail", label: "Retail / general trading" },
            { value: "food", label: "Food, drinks and chop bar / restaurant" },
            { value: "fashion", label: "Fashion, tailoring and clothing" },
            { value: "beauty", label: "Hair, beauty and cosmetics" },
            { value: "electronics", label: "Phones, electronics and accessories" },
            { value: "pharmacy", label: "Pharmacy / chemical shop" },
            { value: "building", label: "Building materials and hardware" },
            { value: "services", label: "Other services (printing, repairs, etc.)" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "C2",
          type: "single",
          text: "How long has the business been operating?",
          options: [
            { value: "lt1", label: "Less than 1 year" },
            { value: "1_3", label: "1 – 3 years" },
            { value: "4_6", label: "4 – 6 years" },
            { value: "7_10", label: "7 – 10 years" },
            { value: "gt10", label: "More than 10 years" },
          ],
        },
        {
          id: "C3",
          type: "single",
          text: "Number of people working in the business (including the owner)",
          options: [
            { value: "1", label: "1 (owner only)" },
            { value: "2_5", label: "2 – 5" },
            { value: "6_10", label: "6 – 10" },
            { value: "11_30", label: "11 – 30" },
          ],
        },
        {
          id: "C4",
          type: "single",
          text: "Is the business registered (e.g. with the Office of the Registrar of Companies)?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
            { value: "dk", label: "Don't know" },
          ],
        },
        {
          id: "C5",
          type: "single",
          text: "Approximate average monthly sales (GH₵)",
          options: [
            { value: "lt2k", label: "Below 2,000" },
            { value: "2k_5k", label: "2,000 – 5,000" },
            { value: "5k_10k", label: "5,001 – 10,000" },
            { value: "10k_30k", label: "10,001 – 30,000" },
            { value: "gt30k", label: "Above 30,000" },
            { value: "na", label: "Prefer not to say" },
          ],
        },
      ],
    },
    {
      id: "tools",
      title: "Section B: Tools used for record keeping",
      intro: "This section asks how the business records its transactions.",
      items: [
        {
          id: "D1",
          type: "multi",
          text: "Which of these does the business use to record financial transactions? (Select all that apply)",
          options: [
            { value: "book", label: "Exercise book / manual ledger / receipt book" },
            { value: "spreadsheet", label: "Microsoft Excel or Google Sheets" },
            { value: "software", label: "Accounting software (e.g. QuickBooks, Sage, Tally, Zoho Books)" },
            { value: "mobile_app", label: "Mobile bookkeeping app" },
            { value: "pos", label: "POS / sales terminal" },
            { value: "momo", label: "Mobile money merchant statements / history" },
            { value: "bank", label: "Bank statements or bank app" },
            { value: "notes", label: "Phone notes, WhatsApp or SMS" },
            { value: "none", label: "We don't keep records" },
          ],
          exclusive: "none",
        },
        {
          id: "D2",
          type: "single",
          text: "Which ONE tool do you rely on most for recording transactions?",
          options: [
            { value: "book", label: "Exercise book / manual ledger" },
            { value: "spreadsheet", label: "Excel / Google Sheets" },
            { value: "software", label: "Accounting software" },
            { value: "mobile_app", label: "Mobile bookkeeping app" },
            { value: "pos", label: "POS system" },
            { value: "momo_bank", label: "Mobile money / bank records" },
            { value: "notes", label: "Phone notes / WhatsApp" },
          ],
          showIf: {
            item: "D1",
            in: ["book", "spreadsheet", "software", "mobile_app", "pos", "momo", "bank", "notes"],
          },
        },
        {
          id: "D3",
          type: "single",
          text: "How long has the business been using digital tools for its records?",
          options: [
            { value: "never", label: "We don't use digital tools" },
            { value: "lt1", label: "Less than 1 year" },
            { value: "1_3", label: "1 – 3 years" },
            { value: "gt3", label: "More than 3 years" },
          ],
        },
        {
          id: "D4",
          type: "multi",
          text: "What challenges does the business face in using digital tools for record keeping? (Select all that apply)",
          options: [
            { value: "cost", label: "Cost of software, devices or data" },
            { value: "skills", label: "Lack of skills or training" },
            { value: "power", label: "Unreliable electricity" },
            { value: "internet", label: "Poor internet connectivity" },
            { value: "time", label: "Not enough time" },
            { value: "trust", label: "Fear of losing data / security concerns" },
            { value: "not_needed", label: "Don't see the need" },
            { value: "none", label: "No challenges" },
          ],
          exclusive: "none",
        },
      ],
    },
    {
      id: "dat",
      title: "Section C: Use of digital accounting tools",
      intro:
        "How often does the business use digital tools (Excel, apps, POS, mobile money records, software) for the following?",
      items: [
        { id: "DAT1", type: "likert", scale: "frequency", construct: "DAT", dimension: "Extent of use", text: "Recording sales with a digital tool" },
        { id: "DAT2", type: "likert", scale: "frequency", construct: "DAT", dimension: "Extent of use", text: "Recording purchases of stock or materials with a digital tool" },
        { id: "DAT3", type: "likert", scale: "frequency", construct: "DAT", dimension: "Extent of use", text: "Recording expenses (rent, utilities, wages, transport) with a digital tool" },
        { id: "DAT4", type: "likert", scale: "frequency", construct: "DAT", dimension: "Extent of use", text: "Recording money owed to or by the business (credit sales and purchases) digitally" },
        { id: "DAT5", type: "likert", scale: "frequency", construct: "DAT", dimension: "Frequency of use", text: "Entering transactions digitally on the same day they happen" },
        { id: "DAT6", type: "likert", scale: "frequency", construct: "DAT", dimension: "Frequency of use", text: "Using a digital tool to produce daily, weekly or monthly sales totals" },
        { id: "DAT7", type: "likert", scale: "frequency", construct: "DAT", dimension: "Frequency of use", text: "Checking mobile money or bank transaction history to confirm business records" },
        { id: "DAT8", type: "likert", scale: "frequency", construct: "DAT", dimension: "Frequency of use", text: "Backing up records (cloud, email, Google Drive, flash drive)" },
      ],
    },
    {
      id: "frk",
      title: "Section D: Financial record-keeping practices",
      intro: "How much do you agree with each statement about how the business keeps its records?",
      items: [
        { id: "FRK1", type: "likert", scale: "agree", construct: "FRK", dimension: "Completeness", text: "All sales made by the business are recorded." },
        { id: "FRK2", type: "likert", scale: "agree", construct: "FRK", dimension: "Completeness", text: "All purchases of goods and materials are recorded." },
        { id: "FRK3", type: "likert", scale: "agree", construct: "FRK", dimension: "Completeness", text: "Small cash expenses (transport, snacks, airtime) are recorded." },
        { id: "FRK4", type: "likert", scale: "agree", construct: "FRK", dimension: "Completeness", text: "Some business transactions are never recorded.", reverse: true },
        { id: "FRK5", type: "likert", scale: "agree", construct: "FRK", dimension: "Regularity", text: "Records are updated every day the business operates." },
        { id: "FRK6", type: "likert", scale: "agree", construct: "FRK", dimension: "Regularity", text: "Cash at hand is compared with the records at the end of each day or week." },
        { id: "FRK7", type: "likert", scale: "agree", construct: "FRK", dimension: "Regularity", text: "Records are often written up days or weeks after transactions occur.", reverse: true },
        { id: "FRK8", type: "likert", scale: "agree", construct: "FRK", dimension: "Organisation", text: "Receipts, invoices and supporting documents are kept and filed." },
        { id: "FRK9", type: "likert", scale: "agree", construct: "FRK", dimension: "Organisation", text: "Business and personal money are recorded separately." },
        { id: "FRK10", type: "likert", scale: "agree", construct: "FRK", dimension: "Organisation", text: "I can quickly find a past transaction when I need it." },
        { id: "FRK11", type: "likert", scale: "agree", construct: "FRK", dimension: "Organisation", text: "From the records, I can tell whether the business made a profit last month." },
        { id: "FRK12", type: "likert", scale: "agree", construct: "FRK", dimension: "Organisation", text: "The records could be shown to a bank, GRA or investor if requested." },
      ],
    },
    {
      id: "closing",
      title: "Final comments",
      items: [
        {
          id: "E1",
          type: "text",
          multiline: true,
          required: false,
          text: "Is there anything else you would like to share about how your business keeps its records?",
        },
      ],
    },
  ],
};

export default config;
