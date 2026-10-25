import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getSession } from "../App.jsx";
import Logo from "../components/Logo.jsx";

const CATEGORIES = [
  { id: "work", label: "Work" },
  { id: "health", label: "Health" },
  { id: "study", label: "Study" },
  { id: "personal", label: "Personal" },
];

const SEED = [
  { title: "Plan my week", category: "personal", done: true },
  { title: "30 minute walk", category: "health", done: false },
  { title: "Finish the login project", category: "work", done: false },
];

function greeting() {
  const h = new Date().getHours();
  if (h < 5) return "Burning the midnight oil";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function nudge(done, total) {
  if (total === 0) return "A blank page. What's the first thing you want to do today?";
  if (done === total) return "Everything's done. Go enjoy the rest of your day.";
  if (done === 0) return "Pick one thing and start with that.";
  if (done / total >= 0.5) return "Over halfway there. Keep it rolling.";
  return "Good start. One more?";
}

function Ring({ pct }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <svg className="ring" viewBox="0 0 120 120" role="img" aria-label={`${pct}% complete`}>
      <circle cx="60" cy="60" r={r} className="ring-bg" />
      <circle
        cx="60" cy="60" r={r} className="ring-fg"
        strokeDasharray={c} strokeDashoffset={c - (c * pct) / 100}
        transform="rotate(-90 60 60)"
      />
      <text x="60" y="66" textAnchor="middle" className="ring-text">{pct}%</text>
    </svg>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();
  const storeKey = `daybook_tasks_${session.user.email}`;

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(storeKey);
      if (saved) return JSON.parse(saved);
    } catch {}
    return SEED.map((t, i) => ({ ...t, id: Date.now() + i }));
  });
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("work");
  const [filter, setFilter] = useState("all");
  const [leaving, setLeaving] = useState(null);
  const [dark, setDark] = useState(() => localStorage.getItem("daybook_theme") === "dark");

  useEffect(() => {
    localStorage.setItem(storeKey, JSON.stringify(tasks));
  }, [tasks, storeKey]);

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    localStorage.setItem("daybook_theme", dark ? "dark" : "light");
  }, [dark]);

  const done = tasks.filter((t) => t.done).length;
  const pct = tasks.length ? Math.round((done / tasks.length) * 100) : 0;

  const visible = useMemo(
    () => tasks.filter((t) => (filter === "all" ? true : filter === "done" ? t.done : !t.done)),
    [tasks, filter]
  );

  const add = (e) => {
    e.preventDefault();
    const text = title.trim();
    if (!text) return;
    setTasks([{ id: Date.now(), title: text, category, done: false }, ...tasks]);
    setTitle("");
  };

  const toggle = (id) => setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));

  const remove = (id) => {
    setLeaving(id);
    setTimeout(() => {
      setTasks((ts) => ts.filter((t) => t.id !== id));
      setLeaving(null);
    }, 220);
  };

  const logout = () => {
    localStorage.removeItem("daybook_session");
    navigate("/login", { replace: true });
  };

  const firstName = session.user.name.split(" ")[0];
  const today = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });

  return (
    <div className="dash">
      <header className="dash-bar">
        <Logo size={30} />
        <div className="bar-right">
          <button className="icon-btn" onClick={() => setDark(!dark)} aria-label="Toggle dark mode">
            {dark ? "☀" : "☾"}
          </button>
          <span className="avatar" title={session.user.email}>{firstName[0]}</span>
          <button className="ghost" onClick={logout}>Log out</button>
        </div>
      </header>

      <main className="dash-body">
        <section className="hello">
          <p className="date">{today}</p>
          <h1>{greeting()}, {firstName}.</h1>
          <p className="muted">{nudge(done, tasks.length)}</p>
        </section>

        <div className="grid">
          <section className="panel">
            <form className="adder" onSubmit={add}>
              <input
                value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="What do you want to get done?" maxLength={80}
                aria-label="New activity"
              />
              <button className="primary add-btn" type="submit" disabled={!title.trim()}>Add</button>
            </form>
            <div className="chips" role="radiogroup" aria-label="Category">
              {CATEGORIES.map((c) => (
                <button
                  key={c.id} type="button" role="radio" aria-checked={category === c.id}
                  className={`chip ${c.id} ${category === c.id ? "on" : ""}`}
                  onClick={() => setCategory(c.id)}
                >
                  <i className={`dot ${c.id}`} /> {c.label}
                </button>
              ))}
            </div>

            <div className="tabs">
              {[["all", "All", tasks.length], ["todo", "To do", tasks.length - done], ["done", "Done", done]].map(
                ([id, label, n]) => (
                  <button key={id} className={filter === id ? "tab on" : "tab"} onClick={() => setFilter(id)}>
                    {label} <span>{n}</span>
                  </button>
                )
              )}
              {done > 0 && (
                <button className="clear" onClick={() => setTasks(tasks.filter((t) => !t.done))}>
                  Clear done
                </button>
              )}
            </div>

            <ul className="list">
              {visible.map((t) => (
                <li key={t.id} className={`item ${t.done ? "is-done" : ""} ${leaving === t.id ? "leaving" : ""}`}>
                  <button className="check" onClick={() => toggle(t.id)} aria-label={t.done ? "Mark as to do" : "Mark as done"}>
                    {t.done && "✓"}
                  </button>
                  <span className="item-title">{t.title}</span>
                  <span className={`tag ${t.category}`}>{CATEGORIES.find((c) => c.id === t.category)?.label}</span>
                  <button className="del" onClick={() => remove(t.id)} aria-label={`Delete ${t.title}`}>×</button>
                </li>
              ))}
            </ul>

            {visible.length === 0 && (
              <div className="empty">
                <div className="empty-art">{filter === "done" ? "🌱" : "☕"}</div>
                <p>
                  {filter === "done"
                    ? "Nothing finished yet. That's fine, you've got time."
                    : filter === "todo" && tasks.length
                    ? "All clear. Nicely done."
                    : "Nothing here yet. Add your first activity above."}
                </p>
              </div>
            )}
          </section>

          <aside className="side">
            <div className="panel progress">
              <Ring pct={pct} />
              <div>
                <strong>{done} of {tasks.length}</strong>
                <span>activities done</span>
              </div>
            </div>
            <div className="panel">
              <h3>Where your time goes</h3>
              {CATEGORIES.map((c) => {
                const n = tasks.filter((t) => t.category === c.id).length;
                return (
                  <div className="bar-row" key={c.id}>
                    <span><i className={`dot ${c.id}`} /> {c.label}</span>
                    <div className="bar"><div className={`fill ${c.id}`} style={{ width: tasks.length ? `${(n / tasks.length) * 100}%` : 0 }} /></div>
                    <em>{n}</em>
                  </div>
                );
              })}
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
