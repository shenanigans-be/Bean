import Database from "better-sqlite3";
import path from "node:path";
import fs from "node:fs";

const dataDir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
fs.mkdirSync(dataDir, { recursive: true });

export const db = new Database(path.join(dataDir, "bean.db"));
db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    occurred_at TEXT NOT NULL,
    occurred_at_sort TEXT NOT NULL,
    created_by TEXT,
    created_at TEXT NOT NULL,
    data TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_entries_occurred_at_sort ON entries(occurred_at_sort);

  CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    defaults TEXT NOT NULL
  );
`);

const existing = db.prepare("SELECT id FROM settings WHERE id = 1").get();
if (!existing) {
  db.prepare("INSERT INTO settings (id, defaults) VALUES (1, ?)").run(
    JSON.stringify({ defaults: {}, enabledCategories: {} })
  );
}
