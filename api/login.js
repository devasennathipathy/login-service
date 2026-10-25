import crypto from "node:crypto";

// Mock user store (no database needed)
const USERS = [
  { id: 1, name: "Demo User", email: "demo@nimbus.app", password: "Nimbus123" },
  { id: 2, name: "Alex Rivera", email: "alex@nimbus.app", password: "Secret456" },
];

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Works as a Vercel serverless function and as an Express handler.
export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed." });
  }

  const { email, password } = req.body ?? {};

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  const user = USERS.find(
    (u) => u.email === email.trim().toLowerCase() && u.password === password
  );
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.status(200).json({
    token: crypto.randomUUID(), // mock token
    user: { id: user.id, name: user.name, email: user.email },
  });
}
