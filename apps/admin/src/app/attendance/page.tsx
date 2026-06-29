"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Member { id: string; email: string; profile?: { name: string } }
interface AttendanceRecord { userId: string; date: string }

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function isoDate(y: number, m: number, d: number) {
  return `${y}-${String(m).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}

function daysInMonth(y: number, m: number) {
  return new Date(y, m, 0).getDate();
}

export default function AttendancePage() {
  const { user, token } = useAuth();

  const today = new Date();
  const [year,  setYear]  = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);

  const [members,    setMembers]    = useState<Member[]>([]);
  const [records,    setRecords]    = useState<AttendanceRecord[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [toggling,   setToggling]   = useState<string | null>(null); // "userId|date"
  const [search,     setSearch]     = useState("");
  const [error,      setError]      = useState("");

  const headers     = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  // Build an attended-set for O(1) lookups: "userId|YYYY-MM-DD"
  const attendedSet = new Set(
    records.map(r => `${r.userId}|${r.date.slice(0, 10)}`)
  );

  const days = daysInMonth(year, month);
  const dayNumbers = Array.from({ length: days }, (_, i) => i + 1);

  // ── Data fetch ─────────────────────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!token) return;
    setLoading(true); setError("");
    try {
      const [usersRes, attRes] = await Promise.all([
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/attendance/gym?year=${year}&month=${month}`, { headers }),
      ]);
      const [usersData, attData] = await Promise.all([usersRes.json(), attRes.json()]);
      setMembers(Array.isArray(usersData) ? usersData.filter((u: any) => u.role === "MEMBER") : []);
      setRecords(Array.isArray(attData) ? attData : []);
    } catch { setError("Failed to load data"); }
    finally { setLoading(false); }
  }, [token, year, month]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggle = async (userId: string, date: string) => {
    const key = `${userId}|${date}`;
    if (toggling) return;
    setToggling(key);
    const present = attendedSet.has(key);
    try {
      if (present) {
        await fetch(`${API}/attendance/unmark`, {
          method: "DELETE", headers: jsonHeaders,
          body: JSON.stringify({ userId, date }),
        });
        setRecords(prev => prev.filter(r => !(r.userId === userId && r.date.slice(0,10) === date)));
      } else {
        const res = await fetch(`${API}/attendance/mark`, {
          method: "POST", headers: jsonHeaders,
          body: JSON.stringify({ userId, date }),
        });
        const data = await res.json();
        // Use the plain "YYYY-MM-DD" date string to guarantee key consistency
        if (res.ok) setRecords(prev => [...prev, { userId, date }]);
      }
    } catch { setError("Failed to update attendance"); }
    finally { setToggling(null); }
  };

  // ── Navigation ─────────────────────────────────────────────────────────────
  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
  };
  const isCurrentMonth = year === today.getFullYear() && month === today.getMonth() + 1;

  const filtered = members.filter(m =>
    (m.profile?.name ?? m.email).toLowerCase().includes(search.toLowerCase())
  );

  // Attendance % for top summary row
  const totalPossible = filtered.length * days;
  const totalPresent  = records.filter(r =>
    filtered.some(m => m.id === r.userId)
  ).length;
  const pct = totalPossible ? Math.round((totalPresent / totalPossible) * 100) : 0;

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>Attendance</h1>
          <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Click any cell to mark or unmark attendance</p>
        </div>
        {/* Month navigator */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <input
            style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 12px", color: "#fafafa", fontSize: 13, outline: "none", width: 180 }}
            placeholder="Search member…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <button onClick={prevMonth} style={navBtn}>‹</button>
          <span style={{ fontSize: 14, fontWeight: 600, color: "#fafafa", minWidth: 110, textAlign: "center" }}>
            {MONTHS[month - 1]} {year}
          </span>
          <button onClick={nextMonth} style={navBtn} disabled={isCurrentMonth}>›</button>
        </div>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Summary bar */}
      {!loading && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[
            { label: "Members", value: filtered.length.toString(), color: "#818cf8" },
            { label: "Present Days (total)", value: totalPresent.toString(), color: "#22c55e" },
            { label: "Attendance Rate", value: `${pct}%`, color: "#eab308" },
          ].map(s => (
            <div key={s.label} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "14px 20px", minWidth: 140 }}>
              <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: ".05em" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color, marginTop: 4 }}>{s.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Grid */}
      <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
        {loading ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#71717a" }}>Loading…</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "48px 0", textAlign: "center", color: "#52525b", fontSize: 14 }}>
            {search ? "No members match your search." : "No members found."}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ borderCollapse: "collapse", width: "max-content", minWidth: "100%" }}>
              <thead>
                <tr>
                  {/* Member column header */}
                  <th style={{ ...stickyCol, ...th, minWidth: 180, textAlign: "left" }}>Member</th>
                  {/* Day headers */}
                  {dayNumbers.map(d => {
                    const dow  = new Date(year, month - 1, d).getDay();
                    const isToday = isCurrentMonth && d === today.getDate();
                    const isSun = dow === 0;
                    const isSat = dow === 6;
                    return (
                      <th key={d} style={{
                        ...th, width: 36, minWidth: 36, textAlign: "center",
                        color: isToday ? "#eab308" : isSun || isSat ? "#52525b" : "#71717a",
                        background: isToday ? "rgba(234,179,8,.08)" : "#18181b",
                      }}>
                        <div style={{ fontSize: 10, lineHeight: 1 }}>{DAYS[dow]}</div>
                        <div style={{ fontSize: 12, fontWeight: 600, marginTop: 2 }}>{d}</div>
                      </th>
                    );
                  })}
                  {/* Month total */}
                  <th style={{ ...th, minWidth: 60, textAlign: "center", color: "#52525b" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m, i) => {
                  const memberTotal = dayNumbers.filter(d =>
                    attendedSet.has(`${m.id}|${isoDate(year, month, d)}`)
                  ).length;
                  return (
                    <tr key={m.id} style={{ background: i % 2 === 0 ? "transparent" : "rgba(255,255,255,.015)" }}>
                      {/* Member name */}
                      <td style={{ ...stickyCol, ...td, minWidth: 180 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: "50%", background: "#27272a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: 12, fontWeight: 700, color: "#818cf8", flexShrink: 0,
                          }}>
                            {(m.profile?.name ?? m.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontSize: 13, fontWeight: 500, color: "#d4d4d8", whiteSpace: "nowrap" }}>
                              {m.profile?.name ?? "—"}
                            </div>
                            <div style={{ fontSize: 11, color: "#52525b", whiteSpace: "nowrap" }}>{m.email}</div>
                          </div>
                        </div>
                      </td>
                      {/* Day cells */}
                      {dayNumbers.map(d => {
                        const date    = isoDate(year, month, d);
                        const key     = `${m.id}|${date}`;
                        const present = attendedSet.has(key);
                        const isFuture = new Date(date) > today;
                        const isToday  = isCurrentMonth && d === today.getDate();
                        const busy     = toggling === key;
                        return (
                          <td key={d} style={{ ...td, textAlign: "center", padding: "4px 3px" }}>
                            <button
                              disabled={isFuture || busy}
                              onClick={() => !isFuture && toggle(m.id, date)}
                              title={present ? `Mark absent (${date})` : `Mark present (${date})`}
                              style={{
                                width: 28, height: 28, borderRadius: 6, border: "none", cursor: isFuture ? "default" : "pointer",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background .15s",
                                background: busy
                                  ? "rgba(255,255,255,.05)"
                                  : present
                                    ? "rgba(34,197,94,.2)"
                                    : isFuture
                                      ? "transparent"
                                      : isToday
                                        ? "rgba(234,179,8,.06)"
                                        : "rgba(255,255,255,.03)",
                                // Present always wins the outline; today-but-absent gets amber ring
                                outline: present
                                  ? "1px solid rgba(34,197,94,.4)"
                                  : isToday
                                    ? "1px solid rgba(234,179,8,.3)"
                                    : "none",
                              }}
                            >
                              {busy ? (
                                <span style={{ fontSize: 10, color: "#71717a" }}>…</span>
                              ) : present ? (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                              ) : isFuture ? null : (
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.1)" }} />
                              )}
                            </button>
                          </td>
                        );
                      })}
                      {/* Total */}
                      <td style={{ ...td, textAlign: "center" }}>
                        <span style={{
                          fontSize: 12, fontWeight: 700,
                          color: memberTotal === 0 ? "#3f3f46" : memberTotal >= days * 0.8 ? "#22c55e" : memberTotal >= days * 0.5 ? "#eab308" : "#f87171",
                        }}>
                          {memberTotal}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
        {[
          { icon: <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>, label: "Present" },
          { icon: <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(255,255,255,.2)" }} />, label: "Absent / Not marked" },
          { icon: <div style={{ width: 12, height: 2, background: "rgba(255,255,255,.1)", borderRadius: 2 }} />, label: "Future date" },
        ].map(l => (
          <div key={l.label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#71717a" }}>
            <div style={{ width: 20, height: 20, display: "flex", alignItems: "center", justifyContent: "center" }}>{l.icon}</div>
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Style constants ─────────────────────────────────────────────────────────
const navBtn: React.CSSProperties = {
  background: "#27272a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8,
  color: "#a1a1aa", width: 32, height: 32, cursor: "pointer", fontSize: 16,
  display: "flex", alignItems: "center", justifyContent: "center",
};
const stickyCol: React.CSSProperties = {
  position: "sticky", left: 0, zIndex: 2, background: "#18181b",
  boxShadow: "2px 0 8px rgba(0,0,0,.4)",
};
const th: React.CSSProperties = {
  padding: "10px 6px", fontSize: 11, fontWeight: 600, color: "#71717a",
  borderBottom: "1px solid rgba(255,255,255,.06)", background: "#18181b",
  textTransform: "uppercase", letterSpacing: ".04em", whiteSpace: "nowrap",
};
const td: React.CSSProperties = {
  padding: "6px 6px", borderBottom: "1px solid rgba(255,255,255,.04)", verticalAlign: "middle",
};
