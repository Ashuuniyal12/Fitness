"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, RadialBarChart, RadialBar
} from "recharts";

// ---------- Mock data ----------
const weightData = [
  { date: "Jun 1", weight: 74.5 }, { date: "Jun 7", weight: 74.1 },
  { date: "Jun 14", weight: 73.8 }, { date: "Jun 21", weight: 73.4 },
  { date: "Jun 28", weight: 73.1 },
];

const workoutFreq = [
  { day: "Mon", sessions: 1 }, { day: "Tue", sessions: 0 },
  { day: "Wed", sessions: 1 }, { day: "Thu", sessions: 1 },
  { day: "Fri", sessions: 0 }, { day: "Sat", sessions: 1 },
  { day: "Sun", sessions: 0 },
];

const todayWorkout = [
  { name: "Barbell Squat", sets: 4, reps: 8, weight: "80 kg", done: true },
  { name: "Bench Press", sets: 4, reps: 10, weight: "65 kg", done: true },
  { name: "Incline DB Fly", sets: 3, reps: 12, weight: "16 kg", done: false },
  { name: "Leg Extensions", sets: 3, reps: 15, weight: "45 kg", done: false },
];

const recentAttendance = [
  { date: "Jun 28", time: "7:12 AM", type: "Morning" },
  { date: "Jun 26", time: "6:45 AM", type: "Morning" },
  { date: "Jun 25", time: "7:30 PM", type: "Evening" },
  { date: "Jun 23", time: "8:00 AM", type: "Morning" },
];

const macroData = [
  { name: "Protein", value: 145, target: 160, fill: "#eab308" },
  { name: "Carbs", value: 210, target: 250, fill: "#3b82f6" },
  { name: "Fats", value: 52, target: 65, fill: "#a855f7" },
];

