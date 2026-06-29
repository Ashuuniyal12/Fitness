"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Plan {
  id: string;
  gymId: string;
  name: string;
  description?: string;
  price: number | string;
  durationDays: number;
}

interface MembershipRecord {
  id: string;
  memberId: string;
  planId: string;
  startDate: string;
  endDate: string;
  status: "ACTIVE" | "EXPIRED" | "FROZEN" | "CANCELLED";
  plan: Plan;
  profile: {
    id: string;
    name: string;
    phone?: string;
    user: { id: string; email: string };
  };
  createdAt: string;
}

interface Member {
  id: string;
  email: string;
  profile?: { name: string; phone?: string };
}

interface Gym { id: string; name: string }

// ── Helpers ────────────────────────────────────────────────────────────────────

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "badge-active",
  EXPIRED: "badge-expired",
  FROZEN: "badge-frozen",
  CANCELLED: "badge-cancelled",
};

function daysLeft(endDate: string) {
  const diff = Math.ceil((new Date(endDate).getTime() - Date.now()) / 86400000);
  return diff;
}

function fmt(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MembershipsPage() {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<"memberships" | "plans">("memberships");

  // ── Data state ──
  const [plans, setPlans] = useState<Plan[]>([]);
  const [memberships, setMemberships] = useState<MembershipRecord[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);

  // ── UI state ──
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ── Plan modal ──
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [editPlan, setEditPlan] = useState<Plan | null>(null);
  const emptyPlan = { name: "", description: "", price: "", durationDays: "", gymId: "" };
  const [planForm, setPlanForm] = useState(emptyPlan);

  // ── Assign membership modal ──
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ memberId: "", planId: "", startDate: new Date().toISOString().slice(0, 10), gymId: "" });

  // ── Status update / renewal ──
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [renewingId, setRenewingId] = useState<string | null>(null);

  // ── Search ──
  const [search, setSearch] = useState("");

  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const [plansRes, membershipsRes, usersRes, gymsRes] = await Promise.all([
        fetch(`${API}/memberships/plans`, { headers }),
        fetch(`${API}/memberships`, { headers }),
        fetch(`${API}/users`, { headers }),
        fetch(`${API}/gyms`, { headers }),
      ]);
      const [plansData, membershipsData, usersData, gymsData] = await Promise.all([
        plansRes.json(), membershipsRes.json(), usersRes.json(), gymsRes.json(),
      ]);
      setPlans(Array.isArray(plansData) ? plansData : []);
      setMemberships(Array.isArray(membershipsData) ? membershipsData : []);
      setMembers(Array.isArray(usersData) ? usersData.filter((u: any) => u.role === "MEMBER") : []);
      setGyms(Array.isArray(gymsData) ? gymsData : []);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Plan CRUD ──────────────────────────────────────────────────────────────

  const openCreatePlan = () => {
    setEditPlan(null);
    setPlanForm(emptyPlan);
    setError(""); setSuccess("");
    setShowPlanForm(true);
  };

  const openEditPlan = (p: Plan) => {
    setEditPlan(p);
    setPlanForm({ name: p.name, description: p.description || "", price: String(p.price), durationDays: String(p.durationDays), gymId: p.gymId });
    setError(""); setSuccess("");
    setShowPlanForm(true);
  };

  const handlePlanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const body = {
        name: planForm.name,
        description: planForm.description || undefined,
        price: parseFloat(planForm.price),
        durationDays: parseInt(planForm.durationDays),
        gymId: planForm.gymId || undefined,
      };
      const url = editPlan ? `${API}/memberships/plans/${editPlan.id}` : `${API}/memberships/plans`;
      const method = editPlan ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to save plan"); return; }
      setSuccess(editPlan ? `Plan "${planForm.name}" updated.` : `Plan "${planForm.name}" created.`);
      setShowPlanForm(false);
      await fetchAll();
    } catch { setError("Network error."); }
    finally { setSubmitting(false); }
  };

  // ── Assign Membership ──────────────────────────────────────────────────────

  const openAssign = () => {
    setAssignForm({ memberId: "", planId: "", startDate: new Date().toISOString().slice(0, 10), gymId: "" });
    setError(""); setSuccess("");
    setShowAssign(true);
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const body = {
        memberId: assignForm.memberId,
        planId: assignForm.planId,
        startDate: assignForm.startDate,
        gymId: assignForm.gymId || undefined,
      };
      const res = await fetch(`${API}/memberships`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to assign membership"); return; }
      const memberName = members.find(m => m.id === assignForm.memberId)?.profile?.name || "Member";
      setSuccess(`Membership assigned to ${memberName} successfully.`);
      setShowAssign(false);
      await fetchAll();
    } catch { setError("Network error."); }
    finally { setSubmitting(false); }
  };

  // ── Status Update ──────────────────────────────────────────────────────────

  const handleStatusChange = async (id: string, status: MembershipRecord["status"]) => {
    setUpdatingId(id); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/memberships/${id}/status`, {
        method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ status }),
      });
      if (!res.ok) { const d = await res.json(); setError(d.message || "Failed to update status"); return; }
      setSuccess("Membership status updated.");
      await fetchAll();
    } catch { setError("Network error."); }
    finally { setUpdatingId(null); }
  };

  // ── Renewal ─────────────────────────────────────────────────────────────────

  const handleRenew = async (id: string, memberName: string) => {
    if (!confirm(`Renew membership for ${memberName}? This will create a new invoice.`)) return;
    setRenewingId(id); setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/memberships/${id}/renew`, { method: "POST", headers: jsonHeaders });
      const data = await res.json();
      if (!res.ok) { setError(data.message || "Failed to renew"); return; }
      setSuccess(`Membership renewed for ${memberName}. New invoice generated.`);
      await fetchAll();
    } catch { setError("Network error."); }
    finally { setRenewingId(null); }
  };

  // ── Derived ────────────────────────────────────────────────────────────────

  const selectedPlan = plans.find(p => p.id === assignForm.planId);
  const assignEndDate = selectedPlan
    ? new Date(new Date(assignForm.startDate).getTime() + selectedPlan.durationDays * 86400000).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
    : null;

  // Members who currently have an ACTIVE membership — exclude them from the assign dropdown
  const activeMemberIds = new Set(
    memberships.filter(m => m.status === "ACTIVE").map(m => m.memberId)
  );
  const assignableMembers = members.filter(m => !activeMemberIds.has(m.id));

  // Show only the latest membership record per member (renewals replace older rows)
  const latestPerMember = Object.values(
    memberships.reduce<Record<string, typeof memberships[0]>>((acc, m) => {
      const prev = acc[m.memberId];
      if (!prev || new Date(m.createdAt) > new Date(prev.createdAt)) {
        acc[m.memberId] = m;
      }
      return acc;
    }, {})
  );

  const filteredMemberships = latestPerMember.filter(m =>
    m.profile.name.toLowerCase().includes(search.toLowerCase()) ||
    m.profile.user.email.toLowerCase().includes(search.toLowerCase()) ||
    m.plan.name.toLowerCase().includes(search.toLowerCase()),
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Memberships</h1>
          <p className="page-sub">Manage plans and member subscriptions</p>
        </div>
        <div className="header-actions">
          {tab === "plans" && (
            <button className="btn-primary" onClick={openCreatePlan}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Add Plan
            </button>
          )}
          {tab === "memberships" && (
            <button className="btn-primary" onClick={openAssign}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Assign Membership
            </button>
          )}
        </div>
      </div>

      {/* Banners */}
      {success && (
        <div className="banner success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          {success}
        </div>
      )}
      {error && (
        <div className="banner error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === "memberships" ? "active" : ""}`} onClick={() => setTab("memberships")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
          Member Subscriptions
          {memberships.length > 0 && <span className="tab-count">{memberships.length}</span>}
        </button>
        <button className={`tab ${tab === "plans" ? "active" : ""}`} onClick={() => setTab("plans")}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          Plans
          {plans.length > 0 && <span className="tab-count">{plans.length}</span>}
        </button>
      </div>

      {/* ── MEMBERSHIPS TAB ─────────────────────────────────────────────────── */}
      {tab === "memberships" && (
        <>
          {/* Search */}
          <div className="search-bar">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input className="search-input" type="text" placeholder="Search by member, email or plan…" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="card">
            {loading ? (
              <div className="empty-state">Loading…</div>
            ) : filteredMemberships.length === 0 ? (
              <div className="empty-state">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="5" width="20" height="14" rx="2"/><line x1="2" y1="10" x2="22" y2="10"/></svg>
                <p>{search ? "No memberships match your search." : 'No memberships yet. Click "Assign Membership" to add one.'}</p>
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Plan</th>
                    <th>Start</th>
                    <th>Expiry</th>
                    <th>Days Left</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredMemberships.map(m => {
                    const days = daysLeft(m.endDate);
                    const isExpiring = m.status === "ACTIVE" && days <= 7 && days > 0;
                    const isExpired = days <= 0 && m.status === "ACTIVE";
                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="user-cell">
                            <div className="avatar">{m.profile.name.charAt(0).toUpperCase()}</div>
                            <div>
                              <div className="cell-name">{m.profile.name}</div>
                              <div className="cell-sub">{m.profile.user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="plan-cell">
                            <span className="plan-name">{m.plan.name}</span>
                            <span className="plan-price">₹{Number(m.plan.price).toLocaleString()}</span>
                          </div>
                        </td>
                        <td className="muted">{fmt(m.startDate)}</td>
                        <td className={isExpiring ? "text-warning" : isExpired ? "text-danger" : "muted"}>{fmt(m.endDate)}</td>
                        <td>
                          {m.status === "ACTIVE" ? (
                            <span className={`days-pill ${days <= 0 ? "expired" : days <= 7 ? "expiring" : "ok"}`}>
                              {days <= 0 ? "Expired" : `${days}d`}
                            </span>
                          ) : "—"}
                        </td>
                        <td>
                          <span className={`badge ${STATUS_BADGE[m.status] || "badge-active"}`}>{m.status}</span>
                        </td>
                        <td>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <select
                              className="status-select"
                              value={m.status}
                              disabled={updatingId === m.id || renewingId === m.id}
                              onChange={e => handleStatusChange(m.id, e.target.value as MembershipRecord["status"])}
                            >
                              <option value="ACTIVE">Active</option>
                              <option value="FROZEN">Frozen</option>
                              <option value="EXPIRED">Expired</option>
                              <option value="CANCELLED">Cancelled</option>
                            </select>
                            {(m.status === "EXPIRED" || m.status === "CANCELLED" || (m.status === "ACTIVE" && daysLeft(m.endDate) <= 7)) && (
                              <button
                                className="btn-renew"
                                disabled={renewingId === m.id}
                                onClick={() => handleRenew(m.id, m.profile.name)}
                                title="Renew membership"
                              >
                                {renewingId === m.id ? "…" : "Renew"}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* ── PLANS TAB ───────────────────────────────────────────────────────── */}
      {tab === "plans" && (
        <div className="plans-grid">
          {loading ? (
            <div className="empty-state">Loading…</div>
          ) : plans.length === 0 ? (
            <div className="empty-state">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
              <p>No plans yet. Click <strong>Add Plan</strong> to create one.</p>
            </div>
          ) : (
            plans.map(p => (
              <div key={p.id} className="plan-card">
                <div className="plan-card-top">
                  <span className="plan-duration-badge">{p.durationDays} days</span>
                  <button className="btn-edit" onClick={() => openEditPlan(p)}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    Edit
                  </button>
                </div>
                <h3 className="plan-card-name">{p.name}</h3>
                {p.description && <p className="plan-card-desc">{p.description}</p>}
                <div className="plan-card-price">₹{Number(p.price).toLocaleString()}</div>
                <div className="plan-card-meta">{p.durationDays} days · {gyms.find(g => g.id === p.gymId)?.name || "—"}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── PLAN MODAL ──────────────────────────────────────────────────────── */}
      {showPlanForm && (
        <div className="modal-overlay" onClick={() => setShowPlanForm(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editPlan ? "Edit Plan" : "New Membership Plan"}</h2>
              <button className="modal-close" onClick={() => setShowPlanForm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="modal-sub">{editPlan ? "Update plan details below." : "Define a new membership plan for your gym."}</p>
            <form onSubmit={handlePlanSubmit} className="modal-form">
              <div className="form-field">
                <label className="form-label">Plan Name *</label>
                <input className="form-input" type="text" placeholder="e.g. Monthly Core" value={planForm.name} onChange={e => setPlanForm({ ...planForm, name: e.target.value })} required minLength={2} />
              </div>
              <div className="form-field">
                <label className="form-label">Description</label>
                <input className="form-input" type="text" placeholder="Brief description (optional)" value={planForm.description} onChange={e => setPlanForm({ ...planForm, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Price (₹) *</label>
                  <input className="form-input" type="number" placeholder="2000" min={0} step="0.01" value={planForm.price} onChange={e => setPlanForm({ ...planForm, price: e.target.value })} required />
                </div>
                <div className="form-field">
                  <label className="form-label">Duration (days) *</label>
                  <input className="form-input" type="number" placeholder="30" min={1} value={planForm.durationDays} onChange={e => setPlanForm({ ...planForm, durationDays: e.target.value })} required />
                </div>
              </div>
              {user?.role === "SUPER_ADMIN" && (
                <div className="form-field">
                  <label className="form-label">Gym *</label>
                  <select className="form-input" value={planForm.gymId} onChange={e => setPlanForm({ ...planForm, gymId: e.target.value })} required>
                    <option value="">— Select gym —</option>
                    {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowPlanForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving…" : editPlan ? "Save Changes" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── ASSIGN MEMBERSHIP MODAL ─────────────────────────────────────────── */}
      {showAssign && (
        <div className="modal-overlay" onClick={() => setShowAssign(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Assign Membership</h2>
              <button className="modal-close" onClick={() => setShowAssign(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <p className="modal-sub">Select a member, choose a plan, and set the start date.</p>
            <form onSubmit={handleAssign} className="modal-form">
              <div className="form-field">
                <label className="form-label">Member *</label>
                <select className="form-input" value={assignForm.memberId} onChange={e => setAssignForm({ ...assignForm, memberId: e.target.value })} required>
                  <option value="">— Select member —</option>
                  {assignableMembers.map(m => (
                    <option key={m.id} value={m.id}>{m.profile?.name || m.email} {m.profile?.name ? `(${m.email})` : ""}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Membership Plan *</label>
                <select className="form-input" value={assignForm.planId} onChange={e => setAssignForm({ ...assignForm, planId: e.target.value })} required>
                  <option value="">— Select plan —</option>
                  {plans.map(p => (
                    <option key={p.id} value={p.id}>{p.name} — ₹{Number(p.price).toLocaleString()} / {p.durationDays} days</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Start Date *</label>
                <input className="form-input" type="date" value={assignForm.startDate} onChange={e => setAssignForm({ ...assignForm, startDate: e.target.value })} required />
              </div>
              {assignEndDate && (
                <div className="expiry-preview">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                  Membership expires on <strong>{assignEndDate}</strong> ({selectedPlan?.durationDays} days)
                </div>
              )}
              {user?.role === "SUPER_ADMIN" && (
                <div className="form-field">
                  <label className="form-label">Gym <span className="label-hint">(optional override)</span></label>
                  <select className="form-input" value={assignForm.gymId} onChange={e => setAssignForm({ ...assignForm, gymId: e.target.value })}>
                    <option value="">— Use member's gym —</option>
                    {gyms.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowAssign(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Assigning…" : "Assign Membership"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .page-wrapper { padding: 32px; max-width: 1200px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 22px; font-weight: 700; color: #f4f4f5; margin: 0 0 4px; }
        .page-sub { font-size: 13px; color: #71717a; margin: 0; }
        .header-actions { display: flex; gap: 10px; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg,#eab308,#d97706); border: none; border-radius: 10px; color: #09090b; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .15s; white-space: nowrap; }
        .btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .7; cursor: not-allowed; }
        .btn-ghost { padding: 10px 18px; background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #a1a1aa; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-ghost:hover { background: rgba(63,63,70,.8); }
        .btn-edit { display: inline-flex; align-items: center; gap: 5px; padding: 5px 10px; background: rgba(39,39,42,.9); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #a1a1aa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .btn-edit:hover { background: rgba(234,179,8,.1); border-color: rgba(234,179,8,.4); color: #eab308; }
        .banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .banner.success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #4ade80; }
        .banner.error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #f87171; }
        .tabs { display: flex; gap: 4px; margin-bottom: 20px; background: rgba(24,24,27,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 12px; padding: 4px; width: fit-content; }
        .tab { display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 9px; border: none; background: none; color: #71717a; font-size: 13px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .tab.active { background: rgba(234,179,8,.12); color: #eab308; }
        .tab-count { background: rgba(234,179,8,.2); color: #eab308; border-radius: 999px; padding: 1px 7px; font-size: 11px; font-weight: 700; }
        .search-bar { position: relative; margin-bottom: 16px; max-width: 380px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #52525b; pointer-events: none; }
        .search-input { width: 100%; background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 10px 14px 10px 38px; color: #f4f4f5; font-size: 13px; outline: none; box-sizing: border-box; }
        .search-input::placeholder { color: #52525b; }
        .search-input:focus { border-color: rgba(234,179,8,.4); }
        .card { background: rgba(24,24,27,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 14px; overflow: hidden; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid rgba(255,255,255,.06); }
        .table td { padding: 13px 16px; font-size: 13px; color: #d4d4d8; border-bottom: 1px solid rgba(255,255,255,.04); vertical-align: middle; }
        .table tr:last-child td { border-bottom: none; }
        .table tr:hover td { background: rgba(255,255,255,.02); }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 34px; height: 34px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .cell-name { font-size: 13px; font-weight: 600; color: #f4f4f5; }
        .cell-sub { font-size: 11px; color: #71717a; margin-top: 1px; }
        .plan-cell { display: flex; flex-direction: column; gap: 2px; }
        .plan-name { font-size: 13px; font-weight: 600; color: #f4f4f5; }
        .plan-price { font-size: 11px; color: #71717a; }
        .muted { color: #71717a; }
        .text-warning { color: #f59e0b; }
        .text-danger { color: #f87171; }
        .days-pill { display: inline-flex; padding: 2px 9px; border-radius: 999px; font-size: 11px; font-weight: 700; }
        .days-pill.ok { background: rgba(34,197,94,.1); color: #4ade80; }
        .days-pill.expiring { background: rgba(245,158,11,.12); color: #f59e0b; }
        .days-pill.expired { background: rgba(239,68,68,.12); color: #f87171; }
        .badge { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .badge-active { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.25); }
        .badge-expired { background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.25); }
        .badge-frozen { background: rgba(59,130,246,.12); color: #60a5fa; border: 1px solid rgba(59,130,246,.25); }
        .badge-cancelled { background: rgba(113,113,122,.12); color: #71717a; border: 1px solid rgba(113,113,122,.25); }
        .status-select { background: rgba(39,39,42,.9); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; padding: 5px 10px; color: #d4d4d8; font-size: 12px; cursor: pointer; outline: none; }
        .status-select:focus { border-color: rgba(234,179,8,.4); }
        .btn-renew { background: rgba(34,197,94,.12); border: 1px solid rgba(34,197,94,.3); color: #22c55e; border-radius: 7px; padding: 4px 10px; font-size: 11px; font-weight: 600; cursor: pointer; white-space: nowrap; transition: background .2s; }
        .btn-renew:hover { background: rgba(34,197,94,.2); }
        .btn-renew:disabled { opacity: .5; cursor: not-allowed; }
        .plans-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 16px; }
        .plan-card { background: rgba(24,24,27,.9); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: border-color .2s; }
        .plan-card:hover { border-color: rgba(234,179,8,.2); }
        .plan-card-top { display: flex; align-items: center; justify-content: space-between; }
        .plan-duration-badge { background: rgba(234,179,8,.1); color: #eab308; border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 700; }
        .plan-card-name { font-size: 16px; font-weight: 700; color: #f4f4f5; margin: 0; }
        .plan-card-desc { font-size: 12px; color: #71717a; margin: 0; }
        .plan-card-price { font-size: 22px; font-weight: 800; color: #eab308; }
        .plan-card-meta { font-size: 12px; color: #52525b; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #18181b; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 28px; width: 100%; max-width: 520px; box-shadow: 0 25px 60px rgba(0,0,0,.6); max-height: 90vh; overflow-y: auto; }
        .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .modal-header h2 { font-size: 18px; font-weight: 700; color: #f4f4f5; margin: 0; }
        .modal-close { background: none; border: none; color: #71717a; cursor: pointer; padding: 4px; border-radius: 6px; display: flex; }
        .modal-close:hover { color: #f4f4f5; }
        .modal-sub { font-size: 13px; color: #71717a; margin: 0 0 24px; }
        .modal-form { display: flex; flex-direction: column; gap: 16px; }
        .modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 4px; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .form-field { display: flex; flex-direction: column; gap: 6px; }
        .form-label { font-size: 12px; font-weight: 600; color: #a1a1aa; }
        .label-hint { font-weight: 400; color: #52525b; }
        .form-input { background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 11px 14px; color: #f4f4f5; font-size: 13px; outline: none; transition: border-color .2s; width: 100%; box-sizing: border-box; }
        .form-input::placeholder { color: #52525b; }
        .form-input:focus { border-color: rgba(234,179,8,.5); box-shadow: 0 0 0 3px rgba(234,179,8,.08); }
        .expiry-preview { display: flex; align-items: center; gap: 8px; padding: 12px 14px; background: rgba(234,179,8,.06); border: 1px solid rgba(234,179,8,.2); border-radius: 10px; font-size: 13px; color: #a1a1aa; }
        .expiry-preview strong { color: #eab308; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 70px 20px; color: #52525b; text-align: center; }
        .empty-state p { font-size: 14px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .page-wrapper { padding: 20px; } }
      `}</style>
    </div>
  );
}
