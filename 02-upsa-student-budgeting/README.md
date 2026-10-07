# UPSA Student Budgeting Study

Online questionnaire and analysis dashboard for the UPSA Accounting & IT undergraduate project.
See `src/survey.config.ts` for the full study definition (title, objectives, hypotheses, questionnaire).

## Run it

Requires Node.js 22.13 or newer.

```bash
npm install
cp .env.example .env.local     # then set ADMIN_PASSWORD
npm run dev                    # http://localhost:3000
```

### Storage

- **Production:** set `DATABASE_URL` to a Postgres connection string. The table `survey_responses` is created
  automatically on first use. Several studies can share one database, since rows are separated by the `study` column.
- **Local:** if `DATABASE_URL` is not set, responses go to a SQLite file at `data/responses.db` (git-ignored).

### Deploying on Render

The repository root contains `render.yaml`. In Render, choose **New → Blueprint**, select the repository,
enter `DATABASE_URL` and `ADMIN_PASSWORD` for each service, then click **Apply**.

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
