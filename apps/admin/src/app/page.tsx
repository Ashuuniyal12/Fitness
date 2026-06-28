"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

// ---------- Mock data (will be replaced by API calls) ----------
const revenueData = [
  { month: "Jan", revenue: 82000, target: 75000 },
  { month: "Feb", revenue: 91000, target: 80000 },
  { month: "Mar", revenue: 87000, target: 85000 },
  { month: "Apr", revenue: 104000, target: 90000 },
  { month: "May", revenue: 98000, target: 95000 },
  { month: "Jun", revenue: 116000, target: 100000 },
];

const attendanceData = [
  { day: "Mon", checkins: 68 }, { day: "Tue", checkins: 74 },
  { day: "Wed", checkins: 82 }, { day: "Thu", checkins: 71 },
  { day: "Fri", checkins: 90 }, { day: "Sat", checkins: 110 },
  { day: "Sun", checkins: 55 },
];

const memberGrowthData = [
  { month: "Jan", total: 280 }, { month: "Feb", total: 295 },
  { month: "Mar", total: 312 }, { month: "Apr", total: 328 },
  { month: "May", total: 338 }, { month: "Jun", total: 354 },
];

const genderData = [
  { name: "Male", value: 58 },
  { name: "Female", value: 36 },
  { name: "Other", value: 6 },
];
const GENDER_COLORS = ["#eab308", "#d97706", "#71717a"];

const recentMembers = [
  { name: "Aarav Mehta", plan: "Elite Annual", joined: "Today", status: "ACTIVE" },
  { name: "Priya Sharma", plan: "Monthly Core", joined: "Yesterday", status: "ACTIVE" },
  { name: "Rohan Gupta", plan: "Couple Plan", joined: "2 days ago", status: "ACTIVE" },
  { name: "Nisha Patel", plan: "Student Pack", joined: "3 days ago", status: "TRIAL" },
  { name: "Vikram Singh", plan: "Elite Annual", joined: "4 days ago", status: "FROZEN" },
];

const expiringMemberships = [
  { name: "Ankit Verma", plan: "Monthly Core", expiresIn: "2 days" },
  { name: "Sonia Rao", plan: "Quarterly", expiresIn: "3 days" },
  { name: "Deepak Joshi", plan: "Monthly Core", expiresIn: "5 days" },
];

const todaysClasses = [
  { name: "Yoga Flow", time: "7:00 AM", trainer: "Meena K.", enrolled: 12, capacity: 15 },
  { name: "Zumba Blast", time: "9:00 AM", trainer: "Reena S.", enrolled: 18, capacity: 20 },
  { name: "Power Lifting", time: "6:00 PM", trainer: "Rohan G.", enrolled: 8, capacity: 10 },
  { name: "HIIT Cardio", time: "7:00 PM", trainer: "Arjun M.", enrolled: 14, capacity: 15 },
];

