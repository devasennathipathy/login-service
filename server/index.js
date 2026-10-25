import express from "express";
import cors from "cors";
import login from "../api/login.js";

// Local dev server: mounts the same handler Vercel runs as a serverless function.
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: ["http://localhost:5173", "http://127.0.0.1:5173"] }));
app.use(express.json());
app.all("/api/login", login);

app.listen(PORT, () => console.log(`Nimbus API listening on http://localhost:${PORT}`));
