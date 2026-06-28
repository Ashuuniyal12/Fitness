"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

interface Gym {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
  _count?: { users: number };
}

const API = "http://localhost:5000";

export default function GymsPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editGym, setEditGym] = useState<Gym | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emptyForm = { name: "", address: "", phone: "", email: "" };
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    if (user && user.role !== "SUPER_ADMIN") router.replace("/");
  }, [user, router]);

  const fetchGyms = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/gyms`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGyms(await res.json());
    } catch {
      setGyms([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token && user?.role === "SUPER_ADMIN") fetchGyms();
  }, [token, user]); // eslint-disable-line react-hooks/exhaustive-deps

  const openCreate = () => {
    setEditGym(null);
    setForm(emptyForm);
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const openEdit = (g: Gym) => {
    setEditGym(g);
    setForm({ name: g.name, address: g.address || "", phone: g.phone || "", email: g.email || "" });
    setError("");
    setSuccess("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditGym(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const url = editGym ? `${API}/gyms/${editGym.id}` : `${API}/gyms`;
      const method = editGym ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          name: form.name,
          address: form.address || undefined,
          phone: form.phone || undefined,
          email: form.email || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to save gym");
      } else {
        setSuccess(editGym ? `Gym "${form.name}" updated.` : `Gym "${form.name}" created successfully.`);
        closeForm();
        await fetchGyms();
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
      <div className="page-header">
        <div>
          <h1 className="page-title">Gyms</h1>
          <p className="page-sub">Manage gym locations on the platform</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Gym
        </button>
      </div>

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

      {/* Gym Form Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={closeForm}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editGym ? "Edit Gym" : "Add New Gym"}</h2>
              <button className="modal-close" onClick={closeForm}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="modal-sub">
              {editGym ? "Update gym details." : "Create a new gym location. Admins and members can be assigned to it."}
            </p>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-field">
                <label className="form-label">Gym Name *</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="e.g. Maximus Koramangala"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                  minLength={2}
                />
              </div>
              <div className="form-field">
                <label className="form-label">Address</label>
                <input
                  className="form-input"
                  type="text"
                  placeholder="123 MG Road, Bengaluru"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Email</label>
                  <input
                    className="form-input"
                    type="email"
                    placeholder="gym@maximus.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeForm}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? (editGym ? "Saving…" : "Creating…") : (editGym ? "Save Changes" : "Create Gym")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Gyms Grid */}
      {loading ? (
        <div className="empty-state">Loading gyms…</div>
      ) : gyms.length === 0 ? (
        <div className="empty-state">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <p>No gyms yet. Click <strong>Add Gym</strong> to create the first location.</p>
        </div>
      ) : (
        <div className="gym-grid">
          {gyms.map((g) => (
            <div key={g.id} className="gym-card">
              <div className="gym-card-top">
                <div className="gym-icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                    <polyline points="9 22 9 12 15 12 15 22"/>
                  </svg>
                </div>
                <button className="btn-edit" onClick={() => openEdit(g)} title="Edit gym">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>
              </div>
              <h3 className="gym-name">{g.name}</h3>
              {g.address && <p className="gym-meta">{g.address}</p>}
              <div className="gym-details">
                {g.phone && (
                  <span className="gym-detail">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 9.67a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.8a16 16 0 0 0 8.29 8.29l1.16-1.16a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {g.phone}
                  </span>
                )}
                {g.email && (
                  <span className="gym-detail">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {g.email}
                  </span>
                )}
              </div>
              <div className="gym-footer">
                <span className="gym-member-count">
                  {g._count?.users ?? 0} user{(g._count?.users ?? 0) !== 1 ? "s" : ""}
                </span>
                <span className="gym-id" title={g.id}>{g.id.slice(0, 8)}…</span>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .page-wrapper { padding: 32px; max-width: 1200px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 22px; font-weight: 700; color: #f4f4f5; margin: 0 0 4px; }
        .page-sub { font-size: 13px; color: #71717a; margin: 0; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg,#eab308,#d97706); border: none; border-radius: 10px; color: #09090b; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .15s; white-space: nowrap; }
        .btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .7; cursor: not-allowed; }
        .btn-ghost { padding: 10px 18px; background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #a1a1aa; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-ghost:hover { background: rgba(63,63,70,.8); }
        .btn-edit { display: inline-flex; align-items: center; gap: 6px; padding: 5px 10px; background: rgba(39,39,42,.9); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #a1a1aa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .btn-edit:hover { background: rgba(234,179,8,.1); border-color: rgba(234,179,8,.4); color: #eab308; }
        .banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 20px; }
        .banner.success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #4ade80; }
        .banner.error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #f87171; }
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,.7); z-index: 50; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .modal { background: #18181b; border: 1px solid rgba(255,255,255,.08); border-radius: 16px; padding: 28px; width: 100%; max-width: 520px; box-shadow: 0 25px 60px rgba(0,0,0,.6); }
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
        .form-input { background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 11px 14px; color: #f4f4f5; font-size: 13px; outline: none; transition: border-color .2s, box-shadow .2s; width: 100%; box-sizing: border-box; }
        .form-input::placeholder { color: #52525b; }
        .form-input:focus { border-color: rgba(234,179,8,.5); box-shadow: 0 0 0 3px rgba(234,179,8,.08); }
        .gym-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
        .gym-card { background: rgba(24,24,27,.9); border: 1px solid rgba(255,255,255,.07); border-radius: 14px; padding: 20px; display: flex; flex-direction: column; gap: 8px; transition: border-color .2s; }
        .gym-card:hover { border-color: rgba(234,179,8,.2); }
        .gym-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px; }
        .gym-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(234,179,8,.1); color: #eab308; display: flex; align-items: center; justify-content: center; }
        .gym-name { font-size: 16px; font-weight: 700; color: #f4f4f5; margin: 0; }
        .gym-meta { font-size: 12px; color: #71717a; margin: 0; }
        .gym-details { display: flex; flex-direction: column; gap: 4px; }
        .gym-detail { display: flex; align-items: center; gap: 6px; font-size: 12px; color: #71717a; }
        .gym-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 8px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,.05); }
        .gym-member-count { font-size: 12px; font-weight: 600; color: #a1a1aa; }
        .gym-id { font-size: 11px; color: #52525b; font-family: monospace; }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 80px 20px; color: #52525b; text-align: center; }
        .empty-state p { font-size: 14px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .page-wrapper { padding: 20px; } }
      `}</style>
    </div>
  );
}
