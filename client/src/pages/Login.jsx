import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Logo from "../components/Logo.jsx";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DEMO = { email: "demo@daybook.app", password: "Daybook123" };

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "That doesn't look like an email.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Use at least 6 characters.";
  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: undefined });
    setServerError("");
  };

  const submit = async (creds) => {
    setLoading(true);
    setServerError("");
    try {
      const { data } = await axios.post("/api/login", {
        email: creds.email.trim(),
        password: creds.password,
      });
      localStorage.setItem("daybook_session", JSON.stringify(data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || "Can't reach the server. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (!Object.keys(found).length) submit(form);
  };

  const useDemo = () => {
    setForm(DEMO);
    setErrors({});
    submit(DEMO);
  };

  return (
    <main className="auth">
      <section className="auth-panel">
        <form className="login-card" onSubmit={onSubmit} noValidate>
          <Logo />
          <h1>Good to see you again.</h1>
          <p className="muted">Pick up where you left off. Your day is waiting.</p>

          {serverError && <div className="alert" role="alert">{serverError}</div>}

          <label htmlFor="email">Email</label>
          <input
            id="email" name="email" type="email" autoComplete="email"
            placeholder="you@example.com" value={form.email} onChange={onChange}
            className={errors.email ? "invalid" : ""} aria-invalid={!!errors.email}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label htmlFor="password">Password</label>
          <div className="pw-wrap">
            <input
              id="password" name="password" type={showPw ? "text" : "password"}
              autoComplete="current-password" placeholder="Your password"
              value={form.password} onChange={onChange}
              className={errors.password ? "invalid" : ""} aria-invalid={!!errors.password}
            />
            <button type="button" className="toggle" onClick={() => setShowPw((s) => !s)}>
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          <button className="demo" type="button" onClick={useDemo} disabled={loading}>
            Just looking? Try the demo account
          </button>
        </form>
      </section>

      <section className="auth-art" aria-hidden="true">
        <h2>Small wins,<br />every single day.</h2>
        <div className="sticky s1"><i className="dot work" /> Finish project report <b>✓</b></div>
        <div className="sticky s2"><i className="dot health" /> 30 min evening walk</div>
        <div className="sticky s3"><i className="dot study" /> Read 20 pages <b>✓</b></div>
        <div className="sticky s4"><i className="dot personal" /> Call grandma</div>
        <p className="art-note">“You don't have to be great to start, but you have to start to be great.”</p>
      </section>
    </main>
  );
}
