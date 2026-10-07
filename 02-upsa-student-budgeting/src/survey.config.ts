// Study definition for Project 2. Edit wording, options and items here;
// the form, dashboard and exports all follow this file.
import type { SurveyConfig } from "@/lib/survey-types";

const config: SurveyConfig = {
  slug: "upsa-student-budgeting",
  shortTitle: "UPSA Student Budgeting Study",
  title:
    "Digital Payment Platforms and Personal Budgeting Practices among Undergraduate Students of the University of Professional Studies, Accra",
  institution: "University of Professional Studies, Accra (UPSA)",
  studyArea: "UPSA main campus, East Legon, Accra",
  population: "Undergraduate students of UPSA who use mobile money or mobile banking",
  accent: "#4338ca",
  problem:
    "Digital payment platforms make transactions easier, but that does not automatically mean users manage their money better. A student may receive and spend money digitally without keeping a budget or reviewing spending patterns. This study asks whether the way students use digital payment platforms is related to their personal budgeting practices.",
  objectives: [
    "To identify the digital payment platforms used by UPSA undergraduate students and the purposes they use them for.",
    "To assess the extent to which students use digital payment platforms and their transaction records.",
    "To assess the personal budgeting practices of UPSA undergraduate students.",
    "To examine the relationship between the use of digital payment platforms and personal budgeting practices.",
  ],
  hypotheses: [
    "H₀: There is no significant relationship between the use of digital payment platforms and personal budgeting practices among UPSA undergraduate students.",
    "H₁: There is a significant relationship between the use of digital payment platforms and personal budgeting practices among UPSA undergraduate students.",
  ],
  consent: [
    "You are invited to take part in an undergraduate research project by Accounting and Information Technology students of UPSA.",
    "The questionnaire takes about 8–10 minutes. It asks how you use mobile money and mobile banking, and how you plan and track your spending.",
    "Participation is voluntary and anonymous. We do not ask for your name, index number, phone number or account details. Never share a PIN or password with anyone, including researchers.",
    "Answers are reported only as group totals and used for academic purposes only.",
  ],
  constructs: [
    { key: "DPP", label: "Use of digital payment platforms", side: "IT", role: "independent" },
    { key: "PBP", label: "Personal budgeting practices", side: "Accounting", role: "dependent" },
  ],
  groupBy: ["B3", "B6", "C2"],
  sections: [
    {
      id: "screening",
      title: "Eligibility",
      screening: true,
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
          text: "Have you used mobile money or a mobile banking app to receive or spend money in the last 3 months?",
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
      title: "Section A: Background information",
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
          text: "Where do you live during the semester?",
          options: [
            { value: "hostel_on", label: "University hostel" },
            { value: "hostel_off", label: "Private hostel / rented room" },
            { value: "family", label: "With family / guardian" },
          ],
        },
        {
          id: "B6",
          type: "single",
          text: "On average, how much money do you receive or earn per month (GH₵)?",
          options: [
            { value: "lt500", label: "Below 500" },
            { value: "500_1000", label: "500 – 1,000" },
            { value: "1001_2000", label: "1,001 – 2,000" },
            { value: "2001_3000", label: "2,001 – 3,000" },
            { value: "gt3000", label: "Above 3,000" },
          ],
        },
        {
          id: "B7",
          type: "multi",
          text: "What are your main sources of money? (Select all that apply)",
          options: [
            { value: "family", label: "Parents / family" },
            { value: "job", label: "Part-time or full-time job" },
            { value: "business", label: "Own business" },
            { value: "scholarship", label: "Scholarship / bursary / student loan" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "B8",
          type: "single",
          text: "Have you taken a course or training in personal finance, budgeting or accounting?",
          options: [
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ],
        },
      ],
    },
    {
      id: "platforms",
      title: "Section B: Digital payment platforms used",
      items: [
        {
          id: "C1",
          type: "multi",
          text: "Which digital payment platforms do you use? (Select all that apply)",
          options: [
            { value: "mtn_momo", label: "MTN Mobile Money (MoMo)" },
            { value: "telecel_cash", label: "Telecel Cash" },
            { value: "at_money", label: "AT Money" },
            { value: "bank_app", label: "Mobile banking app" },
            { value: "gmoney", label: "G-Money" },
            { value: "card", label: "Debit / prepaid card" },
            { value: "fintech", label: "Other fintech app (e.g. Zeepay, Hubtel, ExpressPay)" },
          ],
        },
        {
          id: "C2",
          type: "single",
          text: "Which ONE platform do you use most?",
          options: [
            { value: "mtn_momo", label: "MTN MoMo" },
            { value: "telecel_cash", label: "Telecel Cash" },
            { value: "at_money", label: "AT Money" },
            { value: "bank_app", label: "Mobile banking app" },
            { value: "other", label: "Other" },
          ],
        },
        {
          id: "C3",
          type: "single",
          text: "About how many digital payments or transfers do you make in a typical week?",
          options: [
            { value: "1_3", label: "1 – 3" },
            { value: "4_7", label: "4 – 7" },
            { value: "8_14", label: "8 – 14" },
            { value: "15_plus", label: "15 or more" },
          ],
        },
        {
          id: "C4",
          type: "single",
          text: "Roughly what share of your total spending is done digitally (not cash)?",
          options: [
            { value: "lt25", label: "Less than 25%" },
            { value: "25_50", label: "25% – 50%" },
            { value: "51_75", label: "51% – 75%" },
            { value: "gt75", label: "More than 75%" },
          ],
        },
        {
          id: "C5",
          type: "multi",
          text: "What do you mainly use digital payments for? (Select all that apply)",
          options: [
            { value: "food", label: "Food and groceries" },
            { value: "transport", label: "Transport (trotro, Uber, Bolt)" },
            { value: "data", label: "Airtime and data bundles" },
            { value: "fees", label: "School fees, hostel and academic costs" },
            { value: "shopping", label: "Shopping (clothes, online purchases)" },
            { value: "transfers", label: "Sending money to friends / family" },
            { value: "bills", label: "Utility bills (ECG, water, subscriptions)" },
            { value: "savings", label: "Saving or investing" },
            { value: "betting", label: "Betting / gaming" },
          ],
        },
      ],
    },
    {
      id: "dpp",
      title: "Section C: How you use digital payment platforms",
      intro: "How often do you do each of the following?",
      items: [
        { id: "DPP1", type: "likert", scale: "frequency", construct: "DPP", dimension: "Extent of use", text: "I use mobile money or mobile banking to pay for my daily needs." },
        { id: "DPP2", type: "likert", scale: "frequency", construct: "DPP", dimension: "Extent of use", text: "I receive my allowance, wages or income through mobile money or a bank account." },
        { id: "DPP3", type: "likert", scale: "frequency", construct: "DPP", dimension: "Extent of use", text: "I pay bills and make purchases digitally instead of using cash." },
        { id: "DPP4", type: "likert", scale: "frequency", construct: "DPP", dimension: "Extent of use", text: "I keep most of my money in a mobile money wallet or bank account rather than as cash." },
        { id: "DPP5", type: "likert", scale: "frequency", construct: "DPP", dimension: "Use of transaction records", text: "I check my transaction history or mini-statement on the app or USSD menu." },
        { id: "DPP6", type: "likert", scale: "frequency", construct: "DPP", dimension: "Use of transaction records", text: "I read the SMS / app notifications that show my balance after each transaction." },
        { id: "DPP7", type: "likert", scale: "frequency", construct: "DPP", dimension: "Use of transaction records", text: "I download or request a statement to see where my money went." },
        { id: "DPP8", type: "likert", scale: "frequency", construct: "DPP", dimension: "Use of money-management features", text: "I use savings features on my platform (e.g. MoMo savings, a locked or goal account)." },
        { id: "DPP9", type: "likert", scale: "frequency", construct: "DPP", dimension: "Use of money-management features", text: "I move money into a separate wallet or account to keep it for a specific purpose." },
        { id: "DPP10", type: "likert", scale: "frequency", construct: "DPP", dimension: "Use of money-management features", text: "I use an app or the platform's tools to categorise or track my spending." },
      ],
    },
    {
      id: "pbp",
      title: "Section D: Personal budgeting practices",
      intro: "How much do you agree with each statement about how you manage your money?",
      items: [
        { id: "PBP1", type: "likert", scale: "agree", construct: "PBP", dimension: "Budget preparation", text: "I prepare a budget at the start of each month or semester." },
        { id: "PBP2", type: "likert", scale: "agree", construct: "PBP", dimension: "Budget preparation", text: "I write down (on paper or a phone) how much I plan to spend on each need." },
        { id: "PBP3", type: "likert", scale: "agree", construct: "PBP", dimension: "Budget preparation", text: "I set aside money for essentials (fees, rent, food) before spending on other things." },
        { id: "PBP4", type: "likert", scale: "agree", construct: "PBP", dimension: "Budget preparation", text: "I plan to save part of any money I receive." },
        { id: "PBP5", type: "likert", scale: "agree", construct: "PBP", dimension: "Expenditure monitoring", text: "I keep track of how much I spend each week." },
        { id: "PBP6", type: "likert", scale: "agree", construct: "PBP", dimension: "Expenditure monitoring", text: "I compare what I actually spent with what I planned to spend." },
        { id: "PBP7", type: "likert", scale: "agree", construct: "PBP", dimension: "Expenditure monitoring", text: "I review my past transactions to understand where my money goes." },
        { id: "PBP8", type: "likert", scale: "agree", construct: "PBP", dimension: "Expenditure monitoring", text: "I usually don't know how much I have spent until my money runs out.", reverse: true },
        { id: "PBP9", type: "likert", scale: "agree", construct: "PBP", dimension: "Spending control", text: "I stick to my spending plan." },
        { id: "PBP10", type: "likert", scale: "agree", construct: "PBP", dimension: "Spending control", text: "I think twice before making purchases I did not plan." },
        { id: "PBP11", type: "likert", scale: "agree", construct: "PBP", dimension: "Spending control", text: "I cut back when I notice I am overspending." },
        { id: "PBP12", type: "likert", scale: "agree", construct: "PBP", dimension: "Spending control", text: "I often run out of money before my next allowance or income arrives.", reverse: true },
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
          text: "Do digital payment platforms make it easier or harder for you to budget? Please explain briefly.",
        },
      ],
    },
  ],
};

export default config;
