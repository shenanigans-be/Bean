import express from "express";
import cors from "cors";
import "./db.js";
import { entriesRouter } from "./routes/entries.js";
import { settingsRouter } from "./routes/settings.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/entries", entriesRouter);
app.use("/api/settings", settingsRouter);

app.get("/api/health", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT ?? 3001);
app.listen(port, () => {
  console.log(`bean backend listening on :${port}`);
});
