"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

interface Invoice {
  id: string;
  invoiceNumber: string;
  amount: number | string;
  taxAmount: number | string;
  totalAmount: number | string;
  status: "PAID" | "PENDING" | "OVERDUE" | "REFUNDED";
  createdAt: string;
  profile: { name: string } | null;
  payments: { paymentMethod: string; status: string }[];
}

interface MonthBucket { month: string; amount: number }

interface RevenueSummary {
  totalRevenue: number;
  invoices: Invoice[];
  byMonth: MonthBucket[];
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function fmtMonth(m: string) {
  const [y, mo] = m.split("-");
  return new Date(+y, +mo - 1, 1).toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

function StatCard({ label, value, sub, color = "#eab308" }: { label: string; value: string; sub?: string; color?: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value" style={{ color }}>{value}</div>
      {sub && <div className="kpi-card-sub">{sub}</div>}
    </div>
  );
}

export default function RevenuePage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<RevenueSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const fetchRevenue = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/memberships/revenue`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) { setError(json.message || "Failed to load revenue"); return; }
      setData(json);
    } catch { setError("Network error"); }
    finally { setLoading(false); }
  }, [token]);

  useEffect(() => { fetchRevenue(); }, [fetchRevenue]);

  const invoices = data?.invoices ?? [];
  const byMonth = data?.byMonth ?? [];
  const maxMonth = Math.max(...byMonth.map(b => b.amount), 1);

  const filtered = invoices.filter(inv =>
    inv.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
    (inv.profile?.name ?? "").toLowerCase().includes(search.toLowerCase())
  );

  const thisMonth = (() => {
    const key = new Date().toISOString().slice(0, 7);
    return byMonth.find(b => b.month === key)?.amount ?? 0;
  })();

  return (
    <div className="revenue-page-container">
      {/* Header */}
      <div className="revenue-header">
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>Revenue</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Membership revenue, invoices, and monthly trends</p>
      </div>

      {error && (
        <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "10px 14px", color: "#f87171", marginBottom: 20, fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#71717a" }}>Loading…</div>
      ) : (
        <>
          {/* Top block */}
          <div className="revenue-top-container">
            {/* KPI Cards */}
            <div className="kpi-grid">
              <StatCard
                label="Total Revenue"
                value={`₹${(data?.totalRevenue ?? 0).toLocaleString("en-IN")}`}
                sub={`From ${invoices.length} invoice${invoices.length !== 1 ? "s" : ""}`}
              />
              <StatCard
                label="This Month"
                value={`₹${thisMonth.toLocaleString("en-IN")}`}
                sub={fmtMonth(new Date().toISOString().slice(0, 7))}
                color="#22c55e"
              />
              <StatCard
                label="Paid Invoices"
                value={invoices.filter(i => i.status === "PAID").length.toString()}
                sub="Collected"
                color="#818cf8"
              />
              <StatCard
                label="Avg. Invoice"
                value={invoices.length ? `₹${Math.round((data?.totalRevenue ?? 0) / invoices.length).toLocaleString("en-IN")}` : "—"}
                sub="Per membership"
                color="#f97316"
              />
            </div>

            {/* Monthly Bar Chart */}
            {byMonth.length > 0 && (
              <div className="chart-container">
                <div className="chart-title">Monthly Revenue</div>
                <div style={{ display: "flex", alignItems: "flex-end", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                  {byMonth.map((b) => {
                    const pct = (b.amount / maxMonth) * 100;
                    return (
                      <div key={b.month} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 52, flexShrink: 0 }}>
                        <div style={{ fontSize: 10, color: "#71717a", fontWeight: 600 }}>₹{(b.amount / 1000).toFixed(1)}k</div>
                        <div style={{ width: 36, height: 120, display: "flex", alignItems: "flex-end" }}>
                          <div style={{
                            width: "100%",
                            height: `${Math.max(pct, 4)}%`,
                            background: b.month === new Date().toISOString().slice(0, 7)
                              ? "linear-gradient(180deg, #eab308 0%, #ca8a04 100%)"
                              : "linear-gradient(180deg, #3f3f46 0%, #27272a 100%)",
                            borderRadius: "5px 5px 2px 2px",
                            transition: "height .4s ease",
                          }} />
                        </div>
                        <div style={{ fontSize: 10, color: "#71717a", textAlign: "center", whiteSpace: "nowrap" }}>{fmtMonth(b.month)}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Invoices Table Card */}
          <div className="revenue-table-card">
            <div className="table-header">
              <span className="table-title">All Invoices</span>
              <input
                className="table-search"
                placeholder="Search member or invoice…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {filtered.length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#52525b", fontSize: 14 }}>
                {search ? "No invoices match your search." : "No invoices yet."}
              </div>
            ) : (
              <div className="revenue-table-wrapper">
                <table className="revenue-table">
                  <thead>
                    <tr>
                      {["Invoice #", "Member", "Subtotal", "Tax", "Total", "Method", "Date", "Status"].map(h => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => {
                      const paid = inv.status === "PAID";
                      return (
                        <tr key={inv.id}>
                          <td style={{ color: "#a1a1aa", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                          <td style={{ color: "#d4d4d8" }}>{inv.profile?.name ?? "—"}</td>
                          <td style={{ color: "#a1a1aa" }}>₹{Number(inv.amount).toLocaleString()}</td>
                          <td style={{ color: "#71717a" }}>₹{Number(inv.taxAmount).toLocaleString()}</td>
                          <td style={{ color: "#fafafa", fontWeight: 700 }}>₹{Number(inv.totalAmount).toLocaleString()}</td>
                          <td style={{ color: "#a1a1aa" }}>{inv.payments[0]?.paymentMethod ?? "—"}</td>
                          <td style={{ color: "#71717a", whiteSpace: "nowrap" }}>{fmt(inv.createdAt)}</td>
                          <td>
                            <span style={{
                              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, whiteSpace: "nowrap",
                              background: paid ? "rgba(34,197,94,.12)" : "rgba(234,179,8,.12)",
                              color: paid ? "#22c55e" : "#eab308",
                              border: `1px solid ${paid ? "rgba(34,197,94,.3)" : "rgba(234,179,8,.3)"}`,
                            }}>{inv.status}</span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      <style>{`
        .revenue-page-container {
          padding: 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .revenue-header {
          margin-bottom: 8px;
        }
        .revenue-top-container {
          display: flex;
          flex-direction: column;
          gap: 28px;
        }
        .kpi-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 14px;
        }
        .kpi-card {
          background: #18181b;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 20px 22px;
        }
        .kpi-card-label {
          font-size: 12px;
          color: #71717a;
          text-transform: uppercase;
          letter-spacing: .05em;
          margin-bottom: 8px;
        }
        .kpi-card-value {
          font-size: 26px;
          font-weight: 700;
          line-height: 1;
        }
        .kpi-card-sub {
          font-size: 12px;
          color: #52525b;
          margin-top: 6px;
        }
        .chart-container {
          background: #18181b;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          padding: 22px 24px;
        }
        .chart-title {
          font-size: 13px;
          font-weight: 600;
          color: #a1a1aa;
          margin-bottom: 18px;
        }
        .revenue-table-card {
          background: #18181b;
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 14px;
          overflow: hidden;
        }
        .table-header {
          padding: 16px 20px;
          border-bottom: 1px solid rgba(255,255,255,.06);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
        }
        .table-title {
          font-size: 14px;
          font-weight: 600;
          color: #fafafa;
        }
        .table-search {
          background: #27272a;
          border: 1px solid rgba(255,255,255,.1);
          border-radius: 8px;
          padding: 7px 12px;
          color: #fafafa;
          font-size: 13px;
          outline: none;
          width: 220px;
        }
        .revenue-table-wrapper {
          overflow-x: auto;
          overflow-y: auto;
          max-height: 500px;
          position: relative;
        }
        .revenue-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          font-size: 13px;
          min-width: 900px;
        }
        .revenue-table th {
          position: sticky;
          top: 0;
          background: #18181b;
          z-index: 10;
          padding: 10px 14px;
          text-align: left;
          font-size: 11px;
          font-weight: 600;
          color: #52525b;
          text-transform: uppercase;
          letter-spacing: .05em;
          border-bottom: 1px solid rgba(255,255,255,.06);
          white-space: nowrap;
        }
        .revenue-table td {
          padding: 12px 14px;
          border-bottom: 1px solid rgba(255,255,255,.04);
        }

