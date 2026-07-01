"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AttendanceRecord {
  id: string;
  date: string;
  checkInTime: string | null;
}

interface PRRecord {
  id: string;
  exerciseId: string;
  maxWeight: number;
  reps: number;
  status: string;
  createdAt: string;
  exercise: {
    id: string;
    name: string;
    category: string;
  };
}

export default function MemberDashboard() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  // Greeting state
  const [greeting, setGreeting] = useState("Good morning");

  // Dynamic dashboard states
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [myPrs, setMyPrs] = useState<PRRecord[]>([]);
  const [fetchingDash, setFetchingDash] = useState(true);

  // Exercise selection for PR Chart
  const [selectedPrExId, setSelectedPrExId] = useState("");

  // Water intake persistence
  const [waterCups, setWaterCups] = useState<number>(0);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("waterCups");
      if (saved) setWaterCups(parseInt(saved, 10));
    }
  }, []);

  const handleWaterChange = (val: number) => {
    setWaterCups(val);
    localStorage.setItem("waterCups", String(val));
  };

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

  useEffect(() => {
    if (!token || !user?.id) return;
    setFetchingDash(true);

    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/users/${user.id}/dashboard`, { headers }).then(r => r.json()),
      fetch(`${API}/attendance/history`, { headers }).then(r => r.json()),
      fetch(`${API}/workouts/my-prs`, { headers }).then(r => r.json())
    ])
      .then(([dash, att, prs]) => {
        setDashboardData(dash);
        if (Array.isArray(att)) setAttendance(att);
        if (Array.isArray(prs)) setMyPrs(prs);
      })
      .catch(err => console.error("Error loading dashboard data:", err))
      .finally(() => setFetchingDash(false));
  }, [user?.id, token]);

  if (loading || !user) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  const firstName = user.profile?.name?.split(" ")[0] || "Champion";

  // Parse Profile Height & Weight
  const height = dashboardData?.user?.profile?.height ?? null; // in cm
  const weight = dashboardData?.user?.profile?.weight ?? null; // in kg

  // Compute BMI
  const bmi = height && weight
    ? (weight / Math.pow(height / 100, 2)).toFixed(1)
    : null;

  const bmiCategory = bmi
    ? (() => {
        const val = parseFloat(bmi);
        if (val < 18.5) return { text: "Underweight", color: "#f87171" };
        if (val < 25.0) return { text: "Normal Weight", color: "#4ade80" };
        if (val < 30.0) return { text: "Overweight", color: "#f97316" };
        return { text: "Obese", color: "#ef4444" };
      })()
    : { text: "Set Height/Weight", color: "#71717a" };

  // Helper local timezone string formatter
  function toLocalIsoString(dateStr: string) {
    const d = new Date(dateStr);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  }

  const localAttendanceDates = new Set(attendance.map(r => toLocalIsoString(r.date)));

  // Compute Streak going backward
  const streak = (() => {
    let s = 0;
    const d = new Date();
    d.setHours(0, 0, 0, 0);

    const todayStr = toLocalIsoString(d.toISOString());
    const yesterday = new Date(d);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = toLocalIsoString(yesterday.toISOString());

    if (!localAttendanceDates.has(todayStr) && !localAttendanceDates.has(yesterdayStr)) {
      return 0;
    }

    const checkDate = localAttendanceDates.has(todayStr) ? d : yesterday;
    while (localAttendanceDates.has(toLocalIsoString(checkDate.toISOString()))) {
      s++;
      checkDate.setDate(checkDate.getDate() - 1);
    }
    return s;
  })();

  // Compute Weekly Workout Frequency using Attendance
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay()); // Sunday
  startOfWeek.setHours(0, 0, 0, 0);

  const workoutFreq = Array.from({ length: 7 }, (_, idx) => {
    const cur = new Date(startOfWeek);
    cur.setDate(cur.getDate() + idx);
    const dateStr = toLocalIsoString(cur.toISOString());
    const present = localAttendanceDates.has(dateStr);
    return {
      day: weekdaysShort[cur.getDay()],
      sessions: present ? 1 : 0
    };
  });

  // Recent check-ins list
  const recentAttendance = attendance.slice(0, 4).map(r => {
    const d = new Date(r.date);
    const timeStr = r.checkInTime ? new Date(r.checkInTime).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }) : "Check-in";
    return {
      date: d.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      time: timeStr,
      type: r.checkInTime && new Date(r.checkInTime).getHours() < 12 ? "Morning" : "Evening"
    };
  });

  // Unique exercises with approved PRs
  const approvedPrs = myPrs.filter(pr => pr.status === "APPROVED");
  const uniquePrExercises = approvedPrs.reduce((acc: { id: string; name: string }[], pr) => {
    if (!acc.some(x => x.id === pr.exercise.id)) {
      acc.push(pr.exercise);
    }
    return acc;
  }, []);

  // Set default selected exercise if empty
  if (selectedPrExId === "" && uniquePrExercises.length > 0) {
    setSelectedPrExId(uniquePrExercises[0].id);
  }

  // Filter and sort chosen exercise PR progression over time
  const prProgressData = approvedPrs
    .filter(pr => pr.exerciseId === selectedPrExId)
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    .map(pr => ({
      date: new Date(pr.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
      weight: pr.maxWeight,
      reps: pr.reps
    }));

  const selectedExerciseName = uniquePrExercises.find(ex => ex.id === selectedPrExId)?.name || "Exercise";

  // Strength Distribution Bar Chart (Highest Weight per exercise)
  const strengthDistribution = uniquePrExercises.map(ex => {
    const bestWeight = Math.max(
      ...approvedPrs.filter(pr => pr.exerciseId === ex.id).map(pr => pr.maxWeight)
    );
    return {
      exercise: ex.name.length > 12 ? ex.name.slice(0, 10) + "..." : ex.name,
      weight: bestWeight
    };
  });

  // Membership expiry date
  const memName = dashboardData?.membership?.plan?.name || "No Membership";
  const daysLeft = dashboardData?.membership?.endDate
    ? Math.max(0, Math.ceil((new Date(dashboardData.membership.endDate).getTime() - new Date().getTime()) / 86400000))
    : 0;

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
            <div className="streak-num">{streak}</div>
            <div className="streak-label">Day Streak</div>
          </div>
        </div>
      </div>

      {/* Top stat cards */}
      <div className="stats-grid">
        {/* Streak */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(234,179,8,0.15)", color: "#eab308" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <div className="stat-value">{streak} Days</div>
          <div className="stat-label">Active Streak</div>
          <div className="stat-sub">{streak > 0 ? "Keep crushing it!" : "Log check-in code"}</div>
        </div>

        {/* Current Weight */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(34,197,94,0.15)", color: "#4ade80" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <div className="stat-value">{weight ? `${weight} kg` : "N/A"}</div>
          <div className="stat-label">Bodyweight</div>
          <div className="stat-sub">{height ? `Height: ${height} cm` : "Not set in settings"}</div>
        </div>

        {/* BMI Card */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(168,85,247,0.15)", color: "#c084fc" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 007 7z"/></svg>
          </div>
          <div className="stat-value">{bmi || "N/A"}</div>
          <div className="stat-label">BMI Score</div>
          <div className="stat-sub" style={{ color: bmiCategory.color, fontWeight: 600 }}>{bmiCategory.text}</div>
        </div>

        {/* Lifetime Attendance */}
        <div className="stat-card">
          <div className="stat-icon" style={{ background: "rgba(59,130,246,0.15)", color: "#60a5fa" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
          </div>
          <div className="stat-value">{attendance.length} Visits</div>
          <div className="stat-label">Total Visits</div>
          <div className="stat-sub">Lifetime Check-ins</div>
        </div>

        {/* Membership Details */}
        <div className="stat-card" style={{ gridColumn: "span 2" }}>
          <div className="stat-icon" style={{ background: "rgba(6,182,212,0.15)", color: "#22d3ee" }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div className="stat-value" style={{ fontSize: 18, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{memName}</div>
          <div className="stat-label">Membership Status</div>
          <div className="stat-sub" style={{ color: daysLeft > 0 ? "#22d3ee" : "#f87171" }}>{daysLeft > 0 ? `${daysLeft} Days remaining` : "Expired / Inactive"}</div>
        </div>
      </div>

      {/* Main content row */}
      <div className="main-row">
        {/* Left: Active/Completed Workout Plans */}
        <div className="card today-workout">
          <div className="card-header">
            <div>
              <h2 className="card-title">Custom Workout Plans</h2>
              <p className="card-sub">Create, log, and achieve goals</p>
            </div>
            <button className="badge-active-sm" style={{ cursor: "pointer", border: "none", outline: "none" }} onClick={() => router.push("/workout")}>
              Go to Planner →
            </button>
          </div>
          <div className="workout-list" style={{ marginTop: 12 }}>
            <div style={{ padding: "18px 12px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10, textAlign: "center", color: "#a1a1aa" }}>
              <div style={{ fontSize: 13, marginBottom: 12 }}>
                Manage, edit, or log a custom workout session to test your strength parameters!
              </div>
              <button 
                onClick={() => router.push("/workout")}
                style={{ 
                  background: "#eab308", border: "none", color: "#18181b", fontSize: 12, fontWeight: 700, padding: "8px 16px", borderRadius: 8, cursor: "pointer" 
                }}
              >
                Log Active Workout
              </button>
            </div>
          </div>
        </div>

        {/* Right: Water Tracker */}
        <div className="right-col">
          {/* Water tracker */}
          <div className="card">
            <div className="card-header">
              <div>
                <h2 className="card-title">Hydration Tracker</h2>
                <p className="card-sub">{waterCups * 250}ml / 2000ml (Daily Target)</p>
              </div>
              <div className="water-controls">
                <button className="water-btn" onClick={() => handleWaterChange(Math.max(0, waterCups - 1))}>-</button>
                <span className="water-count">{waterCups}</span>
                <button className="water-btn" onClick={() => handleWaterChange(Math.min(8, waterCups + 1))}>+</button>
              </div>
            </div>
            <div className="water-cups" style={{ display: "flex", gap: 8, justifyContent: "center", marginTop: 16 }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <button key={i} className={`cup ${i < waterCups ? "filled" : ""}`} onClick={() => handleWaterChange(i + 1)} style={{ border: "none", background: "none", cursor: "pointer" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill={i < waterCups ? "#3b82f6" : "rgba(255,255,255,0.08)"} stroke={i < waterCups ? "#3b82f6" : "rgba(255,255,255,0.15)"} strokeWidth="1.5">
                    <path d="M12 22a7 7 0 007-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 007 7z"/>
                  </svg>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Charts (Real PRs & Logs) */}
      <div className="charts-row">
        {/* PR Progression Area Chart */}
        <div className="card chart-card" style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <h2 className="card-title">Strength PR Progression</h2>
              <p className="card-sub">Approved personal record logs (kg)</p>
            </div>

            {/* Exercise Selector */}
            {uniquePrExercises.length > 0 ? (
              <select
                value={selectedPrExId}
                onChange={e => setSelectedPrExId(e.target.value)}
                style={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,.08)",
                  borderRadius: 6,
                  padding: "6px 12px",
                  color: "#fafafa",
                  fontSize: 12,
                  outline: "none"
                }}
              >
                {uniquePrExercises.map(ex => (
                  <option key={ex.id} value={ex.id}>{ex.name}</option>
                ))}
              </select>
            ) : null}
          </div>

          {uniquePrExercises.length > 0 && prProgressData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={prProgressData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="prGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#eab308" stopOpacity={0.35}/>
                    <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="#71717a" tick={{ fontSize: 10 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                <Tooltip 
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }} 
                  labelStyle={{ color: "#71717a", fontSize: "11px" }}
                  itemStyle={{ fontSize: "12px", color: "#fafafa" }}
                  formatter={(v: number, name: string, props: any) => [
                    `${v} kg (${props.payload.reps} reps)`, "PR Lift"
                  ]} 
                />
                <Area type="monotone" dataKey="weight" stroke="#eab308" fill="url(#prGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 10, minHeight: 180, color: "#52525b", fontSize: 13 }}>
              No verified PR progress logs to display. Submit a PR in workouts list!
            </div>
          )}
        </div>

        {/* Strength Distribution Bar Chart */}
        <div className="card chart-card" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <h2 className="card-title">Top Lift Comparison</h2>
            <p className="card-sub">Max weight lifted per exercise (kg)</p>
          </div>
          
          {strengthDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={strengthDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="exercise" stroke="#71717a" tick={{ fontSize: 9 }} />
                <YAxis stroke="#71717a" tick={{ fontSize: 10 }} />
                <Tooltip 
                  contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ fontSize: "12px", color: "#fafafa" }}
                  formatter={(v: number) => [`${v} kg`, "Best Weight"]}
                />
                <Bar dataKey="weight" fill="#818cf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 10, minHeight: 180, color: "#52525b", fontSize: 13 }}>
              Submit & approve PRs to see lift comparisons.
            </div>
          )}
        </div>
      </div>

      {/* Weekly frequency & recent attendance */}
      <div className="charts-row">
        {/* Workout frequency */}
        <div className="card chart-card" style={{ gridColumn: "span 2" }}>
          <h2 className="card-title">Weekly Visit Frequency</h2>
          <p className="card-sub">Attendance check-ins for the current week</p>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={workoutFreq} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} domain={[0, 1]} />
              <Tooltip 
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                formatter={(v: number) => [v === 1 ? "Present" : "Absent", "Status"]}
              />
              <Bar dataKey="sessions" fill="#eab308" radius={[4, 4, 0, 0]} name="Sessions" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recent Attendance list */}
        <div className="card">
          <h2 className="card-title">Recent Attendance</h2>
          <p className="card-sub">Last check-ins</p>
          <div className="attendance-list" style={{ marginTop: 12 }}>
            {recentAttendance.length > 0 ? (
              recentAttendance.map((a, i) => (
                <div key={i} className="attendance-item">
                  <div className="att-dot" />
                  <div>
                    <div className="att-date">{a.date} · {a.time}</div>
                    <div className="att-type">{a.type} session</div>
                  </div>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              ))
            ) : (
              <div style={{ padding: "16px 12px", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "center", color: "#52525b", fontSize: 12 }}>
                No check-ins logged yet.
              </div>
            )}
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
        .right-col { display: flex; flex-direction: column; gap: 16px; }
        .water-controls { display: flex; align-items: center; gap: 8px; }
        .water-btn { background: rgba(255,255,255,0.08); border: none; color: #e4e4e7; width: 28px; height: 28px; border-radius: 8px; cursor: pointer; font-size: 16px; font-weight: 700; display: flex; align-items: center; justify-content: center; transition: background 0.15s; }
        .water-btn:hover { background: rgba(255,255,255,0.15); }
        .water-count { font-size: 18px; font-weight: 800; color: #3b82f6; width: 24px; text-align: center; }
        .water-cups { display: flex; gap: 8px; margin-top: 12px; flex-wrap: wrap; }
        .cup { background: none; border: none; cursor: pointer; padding: 0; transition: transform 0.15s; }
        .cup:hover { transform: scale(1.1); }
        .charts-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }
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
          .charts-row { grid-template-columns: 1fr; }
          .charts-row > .chart-card { grid-column: span 1 !important; }
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
