import { Router } from "express";
import { db } from "../db.js";

export const settingsRouter = Router();

interface SettingsRow {
  id: number;
  defaults: string;
}

settingsRouter.get("/", (_req, res) => {
  const row = db
    .prepare("SELECT * FROM settings WHERE id = 1")
    .get() as SettingsRow;
  res.json(JSON.parse(row.defaults));
});

settingsRouter.put("/", (req, res) => {
  const defaults = req.body ?? {};
  if (typeof defaults !== "object") {
    res.status(400).json({ error: "Body must be an object" });
    return;
  }
  db.prepare("UPDATE settings SET defaults = ? WHERE id = 1").run(
    JSON.stringify(defaults)
  );
  res.json(defaults);
});
