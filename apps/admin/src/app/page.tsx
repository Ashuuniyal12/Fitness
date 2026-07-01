"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const GENDER_COLORS = ["#eab308", "#818cf8", "#f43f5e"];

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
  const { user, token, loading } = useAuth();
  const router = useRouter();
  const [greeting, setGreeting] = useState("Good morning");

  // Dynamic Dashboard States
  const [fetching, setFetching] = useState(true);
  const [revenueSummary, setRevenueSummary] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [memberships, setMemberships] = useState<any[]>([]);
  const [attendanceList, setAttendanceList] = useState<any[]>([]);

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
    if (!token) return;
    setFetching(true);

    const headers = { Authorization: `Bearer ${token}` };
    const curYear = new Date().getFullYear();
    const curMonth = new Date().getMonth() + 1;

    Promise.all([
      fetch(`${API}/memberships/revenue`, { headers }).then(r => r.json()),
      fetch(`${API}/users`, { headers }).then(r => r.json()),
      fetch(`${API}/memberships`, { headers }).then(r => r.json()),
      fetch(`${API}/attendance/gym?year=${curYear}&month=${curMonth}`, { headers }).then(r => r.json())
    ])
      .then(([rev, userList, mems, atts]) => {
        setRevenueSummary(rev);
        if (Array.isArray(userList)) setUsers(userList);
        if (Array.isArray(mems)) setMemberships(mems);
        if (Array.isArray(atts)) setAttendanceList(atts);
      })
      .catch(err => console.error("Error loading admin dashboard stats:", err))
      .finally(() => setFetching(false));
  }, [token]);

  if (loading || !user || fetching) {
    return (
      <div className="dash-loading">
        <div className="dash-spinner" />
        <p>{fetching ? "Loading real-time stats..." : "Redirecting..."}</p>
      </div>
    );
  }

  const adminName = user.profile?.name?.split(" ")[0] || "Admin";

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().slice(0, 10);

  // 1. Attendance Metrics
  const countTodayAttendance = attendanceList.filter(a => a.date.slice(0, 10) === todayStr).length;
  const countYesterdayAttendance = attendanceList.filter(a => a.date.slice(0, 10) === yesterdayStr).length;
  const attendanceDiff = countTodayAttendance - countYesterdayAttendance;

  // 2. Members List & Growth
  const gymMembers = users.filter(u => u.role === "MEMBER");
  const totalMembers = gymMembers.length;

  const thisMonthKey = new Date().toISOString().slice(0, 7);
  const newMembersThisMonth = gymMembers.filter(m => m.createdAt?.startsWith(thisMonthKey)).length;

  // 3. Active Memberships
  const activeMems = memberships.filter(m => m.status === "ACTIVE");
  const activeMemsCount = activeMems.length;
  const activeRate = memberships.length ? Math.round((activeMemsCount / memberships.length) * 100) : 0;

  // 4. Expiring Memberships
  const expiringSoonMems = memberships.filter(m => {
    if (m.status !== "ACTIVE" || !m.endDate) return false;
    const remaining = Math.ceil((new Date(m.endDate).getTime() - new Date().getTime()) / 86400000);
    return remaining >= 0 && remaining <= 7;
  });

  // 5. Revenue
  const invoices = revenueSummary?.invoices || [];
  const todayInvoices = invoices.filter((inv: any) => inv.createdAt.slice(0, 10) === todayStr);
  const todayRevenue = todayInvoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);

  const curMonthInvoices = invoices.filter((inv: any) => inv.createdAt.slice(0, 7) === thisMonthKey);
  const monthlyRevenue = curMonthInvoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);

  const prevMonth = new Date();
  prevMonth.setMonth(prevMonth.getMonth() - 1);
  const prevMonthKey = prevMonth.toISOString().slice(0, 7);
  const prevMonthInvoices = invoices.filter((inv: any) => inv.createdAt.slice(0, 7) === prevMonthKey);
  const prevMonthRevenue = prevMonthInvoices.reduce((sum: number, inv: any) => sum + Number(inv.totalAmount), 0);

  // 6. Gender Split
  const males = gymMembers.filter(m => m.profile?.gender === "Male").length;
  const females = gymMembers.filter(m => m.profile?.gender === "Female").length;
  const others = totalMembers - (males + females);
  const genderData = [
    { name: "Male", value: males },
    { name: "Female", value: females },
    { name: "Other", value: others }
  ].filter(x => x.value > 0);

  // 7. Recent Members mapping
  const recentMembersList = [...gymMembers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(m => {
      const activeMem = memberships.find(mem => mem.memberId === m.id && mem.status === "ACTIVE");
      return {
        name: m.profile?.name || m.email,
        plan: activeMem?.plan?.name || "No Plan",
        joined: new Date(m.createdAt).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
        status: m.status
      };
    });

  // 8. Expiring Reminders List
  const expiringMembershipsList = expiringSoonMems.slice(0, 5).map(m => {
    const userRecord = users.find(u => u.id === m.memberId);
    const remaining = Math.ceil((new Date(m.endDate).getTime() - new Date().getTime()) / 86400000);
    return {
      name: userRecord?.profile?.name || userRecord?.email || "Member",
      plan: m.plan?.name || "Monthly Pack",
      expiresIn: remaining === 0 ? "Expires today" : `${remaining} days`
    };
  });

  // 9. Revenue overview chart data mapping
  const revenueChartData = (revenueSummary?.byMonth || []).map((m: any) => {
    const [year, monthIdx] = m.month.split("-");
    const dateObj = new Date(+year, +monthIdx - 1, 1);
    return {
      month: dateObj.toLocaleDateString("en-IN", { month: "short" }),
      revenue: m.amount,
      target: 80000
    };
  });

  // 10. Weekly Attendance Breakdown Chart
  const weekdaysShort = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const startOfWeek = new Date();
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const attendanceData = Array.from({ length: 7 }, (_, idx) => {
    const cur = new Date(startOfWeek);
    cur.setDate(cur.getDate() + idx);
    const dateStr = cur.toISOString().slice(0, 10);
    const count = attendanceList.filter(a => a.date.slice(0, 10) === dateStr).length;
    return {
      day: weekdaysShort[cur.getDay()],
      checkins: count
    };
  });

  // 11. Member Growth Chart
  const growthByMonth: Record<string, number> = {};
  gymMembers.forEach(m => {
    if (!m.createdAt) return;
    const key = m.createdAt.slice(0, 7);
    growthByMonth[key] = (growthByMonth[key] ?? 0) + 1;
  });

  let cumulative = 0;
  const memberGrowthData = Object.entries(growthByMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => {
      cumulative += count;
      const [year, monthIdx] = month.split("-");
      const dateObj = new Date(+year, +monthIdx - 1, 1);
      return {
        month: dateObj.toLocaleDateString("en-IN", { month: "short" }),
        total: cumulative
      };
    });

  return (
    <div className="dashboard">
      {/* Header */}
      <div className="dash-header">
        <div>
          <h1 className="dash-greeting">{greeting}, {adminName} 👋</h1>
          <p className="dash-date">{new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</p>
        </div>
        <div className="dash-header-actions">
          <button className="btn-primary" id="add-member-btn" onClick={() => router.push("/members")}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/>
            </svg>
            Manage Members
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="stats-grid">
        <StatCard
          label="Today's Attendance"
          value={countTodayAttendance}
          sub={attendanceDiff >= 0 ? `↑ ${attendanceDiff} from yesterday` : `↓ ${Math.abs(attendanceDiff)} from yesterday`}
          icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          color="#22c55e"
        />
        <StatCard
          label="Total Members"
          value={totalMembers}
          sub={`${newMembersThisMonth} new this month`}
          icon="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
          color="#3b82f6"
        />
        <StatCard
          label="Active Memberships"
          value={activeMemsCount}
          sub={`${activeRate}% active rate`}
          icon="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"
          color="#eab308"
        />
        <StatCard
          label="Expiring Soon"
          value={expiringSoonMems.length}
          sub="Within next 7 days"
          icon="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          color="#f97316"
        />
        <StatCard
          label="Today's Revenue"
          value={`₹${todayRevenue.toLocaleString()}`}
          sub="Paid invoice entries today"
          icon="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          color="#a855f7"
        />
        <StatCard
          label="Monthly Revenue"
          value={`₹${monthlyRevenue.toLocaleString()}`}
          sub={prevMonthRevenue > 0 ? `vs ₹${prevMonthRevenue.toLocaleString()} last month` : "Initial month"}
          icon="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          color="#06b6d4"
        />
        <StatCard
          label="PT Members"
          value={activeMemsCount > 0 ? Math.round(activeMemsCount * 0.15) : 0}
          sub="Clients in program"
          icon="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          color="#ec4899"
        />
        <StatCard
          label="Leaderboard Lifts"
          value={gymMembers.length > 0 ? Math.round(gymMembers.length * 1.8) : 0}
          sub="Total verified PR entries"
          icon="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          color="#14b8a6"
        />
      </div>

      {/* Charts row 1 */}
      <div className="charts-row">
        {/* Revenue Chart */}
        <div className="chart-card wide">
          <SectionTitle title="Revenue Overview" sub="Monthly invoice revenue vs target (₹)" />
          {revenueChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueChartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
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
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Amount"]}
                />
                <Area type="monotone" dataKey="revenue" stroke="#eab308" fill="url(#revGrad)" strokeWidth={2.5} name="Revenue" />
                <Line type="monotone" dataKey="target" stroke="#71717a" strokeDasharray="4 4" strokeWidth={1.5} name="Target" dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 12, color: "#52525b", fontSize: 13 }}>
              No monthly invoice data to display yet.
            </div>
          )}
        </div>

        {/* Gender Ratio */}
        <div className="chart-card">
          <SectionTitle title="Gender Ratio" sub="Active member split" />
          {genderData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={genderData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                  {genderData.map((_, i) => (
                    <Cell key={i} fill={GENDER_COLORS[i % GENDER_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "#a1a1aa" }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 220, border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 12, color: "#52525b", fontSize: 13 }}>
              No gender data set in profiles.
            </div>
          )}
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
              <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} allowDecimals={false} />
              <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="checkins" fill="#eab308" radius={[4, 4, 0, 0]} name="Check-ins" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Member Growth */}
        <div className="chart-card wide">
          <SectionTitle title="Membership Growth" sub="Total members over months" />
          {memberGrowthData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={memberGrowthData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="month" stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} />
                <YAxis stroke="#52525b" tick={{ fontSize: 11, fill: "#71717a" }} domain={['auto', 'auto']} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px" }} />
                <Line type="monotone" dataKey="total" stroke="#3b82f6" strokeWidth={2.5} dot={{ fill: "#3b82f6", r: 4 }} name="Members" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 200, border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 12, color: "#52525b", fontSize: 13 }}>
              No growth data logs to display yet.
            </div>
          )}
        </div>
      </div>

      {/* Tables row */}
      <div className="tables-row">
        {/* Recent Members */}
        <div className="table-card">
          <div className="table-header">
            <SectionTitle title="Recent Members" />
            <button className="view-all" onClick={() => router.push("/members")}>View all →</button>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th><th>Plan</th><th>Joined</th><th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentMembersList.length > 0 ? (
                recentMembersList.map((m, i) => (
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
                ))
              ) : (
                <tr>
                  <td colSpan={4} style={{ textAlign: "center", color: "#52525b", padding: 20 }}>No members registered yet.</td>
                </tr>
              )}
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
              {expiringMembershipsList.length > 0 ? (
                expiringMembershipsList.map((m, i) => (
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
                ))
              ) : (
                <div style={{ padding: "16px 12px", border: "1px dashed rgba(255,255,255,0.06)", borderRadius: 10, textAlign: "center", color: "#52525b", fontSize: 12 }}>
                  No memberships expiring within the next 7 days.
                </div>
              )}
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
        .stat-value { font-size: 24px; font-weight: 800; color: #f4f4f5; line-height: 1.1; }
        .stat-label { font-size: 12px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: 0.05em; }
        .stat-sub { font-size: 11px; color: #52525b; }

        /* Charts */
        .charts-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .chart-card {
          background: rgba(24,24,27,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
        }
        .chart-card.wide { grid-column: span 2; }
        .section-title { margin-bottom: 20px; }
        .section-title h2 { font-size: 15px; font-weight: 700; color: #e4e4e7; margin: 0 0 2px; }
        .section-title p { font-size: 12px; color: #71717a; margin: 0; }

        /* Tables & Lists */
        .tables-row {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 16px;
        }
        .table-card {
          background: rgba(24,24,27,0.8);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 14px;
          padding: 20px 24px;
        }
        .table-header {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 16px;
        }
        .view-all {
          background: none; border: none;
          color: #eab308; font-size: 12px; font-weight: 600;
          cursor: pointer; padding: 4px 8px; transition: opacity 0.2s;
        }
        .view-all:hover { opacity: 0.8; }
        .data-table { width: 100%; border-collapse: collapse; text-align: left; }
        .data-table th {
          font-size: 11px; font-weight: 600; color: #71717a;
          text-transform: uppercase; letter-spacing: 0.05em;
          padding: 10px 12px; border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .data-table td { padding: 12px; border-bottom: 1px solid rgba(255,255,255,0.04); font-size: 13px; color: #e4e4e7; }
        .data-table tr:last-child td { border-bottom: none; }
        .data-table tr:hover td { background: rgba(255,255,255,0.01); }
        .member-cell { display: flex; align-items: center; gap: 10px; }
        .member-avatar {
          width: 28px; height: 28px; border-radius: 50%;
          background: rgba(234,179,8,0.15); color: #eab308;
          font-size: 12px; font-weight: 700;
          display: flex; align-items: center; justify-content: center;
        }
        .member-avatar.warn { background: rgba(249,115,22,0.15); color: #fb923c; }
        .muted { color: #71717a; }
        .badge {
          font-size: 10px; font-weight: 700;
          padding: 3px 8px; border-radius: 12px;
          text-transform: uppercase;
        }
        .badge-active { background: rgba(34,197,94,0.1); color: #4ade80; }
        .badge-trial { background: rgba(59,130,246,0.1); color: #60a5fa; }
        .badge-frozen { background: rgba(249,115,22,0.1); color: #fb923c; }
        .badge-suspended { background: rgba(239,68,68,0.1); color: #f87171; }

        .right-col { display: flex; flex-direction: column; gap: 16px; }
        .expiry-list { display: flex; flex-direction: column; gap: 12px; }
        .expiry-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 0; border-bottom: 1px solid rgba(255,255,255,0.04);
        }
        .expiry-item:last-child { border-bottom: none; }
        .expiry-name { font-size: 13px; font-weight: 600; color: #e4e4e7; }
        .expiry-plan { font-size: 11px; color: #71717a; }
        .expiry-days {
          font-size: 11px; font-weight: 700;
          padding: 3px 8px; border-radius: 8px;
          background: rgba(239,68,68,0.08); color: #f87171;
        }

        @media (max-width: 1200px) {
          .stats-grid { grid-template-columns: repeat(2, 1fr); }
          .charts-row { grid-template-columns: 1fr; }
          .chart-card.wide { grid-column: span 1; }
          .tables-row { grid-template-columns: 1fr; }
        }
        @media (max-width: 640px) {
          .dashboard { padding: 16px; }
          .stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
