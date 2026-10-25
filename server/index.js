import express from "express";
import cors from "cors";
import login from "./login.js";

const app = express();
const PORT = process.env.PORT || 5000;

// Allowed browser origins: local dev, any *.vercel.app, plus CLIENT_ORIGIN (comma separated).
const extra = (process.env.CLIENT_ORIGIN || "").split(",").map((s) => s.trim()).filter(Boolean);
const allowed = (origin) =>
  !origin ||
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
  /^https:\/\/[a-z0-9-]+\.vercel\.app$/.test(origin) ||
  extra.includes(origin);

app.use(cors({ origin: (origin, cb) => cb(null, allowed(origin)) }));
app.use(express.json());

app.get("/", (_req, res) => res.json({ status: "ok", service: "Daybook API" }));
app.all("/api/login", login);

// Vercel runs the exported app; locally we start a normal server.
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`Daybook API listening on http://localhost:${PORT}`));
}

export default app;
