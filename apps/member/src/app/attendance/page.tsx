"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface AttendanceRecord { date: string }

const MONTHS  = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

function isoDate(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

// Build an array of all dates in the last 12 months (Sun-aligned weeks)
function buildCalendar() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Go back 11 months from start of current month
  const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);
  // Pad to the nearest Sunday before start
  const padded = new Date(start);
  padded.setDate(padded.getDate() - padded.getDay());

  const weeks: Date[][] = [];
  const cursor = new Date(padded);
  while (cursor <= today) {
    const week: Date[] = [];
    for (let i = 0; i < 7; i++) {
      week.push(new Date(cursor));
      cursor.setDate(cursor.getDate() + 1);
    }
    weeks.push(week);
  }
  return { weeks, start, today };
}

// Month label positions
function monthLabels(weeks: Date[][]) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, col) => {
    const m = week[0].getMonth();
    if (m !== lastMonth) {
      labels.push({ label: MONTHS[m], col });
      lastMonth = m;
    }
  });
  return labels;
}

function StatCard({ label, value, color = "#22c55e" }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "16px 20px", flex: 1, minWidth: 130 }}>
      <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color, marginTop: 6, lineHeight: 1 }}>{value}</div>
    </div>
  );
}

export default function AttendancePage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [records, setRecords]     = useState<AttendanceRecord[]>([]);
  const [fetching, setFetching]   = useState(true);
  const [error, setError]         = useState("");
  const [tooltip, setTooltip]     = useState<{ text: string; x: number; y: number } | null>(null);

  const [checkInCode, setCheckInCode] = useState("");
  const [checkingIn, setCheckingIn] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/attendance/history`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) {
          const parsed = data.map((r: any) => ({
            ...r,
            localDate: isoDate(new Date(r.date))
          }));
          setRecords(parsed);
        }
      })
      .catch(() => setError("Failed to load attendance"))
      .finally(() => setFetching(false));
  }, [token]);

  const { weeks, start, today } = buildCalendar();
  const attendedSet = new Set(records.map(r => (r as any).localDate));
  const mLabels = monthLabels(weeks);

  const isCheckedInToday = attendedSet.has(isoDate(today));

  const handleCheckInWithCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkInCode || checkInCode.trim().length !== 6 || !token) return;
    setCheckingIn(true);
    setError("");
    try {
      const res = await fetch(`${API}/attendance/checkin-code`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ code: checkInCode.trim().toUpperCase() }),
      });
      if (res.ok) {
        setCheckInCode("");
        // Reload history
        const newRes = await fetch(`${API}/attendance/history`, { headers: { Authorization: `Bearer ${token}` } });
        const data = await newRes.json();
        if (Array.isArray(data)) {
          const parsed = data.map((r: any) => ({
            ...r,
            localDate: isoDate(new Date(r.date))
          }));
          setRecords(parsed);
        }
      } else {
        const data = await res.json();
        setError(data.message || "Failed to mark attendance. Please check your code.");
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setCheckingIn(false);
    }
  };

  // Stats
  const totalDays = Math.ceil((today.getTime() - start.getTime()) / 86400000) + 1;
  const totalPresent = records.length;
  const currentYearMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
  const thisMonth = records.filter(r => (r as any).localDate.startsWith(currentYearMonth)).length;
  const streak = (() => {
    let s = 0;
    const d = new Date(today);
    while (attendedSet.has(isoDate(d))) { s++; d.setDate(d.getDate() - 1); }
    return s;
  })();

  // Cell color
  function cellColor(date: Date): string {
    const ds = isoDate(date);
    const isFuture = date > today;
    const isBeforeStart = date < start;
    if (isFuture || isBeforeStart) return "transparent";
    if (attendedSet.has(ds)) return "#22c55e";  // present — green
    // Only show red for past days (not today if not yet marked)
    const isPast = date < today;
    return isPast ? "rgba(239,68,68,.35)" : "rgba(255,255,255,.06)";
  }

  if (authLoading || fetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#71717a" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ padding: "28px 24px", maxWidth: 980 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>My Attendance</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Your gym visits over the last 12 months</p>
      </div>

      {/* Daily Code Check-In Card */}
      <div style={{
        background: isCheckedInToday ? "linear-gradient(135deg, #14532d 0%, #064e3b 100%)" : "linear-gradient(135deg, #18181b 0%, #1e1b4b 100%)",
        border: isCheckedInToday ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid rgba(129, 140, 248, 0.2)",
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        display: "flex",
        flexDirection: "column",
        gap: 16,
        boxShadow: "0 4px 15px rgba(0,0,0,0.25)"
      }}>
        {isCheckedInToday ? (
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              background: "rgba(34, 197, 94, 0.2)",
              borderRadius: "50%",
              width: 36,
              height: 36,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 18,
              color: "#4ade80",
              fontWeight: "bold"
            }}>
              ✓
            </div>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fafafa", margin: 0 }}>
                Checked In Today!
              </h2>
              <p style={{ fontSize: 12, color: "#a7f3d0", marginTop: 4 }}>
                Your gym visit for today has been successfully recorded. Time to crush your workout!
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckInWithCode} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "#fafafa", margin: 0 }}>
                Gym Check-In
              </h2>
              <p style={{ fontSize: 12, color: "#a1a1aa", marginTop: 4 }}>
                Enter the daily attendance code provided by the gym staff.
              </p>
            </div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
              <input
                maxLength={6}
                placeholder="ENTER CODE"
                value={checkInCode}
                onChange={e => setCheckInCode(e.target.value.toUpperCase())}
                style={{
                  background: "rgba(24, 24, 27, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#fafafa",
                  fontSize: 14,
                  fontWeight: 700,
                  letterSpacing: ".15em",
                  fontFamily: "monospace",
                  outline: "none",
                  textAlign: "center",
                  width: 140,
                  textTransform: "uppercase"
                }}
              />
              <button
                type="submit"
                disabled={checkingIn || checkInCode.trim().length !== 6}
                style={{
                  background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px 20px",
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: (checkingIn || checkInCode.trim().length !== 6) ? "not-allowed" : "pointer",
                  opacity: (checkingIn || checkInCode.trim().length !== 6) ? 0.6 : 1,
                  transition: "all 0.2s"
                }}
              >
                {checkingIn ? "Verifying..." : "Check In"}
              </button>
            </div>
          </form>
        )}
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: "flex", gap: 12, marginBottom: 28, flexWrap: "wrap" }}>
        <StatCard label="Total Visits" value={totalPresent} color="#22c55e" />
        <StatCard label="This Month" value={thisMonth} color="#818cf8" />
        <StatCard label="Current Streak" value={`${streak}d`} color="#eab308" />
        <StatCard
          label="Attendance Rate"
          value={`${totalDays ? Math.round((totalPresent / totalDays) * 100) : 0}%`}
          color="#f97316"
        />
      </div>

      {/* Heatmap */}
      <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 22px", overflowX: "auto" }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 14 }}>Activity Heatmap</div>

        {/* Relative wrapper for month labels + grid */}
        <div style={{ position: "relative", display: "inline-block", minWidth: "100%" }}>
          {/* Month labels row */}
          <div style={{ display: "flex", marginBottom: 4, height: 16, position: "relative" }}>
            {/* offset for weekday labels */}
            <div style={{ width: 28, flexShrink: 0 }} />
            <div style={{ position: "relative", flex: 1 }}>
              {mLabels.map(({ label, col }) => (
                <span key={`${label}-${col}`} style={{
                  position: "absolute", left: col * 14, fontSize: 10, color: "#71717a", whiteSpace: "nowrap",
                }}>
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: "flex", gap: 0 }}>
            {/* Weekday labels */}
            <div style={{ display: "flex", flexDirection: "column", gap: 2, marginRight: 4, paddingTop: 0 }}>
              {WEEKDAYS.map((d, i) => (
                <div key={d} style={{
                  height: 10, width: 24, fontSize: 9, color: i % 2 === 1 ? "#52525b" : "transparent",
                  lineHeight: "10px", textAlign: "right",
                }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Weeks grid */}
            <div style={{ display: "flex", gap: 2 }}>
              {weeks.map((week, wi) => (
                <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                  {week.map((date, di) => {
                    const ds = isoDate(date);
                    const isFuture = date > today;
                    const isBeforeStart = date < start;
                    const isVisible = !isFuture && !isBeforeStart;
                    const present = attendedSet.has(ds);
                    const isToday = ds === isoDate(today);
                    const bg = cellColor(date);

                    return (
                      <div
                        key={di}
                        style={{
                          width: 10, height: 10, borderRadius: 2,
                          background: bg,
                          border: isToday ? "1px solid #eab308" : "none",
                          cursor: isVisible ? "pointer" : "default",
                          transition: "transform .1s",
                          flexShrink: 0,
                        }}
                        onMouseEnter={isVisible ? (e) => {
                          const rect = (e.target as HTMLElement).getBoundingClientRect();
                          setTooltip({
                            text: `${ds} — ${present ? "✓ Present" : "✗ Absent"}`,
                            x: rect.left + window.scrollX,
                            y: rect.top + window.scrollY - 30,
                          });
                        } : undefined}
                        onMouseLeave={() => setTooltip(null)}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16, fontSize: 11, color: "#71717a", flexWrap: "wrap" }}>
          <span>Less</span>
          {["rgba(239,68,68,.35)", "rgba(255,255,255,.06)", "rgba(34,197,94,.4)", "rgba(34,197,94,.7)", "#22c55e"].map((bg, i) => (
            <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: bg }} />
          ))}
          <span>More</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginLeft: 16 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "rgba(239,68,68,.35)" }} />
            <span>Absent</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: 2, background: "#22c55e" }} />
            <span>Present</span>
          </div>
        </div>
      </div>

      {/* Monthly breakdown */}
      <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 22px", marginTop: 20 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 16 }}>Monthly Breakdown</div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {Array.from({ length: 12 }, (_, i) => {
            const d = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, "0");
            const key = `${y}-${m}`;
            const daysInM = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
            const count = records.filter(r => (r as any).localDate.startsWith(key)).length;
            const isThisMonth = key === currentYearMonth;
            const rate = Math.round((count / daysInM) * 100);
            return (
              <div key={key} style={{
                background: isThisMonth ? "rgba(34,197,94,.08)" : "rgba(255,255,255,.03)",
                border: `1px solid ${isThisMonth ? "rgba(34,197,94,.25)" : "rgba(255,255,255,.06)"}`,
                borderRadius: 10, padding: "12px 14px", minWidth: 90, textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#71717a" }}>{MONTHS[d.getMonth()]} {d.getFullYear()}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: count > 0 ? "#22c55e" : "#3f3f46", marginTop: 4 }}>{count}</div>
                <div style={{ fontSize: 10, color: "#52525b", marginTop: 2 }}>{rate}% rate</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tooltip portal */}
      {tooltip && (
        <div style={{
          position: "fixed", left: tooltip.x, top: tooltip.y,
          background: "#27272a", border: "1px solid rgba(255,255,255,.12)", borderRadius: 6,
          padding: "4px 10px", fontSize: 11, color: "#d4d4d8", pointerEvents: "none", zIndex: 9999,
          transform: "translateX(-50%)",
        }}>
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