// ---------- Sub-components ----------
function StatCard({ label, value, sub, icon, color, trend, trendUp }: {
  label: string; value: string | number; sub?: string;
  icon: string; color: string; trend?: string; trendUp?: boolean;
}) {
  return (
    <div className="stat-card">
      <div className="stat-top">
        <div className="stat-icon" style={{ background: color + "20", color }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d={icon} />
          </svg>
        </div>
        {trend && (
          <span className={`stat-trend ${trendUp ? "up" : "down"}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d={trendUp ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"} />
            </svg>
            {trend}
          </span>
        )}
      </div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
      {sub && <div className="stat-sub">{sub}</div>}
    </div>
  );
}

function SectionTitle({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="section-title">
      <h2>{title}</h2>
      {sub && <p>{sub}</p>}
    </div>
  );
}

// ---------- Main Dashboard ----------
export default function AdminDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good morning");

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
        <p>{loading ? "Loading dashboard..." : "Redirecting..."}</p>
      </div>
    );
  }

  const adminName = user.profile?.name?.split(" ")[0] || "Admin";

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {adminName} 👋</h1>
          <p className="dash-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="dash-header-actions">
          <div className="search-box">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input placeholder="Search members..." />
          </div>
          <button className="btn-primary" id="add-member-btn">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Add Member
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Today's Attendance"
          value="89"
          sub="↑ 12 from yesterday"
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          color="#22c55e" trend="13%" trendUp={true}
        />
        <StatCard
          label="Total Members"
          value="354"
          sub="8 new this month"
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          color="#3b82f6" trend="2.3%" trendUp={true}
        />
        <StatCard
          label="Active Memberships"
          value="312"
          sub="88.1% retention rate"
          icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          color="#eab308" trend="1.8%" trendUp={true}
        />
        <StatCard
          label="Expiring Soon"
          value="18"
          sub="Within next 7 days"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="#f97316" trend="3 more" trendUp={false}
        />
        <StatCard
          label="Today's Revenue"
          value="₹12,500"
          sub="Target: ₹15,000"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="#a855f7" trend="18%" trendUp={true}
        />
        <StatCard
          label="Monthly Revenue"
          value="₹1,16,000"
          sub="vs ₹98,000 last month"
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          color="#06b6d4" trend="18.4%" trendUp={true}
        />
        <StatCard
          label="PT Clients"
          value="42"
          sub="6 sessions today"
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          color="#ec4899" trend="4%" trendUp={true}
        />
        <StatCard
          label="Today's Classes"
          value="4"
          sub="62 total enrollments"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="#14b8a6" trend="Full: 2/4" trendUp={true}
        />
      </div>

      {/* Charts row 1 */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card wide">
          <SectionTitle title="Revenue Overview" sub="Monthly revenue vs target (₹)" />
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={revenueData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }}
                labelStyle={{ color: "#e4e4e7" }}
                formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#eab308" fill="url(#revGrad)" strokeWidth={2.5} name="Revenue" />
              <Line type="monotone" dataKey="target" stroke="#71717a" strokeDasharray="4 4" strokeWidth={1.5} name="Target" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gender Ratio */}
        <div className="chart-card">
          <SectionTitle title="Gender Ratio" sub="Active member split" />
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                {genderData.map((_, i) => (
                  <Cell key={i} fill={GENDER_COLORS[i]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts row 2 */}
      <div className="charts-row">
        {/* Attendance Chart */}
        <div className="chart-card">
          <SectionTitle title="Weekly Attendance" sub="Check-ins by day" />
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={attendanceData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="day" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="checkins" fill="#eab308" radius={[4, 4, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth */}
        <div className="chart-card wide">
          <SectionTitle title="Membership Growth" sub="Total members over months" />
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={memberGrowthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} name="Members" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tables row */}
      <div className="tables-row">
        {/* Recent Members */}
        <div className="table-card">
          <div className="table-header">
            <SectionTitle title="Recent Members" />
            <button className="view-all">View all →</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Plan</th><th>Joined</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMembers.map((m, i) => (
                <tr key={i}>
                  <td>
                    <div className="member-cell">
                      <div className="member-avatar">{m.name.charAt(0)}</div>
                      {m.name}
                    </div>
                  </td>
                  <td>{m.plan}</td>
                  <td className="muted">{m.joined}</td>
                  <td><span className={`badge badge-${m.status.toLowerCase()}`}>{m.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Right column */}
        <div className="right-col">
          {/* Expiring Soon */}
          <div className="table-card">
            <div className="table-header">
              <SectionTitle title="Expiring Soon" sub="Renew reminders" />
            </div>
            <div className="expiry-list">
              {expiringMemberships.map((m, i) => (
                <div key={i} className="expiry-item">
                  <div className="member-cell">
                    <div className="member-avatar warn">{m.name.charAt(0)}</div>
                    <div>
                      <div className="expiry-name">{m.name}</div>
                      <div className="expiry-plan">{m.plan}</div>
                    </div>
                  </div>
                  <div className="expiry-days">{m.expiresIn}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Today's Classes */}
          <div className="table-card">
            <div className="table-header">
              <SectionTitle title="Today's Classes" />
            </div>
            <div className="classes-list">
              {todaysClasses.map((c, i) => (
                <div key={i} className="class-item">
                  <div className="class-info">
                    <div className="class-name">{c.name}</div>
                    <div className="class-meta">{c.time} · {c.trainer}</div>
                  </div>
                  <div className="class-slots">
                    <div className="slots-bar">
                      <div className="slots-fill" style={{ width: `${(c.enrolled / c.capacity) * 100}%`, background: c.enrolled === c.capacity ? "#f97316" : "#eab308" }} />
                    </div>
                    <span className="slots-text">{c.enrolled}/{c.capacity}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          padding: 28px 32px;
          max-width: 1400px;
          margin: 0 auto;
          display: flex;
          flex-direction: column;
          gap: 28px;
          font-family: 'Montserrat', sans-serif;
        }
        .dash-loading {
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          min-height: 100vh; gap: 16px; color: #71717a;
        }
        .dash-spinner {
          width: 40px; height: 40px;
          border: 3px solid rgba(234,179,8,0.2);
          border-top-color: #eab308;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .dash-header {
          display: flex; align-items: center; justify-content: space-between;
          flex-wrap: wrap; gap: 16px;
        }
        .dash-greeting { font-size: 22px; font-weight: 700; color: #f4f4f5; margin: 0 0 4px; }
        .dash-date { font-size: 13px; color: #71717a; margin: 0; }
        .dash-header-actions { display: flex; align-items: center; gap: 12px; }
        .search-box {
          display: flex; align-items: center; gap: 8px;
          background: rgba(39,39,42,0.6);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 10px; padding: 8px 14px;
          color: #52525b;
        }
        .search-box input {
          background: none; border: none; outline: none;
          color: #e4e4e7; font-size: 13px; font-family: inherit; width: 180px;
        }
        .search-box input::placeholder { color: #52525b; }
        .btn-primary {
          display: flex; align-items: center; gap: 8px;
          background: linear-gradient(135deg, #eab308, #d97706);
          border: none; border-radius: 10px;
          padding: 9px 16px;
          color: #09090b; font-size: 13px; font-weight: 700;
          cursor: pointer; font-family: inherit;
          transition: opacity 0.2s, transform 0.15s;
        }
        .btn-primary:hover { opacity: 0.9; transform: translateY(-1px); }

        /* Stat cards */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .stat-card {
          background: rgba(24,24,27,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px;
          display: flex; flex-direction: column; gap: 8px;
          transition: border-color 0.2s, transform 0.15s;
        }
        .stat-card:hover { border-color: rgba(255,255,255,0.12); transform: translateY(-2px); }
        .stat-top { display: flex; align-items: center; justify-content: space-between; }
        .stat-icon {
          width: 38px; height: 38px; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }
        .stat-trend {
          display: flex; align-items: center; gap: 3px;
          font-size: 11px; font-weight: 600; padding: 3px 8px;
          border-radius: 20px;
        }
        .stat-trend.up { background: rgba(34,197,94,0.1); color: #4ade80; }
        .stat-trend.down { background: rgba(249,115,22,0.1); color: #fb923c; }
        .stat-value { font-size: 26px; font-weight: 800; color: #f4f4f5; line-height: 1; }
        .stat-label { font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-sub { font-size: 11px; color: #52525b; }

        /* Charts */
        .charts-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .chart-card {
          background: rgba(24,24,27,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
        }
        .chart-card.wide { grid-column: span 1; }
        .section-title h2 { font-size: 15px; font-weight: 700; color: #e4e4e7; margin: 0 0 2px; }
        .section-title p { font-size: 12px; color: #71717a; margin: 0 0 16px; }

        /* Tables */
        .tables-row { display: grid; grid-template-columns: 1fr 380px; gap: 16px; align-items: start; }
        .table-card {
          background: rgba(24,24,27,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
        }
        .table-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 4px; }
        .view-all { background: none; border: none; color: #eab308; font-size: 12px; cursor: pointer; font-family: inherit; font-weight: 600; }
        .data-table { width: 100%; border-collapse: collapse; font-size: 13px; }
        .data-table th { text-align: left; padding: 10px 12px; color: #52525b; font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .data-table td { padding: 12px; color: #d4d4d8; border-bottom: 1px solid rgba(255,255,255,0.04); vertical-align: middle; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(255,255,255,0.02); }
        .member-cell { display: flex; align-items: center; gap: 10px; }
        .member-avatar {
          width: 30px; height: 30px; border-radius: 50%;
          background: linear-gradient(135deg, #eab308, #d97706);
          display: flex; align-items: center; justify-content: center;
          color: #09090b; font-size: 12px; font-weight: 700; flex-shrink: 0;
        }
        .member-avatar.warn { background: linear-gradient(135deg, #f97316, #dc2626); color: #fff; }
        .muted { color: #71717a !important; }
        .badge {
          display: inline-block; padding: 3px 10px; border-radius: 20px;
          font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em;
        }
        .badge-active { background: rgba(34,197,94,0.12); color: #4ade80; border: 1px solid rgba(34,197,94,0.2); }
        .badge-frozen { background: rgba(59,130,246,0.12); color: #60a5fa; border: 1px solid rgba(59,130,246,0.2); }
        .badge-trial { background: rgba(234,179,8,0.12); color: #eab308; border: 1px solid rgba(234,179,8,0.2); }

        /* Right column */
        .right-col { display: flex; flex-direction: column; gap: 16px; }
        .expiry-list { display: flex; flex-direction: column; gap: 4px; }
        .expiry-item { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid rgba(255,255,255,0.04); }
        .expiry-item:last-child { border-bottom: none; }
        .expiry-name { font-size: 13px; color: #e4e4e7; font-weight: 600; }
        .expiry-plan { font-size: 11px; color: #71717a; }
        .expiry-days { font-size: 12px; color: #f97316; font-weight: 700; white-space: nowrap; }

        /* Classes */
        .classes-list { display: flex; flex-direction: column; gap: 12px; margin-top: 4px; }
        .class-item { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
        .class-name { font-size: 13px; color: #e4e4e7; font-weight: 600; }
        .class-meta { font-size: 11px; color: #71717a; }
        .class-slots { display: flex; align-items: center; gap: 8px; flex-shrink: 0; }
        .slots-bar { width: 60px; height: 4px; background: rgba(255,255,255,0.08); border-radius: 2px; overflow: hidden; }
        .slots-fill { height: 100%; border-radius: 2px; transition: width 0.3s; }
        .slots-text { font-size: 11px; color: #71717a; white-space: nowrap; }

        @media (max-width: 1100px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
          .tables-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .dashboard { padding: 16px; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </div>
  );
}
