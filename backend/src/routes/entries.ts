import { Router } from "express";
import { db } from "../db.js";
import {
  ENTRY_TYPES,
  isValidOccurredAt,
  toEntry,
  toSortKey,
  type EntryRow,
} from "../types.js";

export const entriesRouter = Router();

entriesRouter.get("/", (_req, res) => {
  const rows = db
    .prepare("SELECT * FROM entries ORDER BY occurred_at_sort DESC, id DESC")
    .all() as EntryRow[];
  res.json(rows.map(toEntry));
});

entriesRouter.post("/", (req, res) => {
  const { type, occurredAt, createdBy, data } = req.body ?? {};

  if (!ENTRY_TYPES.includes(type)) {
    res.status(400).json({ error: "Invalid or missing type" });
    return;
  }
  if (!isValidOccurredAt(occurredAt)) {
    res
      .status(400)
      .json({ error: "occurredAt must match dd/mm/yyyy - HH:MM and be a real date" });
    return;
  }
  if (typeof data !== "object" || data === null) {
    res.status(400).json({ error: "data must be an object" });
    return;
  }

  const createdAt = new Date().toISOString();
  const result = db
    .prepare(
      "INSERT INTO entries (type, occurred_at, occurred_at_sort, created_by, created_at, data) VALUES (?, ?, ?, ?, ?, ?)"
    )
    .run(
      type,
      occurredAt,
      toSortKey(occurredAt),
      typeof createdBy === "string" && createdBy.trim() ? createdBy.trim() : null,
      createdAt,
      JSON.stringify(data)
    );

  const row = db
    .prepare("SELECT * FROM entries WHERE id = ?")
    .get(result.lastInsertRowid) as EntryRow;
  res.status(201).json(toEntry(row));
});

entriesRouter.put("/:id", (req, res) => {
  const id = Number(req.params.id);
  const existing = db.prepare("SELECT * FROM entries WHERE id = ?").get(id) as
    | EntryRow
    | undefined;
  if (!existing) {
    res.status(404).json({ error: "Not found" });
    return;
  }

  const { occurredAt, createdBy, data } = req.body ?? {};

  if (!isValidOccurredAt(occurredAt)) {
    res
      .status(400)
      .json({ error: "occurredAt must match dd/mm/yyyy - HH:MM and be a real date" });
    return;
  }
  if (typeof data !== "object" || data === null) {
    res.status(400).json({ error: "data must be an object" });
    return;
  }

  db.prepare(
    "UPDATE entries SET occurred_at = ?, occurred_at_sort = ?, created_by = ?, data = ? WHERE id = ?"
  ).run(
    occurredAt,
    toSortKey(occurredAt),
    typeof createdBy === "string" && createdBy.trim() ? createdBy.trim() : null,
    JSON.stringify(data),
    id
  );

  const row = db.prepare("SELECT * FROM entries WHERE id = ?").get(id) as EntryRow;
  res.json(toEntry(row));
});

entriesRouter.delete("/:id", (req, res) => {
  const id = Number(req.params.id);
  const result = db.prepare("DELETE FROM entries WHERE id = ?").run(id);
  if (result.changes === 0) {
    res.status(404).json({ error: "Not found" });
    return;
  }
  res.status(204).send();
});
