import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { Pool } from "pg";
import config from "@/survey.config";
import type { Answers, ResponseStatus, StoredResponse } from "./survey-types";

// Storage backend:
// - DATABASE_URL set   → Postgres (production). One database can hold several studies;
//                        rows are separated by the `study` column (= config.slug).
// - DATABASE_URL unset → a local SQLite file, so `npm run dev` works with no setup.

export type NewResponse = {
  status: ResponseStatus;
  answers: Answers;
  durationSec: number | null;
  isDemo?: boolean;
  createdAt?: string;
};

type Store = {
  insertMany(rows: (NewResponse & { id: string })[]): Promise<void>;
  list(includeDemo: boolean): Promise<StoredResponse[]>;
  counts(): Promise<{ real: number; demo: number }>;
  deleteDemo(): Promise<void>;
};

// ---------- Postgres ----------

function postgresStore(url: string): Store {
  const g = globalThis as unknown as { __surveyPool?: Pool; __surveySchema?: Promise<unknown> };
  // Reuse one pool across hot reloads in dev.
  const pool = (g.__surveyPool ??= new Pool({ connectionString: url, max: 5 }));
  const ready = (g.__surveySchema ??= pool
    .query(
      `CREATE TABLE IF NOT EXISTS survey_responses (
         id uuid PRIMARY KEY,
         study text NOT NULL,
         created_at timestamptz NOT NULL,
         status text NOT NULL,
         duration_sec integer,
         is_demo boolean NOT NULL DEFAULT false,
         answers jsonb NOT NULL
       );
       CREATE INDEX IF NOT EXISTS survey_responses_study_idx ON survey_responses (study, created_at);`,
    )
    .catch((e) => {
      g.__surveySchema = undefined; // retry on the next request
      throw e;
    }));
  const study = config.slug;

  return {
    async insertMany(rows) {
      await ready;
      // One round trip for any number of rows.
      await pool.query(
        `INSERT INTO survey_responses (id, study, created_at, status, duration_sec, is_demo, answers)
         SELECT id, $1, created_at, status, duration_sec, is_demo, answers
         FROM jsonb_to_recordset($2::jsonb)
           AS x(id uuid, created_at timestamptz, status text, duration_sec integer, is_demo boolean, answers jsonb)`,
        [
          study,
          JSON.stringify(
            rows.map((r) => ({
              id: r.id,
              created_at: r.createdAt ?? new Date().toISOString(),
              status: r.status,
              duration_sec: r.durationSec,
              is_demo: !!r.isDemo,
              answers: r.answers,
            })),
          ),
        ],
      );
    },
    async list(includeDemo) {
      await ready;
      const { rows } = await pool.query<{
        id: string;
        created_at: Date;
        status: string;
        duration_sec: number | null;
        is_demo: boolean;
        answers: Answers;
      }>(
        `SELECT id, created_at, status, duration_sec, is_demo, answers FROM survey_responses
         WHERE study = $1 ${includeDemo ? "" : "AND NOT is_demo"} ORDER BY created_at`,
        [study],
      );
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at.toISOString(),
        status: r.status as ResponseStatus,
        durationSec: r.duration_sec,
        isDemo: r.is_demo,
        answers: r.answers,
      }));
    },
    async counts() {
      await ready;
      const { rows } = await pool.query<{ real: number; demo: number }>(
        `SELECT COUNT(*) FILTER (WHERE NOT is_demo)::int AS real, COUNT(*) FILTER (WHERE is_demo)::int AS demo
         FROM survey_responses WHERE study = $1`,
        [study],
      );
      return rows[0];
    },
    async deleteDemo() {
      await ready;
      await pool.query("DELETE FROM survey_responses WHERE study = $1 AND is_demo", [study]);
    },
  };
}

// ---------- SQLite (local fallback) ----------

function sqliteStore(file: string): Store {
  const g = globalThis as unknown as { __surveySqlite?: DatabaseSync };
  if (!g.__surveySqlite) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    const db = new DatabaseSync(file);
    db.exec(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS responses (
        id TEXT PRIMARY KEY,
        created_at TEXT NOT NULL,
        status TEXT NOT NULL,
        duration_sec INTEGER,
        is_demo INTEGER NOT NULL DEFAULT 0,
        answers TEXT NOT NULL
      );
    `);
    g.__surveySqlite = db;
  }
  const db = g.__surveySqlite;

  type Row = { id: string; created_at: string; status: string; duration_sec: number | null; is_demo: number; answers: string };

  return {
    async insertMany(rows) {
      const stmt = db.prepare(
        "INSERT INTO responses (id, created_at, status, duration_sec, is_demo, answers) VALUES (?, ?, ?, ?, ?, ?)",
      );
      db.exec("BEGIN");
      try {
        for (const r of rows)
          stmt.run(r.id, r.createdAt ?? new Date().toISOString(), r.status, r.durationSec, r.isDemo ? 1 : 0, JSON.stringify(r.answers));
        db.exec("COMMIT");
      } catch (e) {
        db.exec("ROLLBACK");
        throw e;
      }
    },
    async list(includeDemo) {
      const rows = db
        .prepare(`SELECT * FROM responses ${includeDemo ? "" : "WHERE is_demo = 0"} ORDER BY created_at`)
        .all() as unknown as Row[];
      return rows.map((r) => ({
        id: r.id,
        createdAt: r.created_at,
        status: r.status as ResponseStatus,
        durationSec: r.duration_sec,
        isDemo: r.is_demo === 1,
        answers: JSON.parse(r.answers) as Answers,
      }));
    },
    async counts() {
      const row = db.prepare("SELECT SUM(is_demo = 0) AS real, SUM(is_demo = 1) AS demo FROM responses").get() as {
        real: number | null;
        demo: number | null;
      };
      return { real: row.real ?? 0, demo: row.demo ?? 0 };
    },
    async deleteDemo() {
      db.prepare("DELETE FROM responses WHERE is_demo = 1").run();
    },
  };
}

let store: Store | undefined;

function getStore(): Store {
  return (store ??= process.env.DATABASE_URL
    ? postgresStore(process.env.DATABASE_URL)
    : sqliteStore(process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "responses.db")));
}

// ---------- public API ----------

export async function insertResponse(r: NewResponse): Promise<string> {
  const id = randomUUID();
  await getStore().insertMany([{ ...r, id }]);
  return id;
}

export async function insertMany(rows: NewResponse[]): Promise<void> {
  await getStore().insertMany(rows.map((r) => ({ ...r, id: randomUUID() })));
}

export function listResponses(opts: { includeDemo: boolean }): Promise<StoredResponse[]> {
  return getStore().list(opts.includeDemo);
}

export function countResponses(): Promise<{ real: number; demo: number }> {
  return getStore().counts();
}

export function deleteDemoResponses(): Promise<void> {
  return getStore().deleteDemo();
}
