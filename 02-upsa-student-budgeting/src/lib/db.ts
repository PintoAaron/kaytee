import "server-only";
import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Answers, ResponseStatus, StoredResponse } from "./survey-types";

const DB_PATH = process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "responses.db");

let db: DatabaseSync | undefined;

function getDb(): DatabaseSync {
  if (db) return db;
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });
  db = new DatabaseSync(DB_PATH);
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
  return db;
}

type Row = {
  id: string;
  created_at: string;
  status: string;
  duration_sec: number | null;
  is_demo: number;
  answers: string;
};

export function insertResponse(r: {
  status: ResponseStatus;
  answers: Answers;
  durationSec: number | null;
  isDemo?: boolean;
  createdAt?: string;
}): string {
  const id = randomUUID();
  getDb()
    .prepare("INSERT INTO responses (id, created_at, status, duration_sec, is_demo, answers) VALUES (?, ?, ?, ?, ?, ?)")
    .run(id, r.createdAt ?? new Date().toISOString(), r.status, r.durationSec, r.isDemo ? 1 : 0, JSON.stringify(r.answers));
  return id;
}

export function insertMany(rows: Parameters<typeof insertResponse>[0][]): void {
  const d = getDb();
  d.exec("BEGIN");
  try {
    for (const r of rows) insertResponse(r);
    d.exec("COMMIT");
  } catch (e) {
    d.exec("ROLLBACK");
    throw e;
  }
}

export function listResponses(opts: { includeDemo: boolean }): StoredResponse[] {
  const rows = getDb()
    .prepare(`SELECT * FROM responses ${opts.includeDemo ? "" : "WHERE is_demo = 0"} ORDER BY created_at`)
    .all() as unknown as Row[];
  return rows.map((r) => ({
    id: r.id,
    createdAt: r.created_at,
    status: r.status as ResponseStatus,
    durationSec: r.duration_sec,
    isDemo: r.is_demo === 1,
    answers: JSON.parse(r.answers) as Answers,
  }));
}

export function countResponses(): { real: number; demo: number } {
  const row = getDb()
    .prepare("SELECT SUM(is_demo = 0) AS real, SUM(is_demo = 1) AS demo FROM responses")
    .get() as { real: number | null; demo: number | null };
  return { real: row.real ?? 0, demo: row.demo ?? 0 };
}

export function deleteDemoResponses(): void {
  getDb().prepare("DELETE FROM responses WHERE is_demo = 1").run();
}
