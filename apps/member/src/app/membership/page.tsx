"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Plan {
  id: string;
  name: string;
  description?: string;
  price: number | string;
  durationDays: number;
}

interface ActiveMembership {
  id: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "FROZEN" | "CANCELLED";
  plan: Plan;
}

interface MembershipHistory {
  id: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "FROZEN" | "CANCELLED";
  plan: Plan;
}

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  status: "PAID" | "PENDING" | "OVERDUE" | "REFUNDED";
  dueDate: string;
  createdAt: string;
  payments: { id: string; paymentMethod: string; status: string }[];
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function daysLeft(endDate: string) {
  return Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
}

function DaysLeftPill({ days }: { days: number }) {
  const color = days > 30 ? "#22c55e" : days > 7 ? "#eab308" : "#ef4444";
  const bg = days > 30 ? "rgba(34,197,94,.12)" : days > 7 ? "rgba(234,179,8,.12)" : "rgba(239,68,68,.12)";
  const label = days <= 0 ? "Expired" : `${days}d left`;
  return (
    <span style={{ background: bg, color, border: `1px solid ${color}33`, borderRadius: 20, padding: "3px 10px", fontSize: 12, fontWeight: 600 }}>
      {label}
    </span>
  );
}

export default function MembershipPage() {
  const { user, token, loading } = useAuth();
  const router = useRouter();

  const [active, setActive] = useState<ActiveMembership | null>(null);
  const [history, setHistory] = useState<MembershipHistory[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<"overview" | "invoices">("overview");

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  useEffect(() => {
    if (!token) return;
    const h = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch(`${API}/memberships/my`, { headers: h }).then((r) => r.json()),
      fetch(`${API}/memberships/my/invoices`, { headers: h }).then((r) => r.json()),
    ])
      .then(([mem, inv]) => {
        if (mem && !mem.message) {
          setActive(mem.active ?? null);
          setHistory(Array.isArray(mem.history) ? mem.history : []);
        }
        if (Array.isArray(inv)) setInvoices(inv);
      })
      .catch(() => setError("Failed to load membership data"))
      .finally(() => setFetching(false));
  }, [token]);

  if (loading || fetching) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#71717a" }}>
        Loading...
      </div>
    );
  }

  const days = active ? daysLeft(active.endDate) : 0;

  return (
    <div style={{ padding: "32px 28px", maxWidth: 860, margin: "0 auto" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>My Membership</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Your current plan, history, and invoices</p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "#18181b", borderRadius: 10, padding: 4, width: "fit-content" }}>
        {(["overview", "invoices"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 18px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 500,
            background: tab === t ? "#27272a" : "transparent",
            color: tab === t ? "#fafafa" : "#71717a",
            transition: "all .2s",
          }}>
            {t === "overview" ? "Overview" : `Invoices${invoices.length ? ` (${invoices.length})` : ""}`}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW TAB ── */}
      {tab === "overview" && (
        <>
          {/* Active Plan Card */}
          {active ? (
            <div style={{
              background: "linear-gradient(135deg, #1c1c1e 0%, #1a1a2e 100%)",
              border: "1px solid rgba(99,102,241,.3)",
              borderRadius: 16,
              padding: "28px 28px 24px",
              marginBottom: 28,
              position: "relative",
              overflow: "hidden",
            }}>
              {/* Glow accent */}
              <div style={{ position: "absolute", top: -40, right: -40, width: 140, height: 140, background: "rgba(99,102,241,.15)", borderRadius: "50%", filter: "blur(40px)", pointerEvents: "none" }} />

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8" strokeLinecap="round"><path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
                    <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 600, letterSpacing: ".05em", textTransform: "uppercase" }}>Active Plan</span>
                  </div>
                  <h2 style={{ fontSize: 26, fontWeight: 700, color: "#fafafa", margin: "0 0 6px" }}>{active.plan.name}</h2>
                  {active.plan.description && (
                    <p style={{ fontSize: 13, color: "#71717a", margin: "0 0 16px" }}>{active.plan.description}</p>
                  )}
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".05em" }}>Started</div>
                      <div style={{ fontSize: 14, color: "#a1a1aa", fontWeight: 500, marginTop: 2 }}>{fmt(active.startDate)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".05em" }}>Expires</div>
                      <div style={{ fontSize: 14, color: "#a1a1aa", fontWeight: 500, marginTop: 2 }}>{fmt(active.endDate)}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".05em" }}>Duration</div>
                      <div style={{ fontSize: 14, color: "#a1a1aa", fontWeight: 500, marginTop: 2 }}>{active.plan.durationDays} days</div>
                    </div>
                    <div>
                      <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".05em" }}>Price</div>
                      <div style={{ fontSize: 14, color: "#a1a1aa", fontWeight: 500, marginTop: 2 }}>₹{Number(active.plan.price).toLocaleString()}</div>
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 10 }}>
                  <DaysLeftPill days={days} />
                  {days > 0 && (
                    <div style={{ position: "relative", width: 56, height: 56 }}>
                      <svg width="56" height="56" viewBox="0 0 56 56">
                        <circle cx="28" cy="28" r="24" fill="none" stroke="rgba(255,255,255,.06)" strokeWidth="4"/>
                        <circle cx="28" cy="28" r="24" fill="none"
                          stroke={days > 30 ? "#22c55e" : days > 7 ? "#eab308" : "#ef4444"}
                          strokeWidth="4" strokeLinecap="round"
                          strokeDasharray={`${Math.min((days / active.plan.durationDays) * 150.8, 150.8)} 150.8`}
                          transform="rotate(-90 28 28)"
                        />
                      </svg>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#fafafa" }}>
                        {Math.round((days / active.plan.durationDays) * 100)}%
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar */}
              {days > 0 && (
                <div style={{ marginTop: 20 }}>
                  <div style={{ height: 4, background: "rgba(255,255,255,.06)", borderRadius: 4, overflow: "hidden" }}>
                    <div style={{
                      height: "100%",
                      width: `${Math.min((days / active.plan.durationDays) * 100, 100)}%`,
                      background: days > 30 ? "#22c55e" : days > 7 ? "#eab308" : "#ef4444",
                      borderRadius: 4,
                      transition: "width .5s ease",
                    }} />
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6, fontSize: 11, color: "#52525b" }}>
                    <span>{fmt(active.startDate)}</span>
                    <span>{fmt(active.endDate)}</span>
                  </div>
                </div>
              )}

              {days <= 0 && (
                <div style={{ marginTop: 16, padding: "10px 14px", background: "rgba(239,68,68,.08)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, fontSize: 13, color: "#f87171" }}>
                  Your membership has expired. Please contact the gym admin to renew.
                </div>
              )}
            </div>
          ) : (
            <div style={{
              background: "#18181b", border: "1px dashed rgba(255,255,255,.1)", borderRadius: 16,
              padding: "48px 28px", textAlign: "center", marginBottom: 28,
            }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3f3f46" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 12px" }}>
                <path d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/>
              </svg>
              <p style={{ color: "#52525b", fontSize: 14, margin: 0 }}>No active membership</p>
              <p style={{ color: "#3f3f46", fontSize: 12, marginTop: 4 }}>Contact your gym admin to get started</p>
            </div>
          )}

          {/* History */}
          {history.filter(m => m.id !== active?.id).length > 0 && (
            <div>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 12 }}>History</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {history.filter(m => m.id !== active?.id).map((m) => {
                  const statusColor: Record<string, string> = {
                    ACTIVE: "#22c55e", EXPIRED: "#71717a", FROZEN: "#3b82f6", CANCELLED: "#ef4444",
                  };
                  return (
                    <div key={m.id} style={{
                      background: "#18181b", border: "1px solid rgba(255,255,255,.06)", borderRadius: 10,
                      padding: "14px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                    }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#fafafa" }}>{m.plan.name}</div>
                        <div style={{ fontSize: 12, color: "#71717a", marginTop: 3 }}>{fmt(m.startDate)} → {fmt(m.endDate)}</div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa" }}>₹{Number(m.plan.price).toLocaleString()}</span>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 20,
                          background: `${statusColor[m.status]}22`, color: statusColor[m.status],
                          border: `1px solid ${statusColor[m.status]}44`,
                        }}>{m.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── INVOICES TAB ── */}
      {tab === "invoices" && (
        <div>
          {invoices.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#52525b" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" style={{ margin: "0 auto 12px" }}>
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              <p style={{ fontSize: 14, margin: 0 }}>No invoices yet</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {invoices.map((inv) => {
                const paid = inv.status === "PAID";
                return (
                  <div key={inv.id} style={{
                    background: "#18181b", border: "1px solid rgba(255,255,255,.06)", borderRadius: 12,
                    padding: "18px 20px",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>{inv.invoiceNumber}</span>
                          <span style={{
                            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
                            background: paid ? "rgba(34,197,94,.12)" : "rgba(234,179,8,.12)",
                            color: paid ? "#22c55e" : "#eab308",
                            border: `1px solid ${paid ? "rgba(34,197,94,.3)" : "rgba(234,179,8,.3)"}`,
                          }}>{inv.status}</span>
                        </div>
                        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                          <div>
                            <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".04em" }}>Subtotal</div>
                            <div style={{ fontSize: 13, color: "#a1a1aa", marginTop: 2 }}>₹{Number(inv.amount).toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".04em" }}>Tax (18%)</div>
                            <div style={{ fontSize: 13, color: "#a1a1aa", marginTop: 2 }}>₹{Number(inv.taxAmount).toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".04em" }}>Total</div>
                            <div style={{ fontSize: 14, color: "#fafafa", fontWeight: 700, marginTop: 2 }}>₹{Number(inv.totalAmount).toLocaleString()}</div>
                          </div>
                          <div>
                            <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".04em" }}>Date</div>
                            <div style={{ fontSize: 13, color: "#a1a1aa", marginTop: 2 }}>{fmt(inv.createdAt)}</div>
                          </div>
                          {inv.payments[0] && (
                            <div>
                              <div style={{ fontSize: 11, color: "#52525b", textTransform: "uppercase", letterSpacing: ".04em" }}>Method</div>
                              <div style={{ fontSize: 13, color: "#a1a1aa", marginTop: 2 }}>{inv.payments[0].paymentMethod}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 600px) { div[style*="padding: 32px"] { padding: 20px 16px !important; } }
      `}</style>
    </div>
  );
}
