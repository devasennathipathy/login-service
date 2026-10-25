import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate({ email, password }) {
  const errors = {};
  if (!email.trim()) errors.email = "Email is required.";
  else if (!EMAIL_RE.test(email.trim())) errors.email = "Enter a valid email address.";
  if (!password) errors.password = "Password is required.";
  else if (password.length < 6) errors.password = "Password must be at least 6 characters.";
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

  const onSubmit = async (e) => {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    if (Object.keys(found).length) return;

    setLoading(true);
    setServerError("");
    try {
      const { data } = await axios.post("/api/login", {
        email: form.email.trim(),
        password: form.password,
      });
      localStorage.setItem("nimbus_session", JSON.stringify(data));
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setServerError(
        err.response?.data?.message || "Can't reach the server. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <section className="auth-hero" aria-hidden="true">
        <div className="brand">
          <span className="logo">☁</span> Nimbus
        </div>
        <h2>Work that floats above the noise.</h2>
        <p>Plan, track and ship your projects from one calm workspace.</p>
        <div className="blob b1" />
        <div className="blob b2" />
      </section>

      <section className="auth-panel">
        <form className="card" onSubmit={onSubmit} noValidate>
          <div className="brand mobile-brand">
            <span className="logo">☁</span> Nimbus
          </div>
          <h1>Welcome back</h1>
          <p className="muted">Sign in to continue to your workspace.</p>

          {serverError && <div className="alert" role="alert">{serverError}</div>}

          <label htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            value={form.email}
            onChange={onChange}
            className={errors.email ? "invalid" : ""}
            aria-invalid={!!errors.email}
          />
          {errors.email && <span className="field-error">{errors.email}</span>}

          <label htmlFor="password">Password</label>
          <div className="pw-wrap">
            <input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={onChange}
              className={errors.password ? "invalid" : ""}
              aria-invalid={!!errors.password}
            />
            <button
              type="button"
              className="toggle"
              onClick={() => setShowPw((s) => !s)}
            >
              {showPw ? "Hide" : "Show"}
            </button>
          </div>
          {errors.password && <span className="field-error">{errors.password}</span>}

          <button className="primary" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>

          <p className="hint">
            Demo: <code>demo@nimbus.app</code> / <code>Nimbus123</code>
          </p>
        </form>
      </section>
    </main>
  );
}
