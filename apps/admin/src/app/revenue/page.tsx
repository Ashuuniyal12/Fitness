"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const API = "http://localhost:5000";

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
    <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "20px 22px" }}>
      <div style={{ fontSize: 12, color: "#71717a", textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: "#52525b", marginTop: 6 }}>{sub}</div>}
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
    <div style={{ padding: "32px 28px" }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
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
          {/* KPI Cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 28 }}>
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
            <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, padding: "22px 24px", marginBottom: 28 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#a1a1aa", marginBottom: 18 }}>Monthly Revenue</div>
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

          {/* Invoices Table */}
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
              <span style={{ fontSize: 14, fontWeight: 600, color: "#fafafa" }}>All Invoices</span>
              <input
                style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 12px", color: "#fafafa", fontSize: 13, outline: "none", width: 220 }}
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
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,.06)" }}>
                      {["Invoice #", "Member", "Subtotal", "Tax", "Total", "Method", "Date", "Status"].map(h => (
                        <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: ".05em", whiteSpace: "nowrap" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((inv) => {
                      const paid = inv.status === "PAID";
                      return (
                        <tr key={inv.id} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                          <td style={{ padding: "12px 14px", color: "#a1a1aa", fontWeight: 600 }}>{inv.invoiceNumber}</td>
                          <td style={{ padding: "12px 14px", color: "#d4d4d8" }}>{inv.profile?.name ?? "—"}</td>
                          <td style={{ padding: "12px 14px", color: "#a1a1aa" }}>₹{Number(inv.amount).toLocaleString()}</td>
                          <td style={{ padding: "12px 14px", color: "#71717a" }}>₹{Number(inv.taxAmount).toLocaleString()}</td>
                          <td style={{ padding: "12px 14px", color: "#fafafa", fontWeight: 700 }}>₹{Number(inv.totalAmount).toLocaleString()}</td>
                          <td style={{ padding: "12px 14px", color: "#a1a1aa" }}>{inv.payments[0]?.paymentMethod ?? "—"}</td>
                          <td style={{ padding: "12px 14px", color: "#71717a", whiteSpace: "nowrap" }}>{fmt(inv.createdAt)}</td>
                          <td style={{ padding: "12px 14px" }}>
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
    </div>
  );
}
