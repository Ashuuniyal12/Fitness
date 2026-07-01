"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface Member {
  id: string;
  email: string;
  role: string;
  status: "ACTIVE" | "FROZEN" | "SUSPENDED";
  gymId?: string;
  profile?: { name: string; phone?: string; photoUrl?: string; height?: number; weight?: number };
  createdAt?: string;
}

interface Gym {
  id: string;
  name: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "badge-active",
  FROZEN: "badge-frozen",
  SUSPENDED: "badge-suspended",
};

export default function MembersPage() {
  const { user, token } = useAuth();

  const [members, setMembers] = useState<Member[]>([]);
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [search, setSearch] = useState("");

  // Create form
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", gymId: "", height: "", weight: "" });

  // Edit state
  const [editMember, setEditMember] = useState<Member | null>(null);
  const [editForm, setEditForm] = useState({ name: "", phone: "", status: "ACTIVE" as Member["status"], gymId: "", height: "", weight: "" });
  const [editSubmitting, setEditSubmitting] = useState(false);

  const fetchMembers = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data: Member[] = await res.json();
      setMembers(data.filter((u) => u.role === "MEMBER"));
    } catch {
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
    if (token) {
      fetch(`${API}/gyms`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((data: Gym[]) => setGyms(data))
        .catch(() => setGyms([]));
    }
  }, [token]); // eslint-disable-line react-hooks/exhaustive-deps

  const openEdit = (m: Member) => {
    setEditMember(m);
    setEditForm({
      name: m.profile?.name || "",
      phone: m.profile?.phone || "",
      status: m.status || "ACTIVE",
      gymId: m.gymId || "",
      height: m.profile?.height != null ? String(m.profile.height) : "",
      weight: m.profile?.weight != null ? String(m.profile.weight) : "",
    });
    setError("");
    setSuccess("");
  };

  const closeEdit = () => {
    setEditMember(null);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editMember) return;
    setEditSubmitting(true);
    setError("");
    setSuccess("");

    try {
      // Update profile (name, phone, height, weight)
      const profileRes = await fetch(`${API}/users/${editMember.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: editForm.name,
          phone: editForm.phone,
          height: parseFloat(editForm.height),
          weight: parseFloat(editForm.weight),
        }),
      });

      // Update status
      const statusRes = await fetch(`${API}/users/${editMember.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: editForm.status }),
      });

      // Update gym assignment
      const gymRes = await fetch(`${API}/users/${editMember.id}/gym`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ gymId: editForm.gymId || null }),
      });

      if (!profileRes.ok || !statusRes.ok || !gymRes.ok) {
        const failed = [profileRes, statusRes, gymRes].find((r) => !r.ok)!;
        const data = await failed.json();
        setError(data.message || "Failed to update member");
      } else {
        setSuccess(`Member "${editForm.name}" updated successfully.`);
        closeEdit();
        await fetchMembers();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setEditSubmitting(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/auth/create-member`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phone: form.phone,
          password: form.password,
          gymId: form.gymId || undefined,
          height: parseFloat(form.height),
          weight: parseFloat(form.weight),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Failed to create member");
      } else {
        setSuccess(`Member "${form.name}" created successfully.`);
        setForm({ name: "", email: "", phone: "", password: "", gymId: "", height: "", weight: "" });
        setShowForm(false);
        await fetchMembers();
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = members.filter(
    (m) =>
      m.profile?.name?.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="page-wrapper">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Members</h1>
          <p className="page-sub">
            {user?.role === "SUPER_ADMIN"
              ? "All members across the platform"
              : "Members of your gym"}
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
          <button
            className="btn-primary"
            onClick={() => { setShowForm(true); setError(""); setSuccess(""); }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Member
          </button>
        )}
      </div>

      {/* Banners */}
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

      {/* Search */}
      <div className="search-bar">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="search-icon">
          <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          className="search-input"
          type="text"
          placeholder="Search by name or emailâ€¦"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Add Member Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add New Member</h2>
              <button className="modal-close" onClick={() => setShowForm(false)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="modal-sub">
              Create a member account. They will login using the email and password you set here.
            </p>
            <form onSubmit={handleCreate} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="e.g. Arjun Mehta"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="10-digit number"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    required
                    minLength={10}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Height (cm) *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 175"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Bodyweight (kg) *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70"
                    value={form.weight}
                    onChange={(e) => setForm({ ...form, weight: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Email Address *</label>
                <input
                  className="form-input"
                  type="email"
                  placeholder="member@gym.com"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-field">
                <label className="form-label">
                  Temporary Password *{" "}
                  <span className="label-hint">(share this with the member)</span>
                </label>
                <input
                  className="form-input"
                  type="password"
                  placeholder="Min. 8 characters"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  required
                  minLength={8}
                  autoComplete="new-password"
                />
              </div>
              {user?.role === "SUPER_ADMIN" && (
                <div className="form-field">
                  <label className="form-label">Assign Gym <span className="label-hint">(optional)</span></label>
                  <select
                    className="form-input"
                    value={form.gymId}
                    onChange={(e) => setForm({ ...form, gymId: e.target.value })}
                  >
                    <option value="">— No gym —</option>
                    {gyms.map((g) => (
                      <option key={g.id} value={g.id}>{g.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Creatingâ€¦" : "Create Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Member Modal */}
      {editMember && (
        <div className="modal-overlay" onClick={closeEdit}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Edit Member</h2>
              <button className="modal-close" onClick={closeEdit}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <p className="modal-sub">{editMember.email}</p>
            <form onSubmit={handleUpdate} className="modal-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Full Name *</label>
                  <input
                    className="form-input"
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    minLength={2}
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Phone *</label>
                  <input
                    className="form-input"
                    type="tel"
                    placeholder="10-digit number"
                    value={editForm.phone}
                    onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                    required
                    minLength={10}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-field">
                  <label className="form-label">Height (cm) *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 175"
                    value={editForm.height}
                    onChange={(e) => setEditForm({ ...editForm, height: e.target.value })}
                    required
                    min="1"
                  />
                </div>
                <div className="form-field">
                  <label className="form-label">Bodyweight (kg) *</label>
                  <input
                    className="form-input"
                    type="number"
                    step="0.1"
                    placeholder="e.g. 70"
                    value={editForm.weight}
                    onChange={(e) => setEditForm({ ...editForm, weight: e.target.value })}
                    required
                    min="1"
                  />
                </div>
              </div>
              <div className="form-field">
                <label className="form-label">Assign Gym</label>
                <select
                  className="form-input"
                  value={editForm.gymId}
                  onChange={(e) => setEditForm({ ...editForm, gymId: e.target.value })}
                >
                  <option value="">— No gym —</option>
                  {gyms.map((g) => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label className="form-label">Status</label>
                <div className="status-options">
                  {(["ACTIVE", "FROZEN", "SUSPENDED"] as const).map((s) => (
                    <label key={s} className={`status-pill ${editForm.status === s ? "selected-" + s.toLowerCase() : ""}`}>
                      <input
                        type="radio"
                        name="status"
                        value={s}
                        checked={editForm.status === s}
                        onChange={() => setEditForm({ ...editForm, status: s })}
                        style={{ display: "none" }}
                      />
                      {s === "ACTIVE" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      )}
                      {s === "FROZEN" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93L4.93 19.07"/>
                        </svg>
                      )}
                      {s === "SUSPENDED" && (
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <circle cx="12" cy="12" r="10"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/>
                        </svg>
                      )}
                      {s.charAt(0) + s.slice(1).toLowerCase()}
                    </label>
                  ))}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-ghost" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={editSubmitting}>
                  {editSubmitting ? "Savingâ€¦" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div className="card">
        {loading ? (
          <div className="empty-state">Loading membersâ€¦</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <p>{search ? "No members match your search." : 'No members yet. Click "Add Member" to get started.'}</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Gym</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td>
                      <div className="user-cell">
                        <div className="avatar">
                          {(m.profile?.name || m.email).charAt(0).toUpperCase()}
                        </div>
                        <span>{m.profile?.name || "—"}</span>
                      </div>
                    </td>
                    <td className="muted">{m.email}</td>
                    <td className="muted">{m.profile?.phone || "—"}</td>
                    <td className="muted">{m.gymId ? (gyms.find(g => g.id === m.gymId)?.name ?? "—") : "—"}</td>
                    <td>
                      <span className={`badge ${STATUS_STYLES[m.status] || "badge-active"}`}>
                        {m.status || "ACTIVE"}
                      </span>
                    </td>
                    <td>
                      {(user?.role === "ADMIN" || user?.role === "SUPER_ADMIN") && (
                        <button className="btn-edit" onClick={() => openEdit(m)} title="Edit member">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .page-wrapper { padding: 32px; max-width: 1100px; }
        .page-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 20px; gap: 16px; flex-wrap: wrap; }
        .page-title { font-size: 22px; font-weight: 700; color: #f4f4f5; margin: 0 0 4px; }
        .page-sub { font-size: 13px; color: #71717a; margin: 0; }
        .btn-primary { display: flex; align-items: center; gap: 8px; padding: 10px 18px; background: linear-gradient(135deg,#eab308,#d97706); border: none; border-radius: 10px; color: #09090b; font-size: 13px; font-weight: 700; cursor: pointer; transition: opacity .2s, transform .15s; white-space: nowrap; }
        .btn-primary:hover:not(:disabled) { opacity: .9; transform: translateY(-1px); }
        .btn-primary:disabled { opacity: .7; cursor: not-allowed; }
        .btn-ghost { padding: 10px 18px; background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; color: #a1a1aa; font-size: 13px; font-weight: 600; cursor: pointer; }
        .btn-ghost:hover { background: rgba(63,63,70,.8); }
        .btn-edit { display: inline-flex; align-items: center; gap: 6px; padding: 6px 12px; background: rgba(39,39,42,.9); border: 1px solid rgba(255,255,255,.1); border-radius: 8px; color: #a1a1aa; font-size: 12px; font-weight: 600; cursor: pointer; transition: all .15s; }
        .btn-edit:hover { background: rgba(234,179,8,.1); border-color: rgba(234,179,8,.4); color: #eab308; }
        .banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; border-radius: 10px; font-size: 13px; margin-bottom: 16px; }
        .banner.success { background: rgba(34,197,94,.1); border: 1px solid rgba(34,197,94,.3); color: #4ade80; }
        .banner.error { background: rgba(239,68,68,.1); border: 1px solid rgba(239,68,68,.3); color: #f87171; }
        .search-bar { position: relative; margin-bottom: 20px; max-width: 380px; }
        .search-icon { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #52525b; pointer-events: none; }
        .search-input { width: 100%; background: rgba(39,39,42,.8); border: 1px solid rgba(255,255,255,.08); border-radius: 10px; padding: 10px 14px 10px 38px; color: #f4f4f5; font-size: 13px; outline: none; box-sizing: border-box; transition: border-color .2s; }
        .search-input::placeholder { color: #52525b; }
        .search-input:focus { border-color: rgba(234,179,8,.4); }
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
        .status-options { display: flex; gap: 10px; }
        .status-pill { display: flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: 999px; font-size: 12px; font-weight: 600; cursor: pointer; border: 1.5px solid rgba(255,255,255,.08); color: #71717a; transition: all .15s; background: rgba(39,39,42,.6); }
        .status-pill:hover { border-color: rgba(255,255,255,.2); color: #d4d4d8; }
        .selected-active { background: rgba(34,197,94,.12); border-color: rgba(34,197,94,.5); color: #4ade80; }
        .selected-frozen { background: rgba(59,130,246,.12); border-color: rgba(59,130,246,.5); color: #60a5fa; }
        .selected-suspended { background: rgba(239,68,68,.12); border-color: rgba(239,68,68,.5); color: #f87171; }
        .table-container { overflow-x: auto; overflow-y: auto; max-height: calc(100vh - 220px); position: relative; }
        .card { background: rgba(24,24,27,.8); border: 1px solid rgba(255,255,255,.06); border-radius: 14px; overflow: hidden; }
        .table { width: 100%; border-collapse: separate; border-spacing: 0; min-width: 800px; }
        .table th { position: sticky; top: 0; background: #1c1c1f; z-index: 10; padding: 12px 16px; text-align: left; font-size: 11px; font-weight: 600; color: #71717a; text-transform: uppercase; letter-spacing: .05em; border-bottom: 1px solid rgba(255,255,255,.06); }
        .table td { padding: 14px 16px; font-size: 13px; color: #d4d4d8; border-bottom: 1px solid rgba(255,255,255,.04); }
        .table tr:last-child td { border-bottom: none; }
        .table tr:hover td { background: rgba(255,255,255,.02); }
        .user-cell { display: flex; align-items: center; gap: 10px; }
        .avatar { width: 32px; height: 32px; border-radius: 50%; background: linear-gradient(135deg,#6366f1,#8b5cf6); color: #fff; font-size: 13px; font-weight: 700; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .muted { color: #71717a; }
        .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; }
        .badge-active { background: rgba(34,197,94,.12); color: #4ade80; border: 1px solid rgba(34,197,94,.25); }
        .badge-frozen { background: rgba(59,130,246,.12); color: #60a5fa; border: 1px solid rgba(59,130,246,.25); }
        .badge-suspended { background: rgba(239,68,68,.12); color: #f87171; border: 1px solid rgba(239,68,68,.25); }
        .empty-state { display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 12px; padding: 60px 20px; color: #52525b; text-align: center; }
        .empty-state p { font-size: 14px; }
        @media (max-width: 600px) { .form-row { grid-template-columns: 1fr; } .page-wrapper { padding: 20px; } .status-options { flex-direction: column; } }
      `}</style>
    </div>
  );
}
