# UPSA Accounting & IT Project – Research Apps

One self-contained Next.js + SQLite app per proposed topic. Each has an online questionnaire, an analysis dashboard and SPSS-ready exports.

| Folder | Topic | IT variable (IV) | Accounting variable (DV) |
| --- | --- | --- | --- |
| `01-madina-sme-records` | Digital accounting tools & record keeping, small businesses in Madina | Use of digital accounting tools (DAT) | Financial record-keeping practices (FRK) |
| `02-upsa-student-budgeting` | Digital payment platforms & personal budgeting, UPSA undergraduates | Use of digital payment platforms (DPP) | Personal budgeting practices (PBP) |
| `03-upsa-student-entrepreneurs` | Digital bookkeeping tools & cash management, UPSA student entrepreneurs | Use of digital bookkeeping tools (DBT) | Cash management practices (CMP) |

The apps share the same engine (`src/lib`, `src/components`). Only `src/survey.config.ts` differs.
See each folder's README for how to run it.
