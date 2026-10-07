# Madina SME Records Study

Online questionnaire and analysis dashboard for the UPSA Accounting & IT undergraduate project.
See `src/survey.config.ts` for the full study definition (title, objectives, hypotheses, questionnaire).

## Run it

Requires Node.js 22.13 or newer (uses the built-in `node:sqlite`).

```bash
npm install
cp .env.example .env.local     # then set ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

For fieldwork: `npm run build && npm start`. Responses are stored in `data/responses.db` (SQLite). Back this file up. It is git-ignored.

The SQLite file needs a persistent disk, so host on a VPS, Render or Railway with a volume, or on a laptop that the team
shares over the local network (`npm start -- -H 0.0.0.0`). Serverless hosts such as Vercel do not keep local files.
To use one, replace `src/lib/db.ts` with a hosted database.

## Pages

| Path | Who | What |
| --- | --- | --- |
| `/` | anyone | Study summary, objectives, hypotheses |
| `/survey` | respondents | Consent, eligibility screening, questionnaire (phone-friendly, resumes after refresh) |
| `/admin` | researchers | Password-protected dashboard and exports |

## Dashboard

- Totals, median completion time, reasons for screening out
- Respondent profile: frequency tables for every question
- For each construct: Cronbach's alpha, mean/SD, Low/Moderate/High levels, sub-dimension and item statistics
- Hypothesis test: Spearman's rho (main test) with an APA-style write-up, Pearson's r, a chi-square cross-tab of levels,
  simple regression, and multiple regression on the IT sub-dimensions
- Group comparisons of mean scores
- Demo data: generate synthetic responses to preview everything before fieldwork. They are flagged and excluded
  unless "Include demo" is on. Delete them before analysing real data.

## Exports

- Coded CSV (numeric codes for SPSS/Excel), with composite and sub-dimension scores already computed
- Labelled CSV (text answers)
- Codebook CSV
- SPSS syntax (.sps) that applies variable and value labels after you import the coded CSV

## Editing the questionnaire

Change only `src/survey.config.ts`. Item types are `single`, `multi`, `likert` (agree/frequency scale, with
`construct`, `dimension` and an optional `reverse`), `number` and `text`. `showIf` controls conditional
questions, and `eligibleIf` on screening questions ends the survey for ineligible respondents.
Don't change item IDs once data collection has started.