        @media (max-width: 768px) {
          .revenue-page-container {
            display: flex;
            flex-direction: column;
            height: calc(100vh - 64px);
            overflow: hidden;
            padding: 16px 12px !important;
            gap: 12px;
          }
          .revenue-header {
            margin-bottom: 4px;
          }
          .revenue-top-container {
            height: 33vh;
            min-height: 240px;
            overflow-y: auto;
            gap: 12px;
            flex-shrink: 0;
          }
          .kpi-grid {
            display: flex;
            overflow-x: auto;
            gap: 10px;
            padding-bottom: 8px;
            flex-shrink: 0;
          }
          .kpi-grid::-webkit-scrollbar {
            height: 4px;
          }
          .kpi-grid::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.1);
            border-radius: 2px;
          }
          .kpi-card {
            min-width: 165px;
            padding: 12px 14px;
            flex-shrink: 0;
          }
          .kpi-card-value {
            font-size: 20px;
          }
          .chart-container {
            padding: 14px;
            flex-shrink: 0;
          }
          .revenue-table-card {
            flex: 1;
            display: flex;
            flex-direction: column;
            overflow: hidden;
          }
          .revenue-table-wrapper {
            flex: 1;
            max-height: none;
            overflow-y: auto;
          }
        }
      `}</style>
    </div>
  );
}
