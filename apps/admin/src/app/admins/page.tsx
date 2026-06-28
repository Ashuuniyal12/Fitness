"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface AdminUser {
  id: string;
  email: string;
  role: string;
  gymId?: string;
  profile?: { name: string; phone?: string };
  createdAt?: string;
}

interface Gym {
  id: string;
  name: string;
}

const API = "http://localhost:5000";

export default function AdminsPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    gymId: "",
  });

  // Only SUPER_ADMIN may access this page
  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") {
      router.replace("/");
    }
  }, [user, router]);

  // Fetch all admins
  useEffect(() => {
    if (!token || !user || user.role !== "SUPER_ADMIN") return;
    setLoadingAdmins(true);
    fetch(`${API}/users`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data: AdminUser[]) => {
        setAdmins(data.filter((u) => u.role === "ADMIN"));
      })
      .catch(() => setAdmins([]))
      .finally(() => setLoadingAdmins(false));
    // Fetch gyms for dropdown
    fetch(`${API}/gyms`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Gym[]) => setGyms(data))
      .catch(() => setGyms([]));
  }, [token, user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/create-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone || undefined,
          password: form.password,
          gymId: form.gymId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create admin");
      } else {
        setSuccess(`Admin "${form.name}" created successfully.`);
        setForm({ name: "", email: "", phone: "", password: "", gymId: "" });
        setShowForm(false);
        // Refresh list
        const r2 = await fetch(`${API}/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const all: AdminUser[] = await r2.json();
        setAdmins(all.filter((u) => u.role === "ADMIN"));
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== "SUPER_ADMIN") return null;

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Admin Management</h1>
          <p className="page-sub">Provision new gym admins and view existing ones</p>
        </div>
        <button className="btn-primary" onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Admin
        </button>
      </div>

      {/* Success / Error banners */}
      {success && (
        <div className="banner success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          {success}
        </div>
      )}
      {error && (
        <div className="banner error">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Create Admin Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Admin Account</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="modal-sub">The admin will receive their credentials via the details you enter below.</p>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Full Name *</label>
                  <input className="form-input" type="text" placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required minLength={2} />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input className="form-input" type="tel" placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Email Address *</label>
                <input className="form-input" type="email" placeholder="admin@gym.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-field">
                <label className="form-label">Temporary Password *</label>
                <input className="form-input" type="password" placeholder="Min. 8 characters" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" />
              </div>
              <div className="form-field">
                <label className="form-label">Assign Gym <span className="label-hint">(optional)</span></label>
                <select
                  className="form-input"
                  value={form.gymId}
                  onChange={e => setForm({ ...form, gymId: e.target.value })}
                >
                  <option value="">— Unassigned —</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Admin"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admins Table */}
      <div className="card">
        {loadingAdmins ? (
          <div className="empty-state">Loading admins…</div>
        ) : admins.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>No admins yet. Click <strong>Add Admin</strong> to get started.</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Gym ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>
                    <div className="user-cell">
                      <div className="avatar">{(a.profile?.name || a.email).charAt(0).toUpperCase()}</div>
                      <span>{a.profile?.name || "—"}</span>
                    </div>
                  </td>
                  <td className="muted">{a.email}</td>
                  <td className="muted">{a.profile?.phone || "—"}</td>
                  <td className="muted">{a.gymId ? (gyms.find(g => g.id === a.gymId)?.name ?? a.gymId.slice(0, 8) + "…") : "Unassigned"}</td>
                  <td><span className="badge active">ADMIN</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style>{`
        .page-wrapper { padding: 32px; max-width: 1100px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 22px; font-weight: 700; color: #f4f4f5; margin: 0 0 4px; }
        .page-sub { font-size: 13px; color: #71717a; margin: 0; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg, #eab308, #d97706); border: none; border-radius: 10px; color: #09090b; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .15s; white-space: nowrap; }
        .btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .7; cursor: not-allowed; }
        .btn-ghost { padding: 10px 18px; background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #a1a1aa; font-size: 13px; font-weight: 600; cursor: pointer; transition: background .2s; }
        .btn-ghost:hover { background: rgba(63,63,70,.8); }
        .banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
        .banner.success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #4ade80; }
        .banner.error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #f87171; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #18181b; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 28px; width: 100%; max-width: 540px; box-shadow: 0 25px 60px rgba(0,0,0,.6); }
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
        .form-input { background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 11px 14px; color: #f4f4f5; font-size: 13px; outline: none; transition: border-color .2s, box-shadow .2s; width: 100%; box-sizing: border-box; }
        .form-input::placeholder { color: #52525b; }
        .form-input:focus { border-color: rgba(234,179,8,.5); box-shadow: 0 0 0 3px rgba(234,179,8,.08); }
        .card { background: rgba(24,24,27,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 14px; overflow: hidden; }
        .table { width: 100%; border-collapse: collapse; }
        .table th { padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid rgba(255,255,255,.06); }
        .table td { padding: 14px 16px; font-size: 13px; color: #d4d4d8; border-bottom: 1px solid rgba(255,255,255,.04); }
        .table tr:last-child td { border-bottom: none; }
        .table tr:hover td { background: rgba(255,255,255,.02); }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#eab308,#d97706); color: #09090b; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .muted { color: #71717a; }
        .badge { display: inline-flex; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .badge.active { background: rgba(234,179,8,.15); color: #eab308; border: 1px solid rgba(234,179,8,.25); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: #52525b; text-align: center; }
        .empty-state p { font-size: 14px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .page-wrapper { padding: 20px; } }
      `}</style>
    </div>
  );
}