// ---------- Main Member Dashboard ----------
export default function MemberDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good morning");
  const [waterCups, setWaterCups] = useState(4);

  useEffect(() => {
    const h = new Date().getHours();
    if (h < 12) setGreeting("Good morning");
    else if (h < 17) setGreeting("Good afternoon");
    else setGreeting("Good evening");
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>{loading ? "Loading your dashboard..." : "Redirecting..."}</p>
      </div>
    );
  }

  const firstName = user.profile?.name?.split(" ")[0] || "Champion";

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {firstName} 💪</h1>
          <p className="dash-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="streak-badge">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#eab308">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <div>
            <div className="streak-num">5</div>
            <div className="streak-label">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div className="stat-value">5</div>
          <div className="stat-label">Day Streak</div>
          <div className="stat-sub">Keep it going!</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(239,68,68,0.15)", color: "#f87171" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <div className="stat-value">420</div>
          <div className="stat-label">Calories Burned</div>
          <div className="stat-sub">Today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 007 7z"/></svg>
          </div>
          <div className="stat-value">{waterCups} / 8</div>
          <div className="stat-label">Water Intake</div>
          <div className="stat-sub">Cups today</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="stat-value">73.1</div>
          <div className="stat-label">Current Weight</div>
          <div className="stat-sub">↓ 1.4 kg this month</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="stat-value">18</div>
          <div className="stat-label">Days Left</div>
          <div className="stat-sub">Elite Annual Plan</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-value">42</div>
          <div className="stat-label">PT Sessions</div>
          <div className="stat-sub">6 remaining</div>
        </div>
      </div>

      {/* Main content row */}
      <div className="main-row">
        {/* Left: Today's workout */}
        <div className="card today-workout">
          <div className="card-header">
            <div>
              <h2 className="card-title">Today's Workout</h2>
              <p className="card-sub">Push Day · 4 exercises</p>
            </div>
            <span className="badge-active-sm">2 / 4 Done</span>
          </div>
          <div className="workout-list">
            {todayWorkout.map((ex, i) => (
              <div key={i} className={`exercise-row ${ex.done ? "done" : ""}`}>
                <div className="ex-check">
                  {ex.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                  ) : (
                    <div className="ex-circle" />
                  )}
                </div>
                <div className="ex-info">
                  <div className="ex-name">{ex.name}</div>
                  <div className="ex-meta">{ex.sets} sets × {ex.reps} reps · {ex.weight}</div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn-workout" id="log-workout-btn">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
            Log Workout
          </button>
        </div>

        {/* Right: Macros + Water */}
        <div className="right-col">
          {/* Macros */}
          <div className="card">
            <h2 className="card-title">Today's Macros</h2>
            <p className="card-sub">vs daily targets</p>
            <div className="macro-list">
              {macroData.map((m, i) => (
                <div key={i} className="macro-item">
                  <div className="macro-label-row">
                    <span className="macro-name">{m.name}</span>
                    <span className="macro-value" style={{ color: m.fill }}>{m.value}g / {m.target}g</span>
                  </div>
                  <div className="macro-bar-bg">
                    <div className="macro-bar-fill" style={{ width: `${Math.min(100, (m.value / m.target) * 100)}%`, background: m.fill }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Water tracker */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Hydration</h2>
                <p className="card-sub">{waterCups * 250}ml / 2000ml</p>
              </div>
              <div className="water-controls">
                <button className="water-btn" onClick={() => setWaterCups(Math.max(0, waterCups - 1))}>-</button>
                <span className="water-count">{waterCups}</span>
                <button className="water-btn" onClick={() => setWaterCups(Math.min(8, waterCups + 1))}>+</button>
              </div>
            </div>
            <div className="water-cups">
              {Array.from({ length: 8 }).map((_, i) => (
                <button key={i} className={`cup ${i < waterCups ? "filled" : ""}`} onClick={() => setWaterCups(i + 1)}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={i < waterCups ? "#3b82f6" : "rgba(255,255,255,0.08)"} stroke={i < waterCups ? "#3b82f6" : "rgba(255,255,255,0.15)"} strokeWidth="1.5">
                    <path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 007 7z"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Charts row */}
      <div className="charts-row">
        {/* Weight chart */}
        <div className="card chart-card">
          <h2 className="card-title">Weight Progress</h2>
          <p className="card-sub">Last 4 weeks (kg)</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={weightData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="date" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} formatter={(v: number) => [`${v} kg`, "Weight"]} />
              <Area type="monotone" dataKey="weight" stroke="#eab308" fill="url(#wGrad)" strokeWidth={2.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Workout frequency */}
        <div className="card chart-card">
          <h2 className="card-title">Workout Frequency</h2>
          <p className="card-sub">This week's sessions</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={workoutFreq} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="sessions" fill="#eab308" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Attendance */}
        <div className="card">
          <h2 className="card-title">Recent Attendance</h2>
          <p className="card-sub">Last check-ins</p>
          <div className="attendance-list">
            {recentAttendance.map((a, i) => (
              <div key={i} className="attendance-item">
                <div className="att-dot" />
                <div>
                  <div className="att-date">{a.date} · {a.time}</div>
                  <div className="att-type">{a.type} session</div>
                </div>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard { padding: 28px 32px; max-width: 1300px; margin: 0 auto; display: flex; flex-direction: column; gap: 24px; font-family: 'Montserrat', sans-serif; }
        .dash-loading { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; gap: 16px; color: #71717a; }
        .dash-spinner { width: 40px; height: 40px; border: 3px solid rgba(234,179,8,0.2); border-top-color: #eab308; border-radius: 50%; animation: spin 0.8s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dash-header { display: flex; align-items: center; justify-content: space-between; }
        .dash-greeting { font-size: 22px; font-weight: 700; color: #f4f4f5; margin: 0 0 4px; }
        .dash-date { font-size: 13px; color: #71717a; margin: 0; }
        .streak-badge { display: flex; align-items: center; gap: 10px; background: rgba(234,179,8,0.1); border: 1px solid rgba(234,179,8,0.2); border-radius: 12px; padding: 12px 16px; }
        .streak-num { font-size: 22px; font-weight: 800; color: #eab308; line-height: 1; }
        .streak-label { font-size: 10px; color: #a1a1aa; text-transform: uppercase; letter-spacing: 0.05em; }
        .stats-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 14px; }
        .stat-card { background: rgba(24,24,27,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 18px; display: flex; flex-direction: column; gap: 8px; transition: transform 0.15s, border-color 0.2s; }
        .stat-card:hover { transform: translateY(-2px); border-color: rgba(255,255,255,0.12); }
        .stat-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; }
        .stat-value { font-size: 22px; font-weight: 800; color: #f4f4f5; }
        .stat-label { font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-sub { font-size: 11px; color: #52525b; }
        .main-row { display: grid; grid-template-columns: 1fr 380px; gap: 16px; }
        .card { background: rgba(24,24,27,0.8); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 20px 24px; }
        .card-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 16px; }
        .card-title { font-size: 15px; font-weight: 700; color: #e4e4e7; margin: 0 0 2px; }
        .card-sub { font-size: 12px; color: #71717a; margin: 0; }
        .badge-active-sm { background: rgba(234,179,8,0.12); border: 1px solid rgba(234,179,8,0.2); color: #eab308; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 20px; white-space: nowrap; }
        .workout-list { display: flex; flex-direction: column; gap: 4px; }
        .exercise-row { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; transition: background 0.15s; }
        .exercise-row:hover { background: rgba(255,255,255,0.03); }
        .exercise-row.done { opacity: 0.6; }
        .ex-check { width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .ex-circle { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-radius: 50%; }
        .ex-name { font-size: 13px; font-weight: 600; color: #e4e4e7; }
        .ex-meta { font-size: 11px; color: #71717a; }
        .btn-workout { width: 100%; margin-top: 16px; padding: 12px; background: linear-gradient(135deg, #eab308, #d97706); border: none; border-radius: 10px; color: #09090b; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 8px; transition: opacity 0.2s, transform 0.15s; }
        .btn-workout:hover { opacity: 0.9; transform: translateY(-1px); }
        .right-col { display: flex; flex-direction: column; gap: 16px; }
        .macro-list { display: flex; flex-direction: column; gap: 14px; margin-top: 4px; }
        .macro-label-row { display: flex; justify-content: space-between; margin-bottom: 6px; }
        .macro-name { font-size: 12px; font-weight: 600; color: #a1a1aa; }
        .macro-value { font-size: 12px; font-weight: 700; }
        .macro-bar-bg { height: 6px; background: rgba(255,255,255,0.06); border-radius: 3px; overflow: hidden; }
        .macro-bar-fill { height: 100%; border-radius: 3px; transition: width 0.5s; }
        .water-controls { display: flex; align-items: center; gap: 8px; }
        .water-btn { background: rgba(255,255,255,0.08); border: none; color: #e4e4e7; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .water-btn:hover { background: rgba(255,255,255,0.15); }
        .water-count { font-size: 18px; font-weight: 800; color: #3b82f6; width: 24px; text-align: center; }
        .water-cups { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .cup { background: none; border: none; cursor: pointer; padding: 0; transition: transform 0.15s; }
        .cup:hover { transform: scale(1.1); }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
        .chart-card { }
        .attendance-list { display: flex; flex-direction: column; gap: 4px; margin-top: 8px; }
        .attendance-item { display: flex; align-items: center; gap: 10px; padding: 10px; border-radius: 8px; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .attendance-item:last-child { border-bottom: none; }
        .att-dot { width: 8px; height: 8px; border-radius: 50%; background: #4ade80; flex-shrink: 0; }
        .att-date { font-size: 12px; font-weight: 600; color: #e4e4e7; }
        .att-type { font-size: 11px; color: #71717a; }
        .attendance-item > svg { margin-left: auto; flex-shrink: 0; }
        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(3, 1fr); }
          .main-row { grid-template-columns: 1fr; }
          .charts-row { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 640px) {
          .dashboard { padding: 16px; }
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
