import { useNavigate } from "react-router-dom";
import { getSession } from "../App.jsx";

const STATS = [
  { label: "Active projects", value: 12 },
  { label: "Tasks done", value: 148 },
  { label: "Team members", value: 7 },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const session = getSession();

  const logout = () => {
    localStorage.removeItem("nimbus_session");
    navigate("/login", { replace: true });
  };

  return (
    <div className="dash">
      <header className="dash-bar">
        <div className="brand"><span className="logo">☁</span> Nimbus</div>
        <button className="ghost" onClick={logout}>Log out</button>
      </header>
      <main className="dash-body">
        <h1>Hello, {session.user.name} 👋</h1>
        <p className="muted">Signed in as {session.user.email}</p>
        <div className="stats">
          {STATS.map((s) => (
            <div className="stat" key={s.label}>
              <strong>{s.value}</strong>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
