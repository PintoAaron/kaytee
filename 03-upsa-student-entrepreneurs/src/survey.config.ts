// Study definition for Project 3. Edit wording, options and items here;
// the form, dashboard and exports all follow this file.
import type { SurveyConfig } from "@/lib/survey-types";

const config: SurveyConfig = {
  slug: "upsa-student-entrepreneurs",
  shortTitle: "UPSA Student Entrepreneurs Study",
  title:
    "Use of Digital Bookkeeping Tools and Cash Management Practices among Student Entrepreneurs at the University of Professional Studies, Accra",
  institution: "University of Professional Studies, Accra (UPSA)",
  studyArea: "UPSA, Accra",
  population:
    "UPSA undergraduate students who own or co-own and actively run a business that has operated for at least 3 months and made a sale in the last 30 days",
  accent: "#b45309",
  problem:
    "Running a business while studying makes record keeping and cash management difficult. Student entrepreneurs receive money through cash, mobile money and bank transfer, but those transactions are not always recorded, and business funds are not always kept separate from personal funds. This study examines how the use of digital bookkeeping tools relates to cash management practices.",
  objectives: [
    "To identify the digital bookkeeping tools used by student entrepreneurs at UPSA.",
    "To assess the extent to which student entrepreneurs use digital bookkeeping tools.",
    "To assess the cash management practices of student entrepreneurs at UPSA.",
    "To examine the relationship between the use of digital bookkeeping tools and cash management practices.",
  ],
  hypotheses: [
    "H₀: There is no significant relationship between the use of digital bookkeeping tools and cash management practices among student entrepreneurs at UPSA.",
    "H₁: There is a significant relationship between the use of digital bookkeeping tools and cash management practices among student entrepreneurs at UPSA.",
  ],
  consent: [
    "You are invited to take part in an undergraduate research project by Accounting and Information Technology students of UPSA.",
    "The questionnaire is for students who run a business. It takes about 10 minutes and asks how you record business transactions and manage business money.",
    "Participation is voluntary and anonymous. We do not ask for your name, index number, business name or phone number, and answers are reported only as group totals.",
    "The information is used for academic purposes only.",
  ],
  constructs: [
    { key: "DBT", label: "Use of digital bookkeeping tools", side: "IT", role: "independent" },
    { key: "CMP", label: "Cash management practices", side: "Accounting", role: "dependent" },
  ],
  groupBy: ["C1", "C4", "D2"],
  sections: [
    {
      id: "screening",
      title: "Eligibility",
      screening: true,
      intro:
        "For this study, a student entrepreneur is a UPSA undergraduate who owns or co-owns and actively runs a business that has operated for at least 3 months and made a sale in the last 30 days.",
      items: [
        {
          id: "S1",
          type: "single",
          text: "Are you currently an undergraduate student of UPSA?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          eligibleIf: ["yes"],
        },
        {
          id: "S2",
          type: "single",
          text: "Do you own or co-own a business that you actively run?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          eligibleIf: ["yes"],
        },
        {
          id: "S3",
          type: "single",
          text: "How long has the business been operating?",
          options: [
            { value: "lt3m", label: "Less than 3 months" },
            { value: "3_12m", label: "3 – 12 months" },
            { value: "1_2y", label: "1 – 2 years" },
            { value: "gt2y", label: "More than 2 years" },
          ],
          eligibleIf: ["3_12m", "1_2y", "gt2y"],
        },
        {
          id: "S4",
          type: "single",
          text: "Has the business made at least one sale in the last 30 days?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
          eligibleIf: ["yes"],
        },
      ],
    },
    {
      id: "profile",
      title: "Section A: About you",
      items: [
        {
          id: "B1",
          type: "single",
          text: "Gender",
          options: [
            { value: "male", label: "Male" },
            { value: "female", label: "Female" },
            { value: "na", label: "Prefer not to say" },
          ],
        },
        {
          id: "B2",
          type: "single",
          text: "Age group",
          options: [
            { value: "lt20", label: "Below 20" },
            { value: "20_23", label: "20 – 23" },
            { value: "24_27", label: "24 – 27" },
            { value: "28_plus", label: "28 and above" },
          ],
        },
        {
          id: "B3",
          type: "single",
          text: "Level of study",
          options: [
            { value: "100", label: "Level 100" },
            { value: "200", label: "Level 200" },
            { value: "300", label: "Level 300" },
            { value: "400", label: "Level 400" },
          ],
        },
        {
          id: "B4",
          type: "single",
          text: "Faculty / area of study",
          options: [
            { value: "accounting_finance", label: "Accounting and Finance" },
            { value: "management", label: "Management Studies" },
            { value: "it_comms", label: "IT and Communication Studies" },
            { value: "law", label: "Law" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "B5",
          type: "single",
          text: "Have you taken any course or training in bookkeeping or accounting?",
          options: [
            { value: "none", label: "No" },
            { value: "course", label: "Yes, as part of my programme" },
            { value: "short", label: "Yes, a short course / workshop / online" },
          ],
        },
      ],
    },
    {
      id: "business",
      title: "Section B: About your business",
      items: [
        {
          id: "C1",
          type: "single",
          text: "What does your business mainly do?",
          options: [
            { value: "fashion", label: "Clothing, shoes, bags and accessories" },
            { value: "food", label: "Food, snacks and drinks" },
            { value: "beauty", label: "Hair, nails, make-up and cosmetics" },
            { value: "electronics", label: "Phones, gadgets and accessories" },
            { value: "design_print", label: "Graphic design, printing and branding" },
            { value: "services", label: "Tutoring, writing, photography or other services" },
            { value: "events", label: "Events and decor" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "C2",
          type: "single",
          text: "Where do you mainly sell?",
          options: [
            { value: "online", label: "Online only (WhatsApp, Instagram, TikTok, Snapchat)" },
            { value: "campus", label: "Physically on campus / hostels" },
            { value: "shop", label: "Shop or stall off campus" },
            { value: "mixed", label: "Mix of online and physical" },
          ],
        },
        {
          id: "C3",
          type: "single",
          text: "How many people help you run the business (excluding you)?",
          options: [
            { value: "0", label: "None – I run it alone" },
            { value: "1_2", label: "1 – 2" },
            { value: "3_5", label: "3 – 5" },
            { value: "6_plus", label: "6 or more" },
          ],
        },
        {
          id: "C4",
          type: "single",
          text: "Average monthly sales (GH₵)",
          options: [
            { value: "lt500", label: "Below 500" },
            { value: "500_1500", label: "500 – 1,500" },
            { value: "1501_3000", label: "1,501 – 3,000" },
            { value: "3001_6000", label: "3,001 – 6,000" },
            { value: "gt6000", label: "Above 6,000" },
            { value: "na", label: "Prefer not to say" },
          ],
        },
        {
          id: "C5",
          type: "multi",
          text: "How do customers pay you? (Select all that apply)",
          options: [
            { value: "cash", label: "Cash" },
            { value: "momo_personal", label: "Mobile money to my personal number" },
            { value: "momo_merchant", label: "Mobile money merchant / business number" },
            { value: "bank", label: "Bank transfer" },
            { value: "card", label: "Card / payment link (e.g. Paystack, Hubtel)" },
          ],
        },
        {
          id: "C6",
          type: "single",
          text: "Roughly what share of your sales is paid digitally (not cash)?",
          options: [
            { value: "lt25", label: "Less than 25%" },
            { value: "25_50", label: "25% – 50%" },
            { value: "51_75", label: "51% – 75%" },
            { value: "gt75", label: "More than 75%" },
          ],
        },
      ],
    },
    {
      id: "tools",
      title: "Section C: Bookkeeping tools",
      items: [
        {
          id: "D1",
          type: "multi",
          text: "Which tools do you use to keep records of your business? (Select all that apply)",
          options: [
            { value: "notebook", label: "Notebook / paper" },
            { value: "excel", label: "Microsoft Excel" },
            { value: "gsheets", label: "Google Sheets" },
            { value: "app", label: "Bookkeeping / inventory app (e.g. QuickBooks, Wave, Zoho, Bumpa)" },
            { value: "notes", label: "Phone notes app" },
            { value: "whatsapp", label: "WhatsApp Business (catalogue, chats, labels)" },
            { value: "momo_records", label: "Mobile money / bank transaction history" },
            { value: "none", label: "I don't keep records" },
          ],
          exclusive: "none",
        },
        {
          id: "D2",
          type: "single",
          text: "Which ONE do you rely on most?",
          options: [
            { value: "notebook", label: "Notebook / paper" },
            { value: "spreadsheet", label: "Excel / Google Sheets" },
            { value: "app", label: "Bookkeeping app" },
            { value: "notes", label: "Phone notes" },
            { value: "whatsapp", label: "WhatsApp Business" },
            { value: "momo_records", label: "Mobile money / bank history" },
          ],
          showIf: { item: "D1", in: ["notebook", "excel", "gsheets", "app", "notes", "whatsapp", "momo_records"] },
        },
        {
          id: "D3",
          type: "multi",
          text: "What stops you from using digital bookkeeping tools more? (Select all that apply)",
          options: [
            { value: "skills", label: "I don't know how to use them" },
            { value: "time", label: "No time between lectures and the business" },
            { value: "cost", label: "Cost of apps or data" },
            { value: "device", label: "No laptop / phone storage" },
            { value: "small", label: "My business is too small to need it" },
            { value: "none", label: "Nothing – I use them as much as I need" },
          ],
          exclusive: "none",
        },
      ],
    },
    {
      id: "dbt",
      title: "Section D: Use of digital bookkeeping tools",
      intro: "How often do you do each of the following?",
      items: [
        { id: "DBT1", type: "likert", scale: "frequency", construct: "DBT", dimension: "Recording transactions", text: "I record business sales in a spreadsheet or app." },
        { id: "DBT2", type: "likert", scale: "frequency", construct: "DBT", dimension: "Recording transactions", text: "I record business expenses (stock, delivery, packaging, data) in a spreadsheet or app." },
        { id: "DBT3", type: "likert", scale: "frequency", construct: "DBT", dimension: "Recording transactions", text: "I record stock or inventory levels digitally." },
        { id: "DBT4", type: "likert", scale: "frequency", construct: "DBT", dimension: "Recording transactions", text: "I record digitally the money customers owe me." },
        { id: "DBT5", type: "likert", scale: "frequency", construct: "DBT", dimension: "Tracking and reporting", text: "I use mobile money or bank transaction history to confirm business payments." },
        { id: "DBT6", type: "likert", scale: "frequency", construct: "DBT", dimension: "Tracking and reporting", text: "I use a spreadsheet or app to calculate my profit." },
        { id: "DBT7", type: "likert", scale: "frequency", construct: "DBT", dimension: "Tracking and reporting", text: "I update my digital records at least once a week." },
        { id: "DBT8", type: "likert", scale: "frequency", construct: "DBT", dimension: "Tracking and reporting", text: "I look at summaries or charts of my sales and expenses in a digital tool." },
      ],
    },
    {
      id: "cmp",
      title: "Section E: Cash management practices",
      intro: "How much do you agree with each statement about how you manage your business money?",
      items: [
        { id: "CMP1", type: "likert", scale: "agree", construct: "CMP", dimension: "Recording income and expenses", text: "Every sale I make is recorded." },
        { id: "CMP2", type: "likert", scale: "agree", construct: "CMP", dimension: "Recording income and expenses", text: "Every business expense I make is recorded." },
        { id: "CMP3", type: "likert", scale: "agree", construct: "CMP", dimension: "Recording income and expenses", text: "I keep receipts or screenshots of payments as evidence." },
        { id: "CMP4", type: "likert", scale: "agree", construct: "CMP", dimension: "Monitoring cash balances", text: "I know how much business money I have (cash plus MoMo/bank) at any time." },
        { id: "CMP5", type: "likert", scale: "agree", construct: "CMP", dimension: "Monitoring cash balances", text: "I regularly check that my cash and MoMo balances agree with my records." },
        { id: "CMP6", type: "likert", scale: "agree", construct: "CMP", dimension: "Monitoring cash balances", text: "I plan ahead for upcoming business payments such as restocking." },
        { id: "CMP7", type: "likert", scale: "agree", construct: "CMP", dimension: "Monitoring cash balances", text: "I keep some money aside as a reserve for the business." },
        { id: "CMP8", type: "likert", scale: "agree", construct: "CMP", dimension: "Separation of funds", text: "I keep business money separate from my personal money (e.g. a separate wallet, account or envelope)." },
        { id: "CMP9", type: "likert", scale: "agree", construct: "CMP", dimension: "Separation of funds", text: "I take a fixed amount from the business for myself instead of taking money whenever I need it." },
        { id: "CMP10", type: "likert", scale: "agree", construct: "CMP", dimension: "Separation of funds", text: "I often use business money for personal or school expenses.", reverse: true },
        { id: "CMP11", type: "likert", scale: "agree", construct: "CMP", dimension: "Separation of funds", text: "I sometimes cannot tell which money belongs to the business and which is mine.", reverse: true },
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
          text: "What is your biggest challenge in managing the money of your business?",
        },
      ],
    },
  ],
};

export default config;
