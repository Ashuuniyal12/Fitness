"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabase";

const API = "http://localhost:5000";

type Tab = "profile" | "password";

const GOALS = ["WEIGHT_LOSS", "MUSCLE_GAIN", "STRENGTH", "FITNESS"] as const;
const GENDERS = ["Male", "Female", "Other", "Prefer not to say"];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 12, fontWeight: 600, color: "#71717a", textTransform: "uppercase", letterSpacing: ".05em" }}>{label}</label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  background: "#27272a",
  border: "1px solid rgba(255,255,255,.1)",
  borderRadius: 8,
  padding: "9px 12px",
  color: "#fafafa",
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const selectStyle: React.CSSProperties = { ...inputStyle, appearance: "none" };

export default function AdminSettingsPage() {
  const { user, token, loading: authLoading, fetchBackendUser } = useAuth();
  const router = useRouter();

  const [tab, setTab] = useState<Tab>("profile");

  // ── Profile state ──────────────────────────────────────────────────────────
  const [name,             setName]             = useState("");
  const [phone,            setPhone]            = useState("");
  const [gender,           setGender]           = useState("");
  const [dob,              setDob]              = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");
  const [height,           setHeight]           = useState("");
  const [weight,           setWeight]           = useState("");
  const [goal,             setGoal]             = useState("");
  const [photoUrl,         setPhotoUrl]         = useState("");

  // ── Password state ─────────────────────────────────────────────────────────
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword,     setNewPassword]     = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw,          setShowPw]          = useState(false);

  // ── UI state ───────────────────────────────────────────────────────────────
  const [profileSaving, setProfileSaving] = useState(false);
  const [pwSaving,      setPwSaving]      = useState(false);
  const [profileMsg,    setProfileMsg]    = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg,         setPwMsg]         = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  // Populate form from user context
  useEffect(() => {
    if (!user) return;
    setName(user.profile?.name ?? "");
    setPhone(user.profile?.phone ?? "");
    setPhotoUrl(user.profile?.photoUrl ?? "");
  }, [user]);

  // Also fetch full profile for extra fields
  useEffect(() => {
    if (!user || !token) return;
    fetch(`${API}/users/${user.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        const p = data.profile;
        if (!p) return;
        setName(p.name ?? "");
        setPhone(p.phone ?? "");
        setGender(p.gender ?? "");
        setDob(p.dob ? p.dob.slice(0, 10) : "");
        setEmergencyContact(p.emergencyContact ?? "");
        setHeight(p.height != null ? String(p.height) : "");
        setWeight(p.weight != null ? String(p.weight) : "");
        setGoal(p.goal ?? "");
        setPhotoUrl(p.photoUrl ?? "");
      })
      .catch(() => {});
  }, [user, token]);

  // ── Save profile ───────────────────────────────────────────────────────────
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !token) return;
    setProfileSaving(true);
    setProfileMsg(null);
    try {
      const body: Record<string, any> = {};
      if (name)             body.name             = name;
      if (phone)            body.phone            = phone;
      if (gender)           body.gender           = gender;
      if (dob)              body.dob              = dob;
      if (emergencyContact) body.emergencyContact = emergencyContact;
      if (height)           body.height           = parseFloat(height);
      if (weight)           body.weight           = parseFloat(weight);
      if (goal)             body.goal             = goal;
      if (photoUrl)         body.photoUrl         = photoUrl;

      const res = await fetch(`${API}/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(await res.text());
      setProfileMsg({ ok: true, text: "Profile updated successfully." });
      // Refresh auth context
      await fetchBackendUser(user.id, token);
    } catch (err: any) {
      setProfileMsg({ ok: false, text: err.message || "Failed to update profile." });
    } finally {
      setProfileSaving(false);
    }
  }

  // ── Change password ────────────────────────────────────────────────────────
  async function changePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwMsg(null);
    if (newPassword !== confirmPassword) {
      setPwMsg({ ok: false, text: "New passwords do not match." });
      return;
    }
    if (newPassword.length < 8) {
      setPwMsg({ ok: false, text: "Password must be at least 8 characters." });
      return;
    }
    setPwSaving(true);
    try {
      // Verify current password by re-signing in
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email: user!.email,
        password: currentPassword,
      });
      if (signInErr) throw new Error("Current password is incorrect.");

      const { error: updateErr } = await supabase.auth.updateUser({ password: newPassword });
      if (updateErr) throw updateErr;

      setPwMsg({ ok: true, text: "Password changed successfully." });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwMsg({ ok: false, text: err.message || "Failed to change password." });
    } finally {
      setPwSaving(false);
    }
  }

  if (authLoading) return null;

  return (
    <div style={{ padding: "28px 24px", maxWidth: 720 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Manage your account details and security</p>
      </div>

      {/* Avatar row */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28, padding: "16px 20px", background: "#18181b", borderRadius: 12, border: "1px solid rgba(255,255,255,.07)" }}>
        <div style={{
          width: 56, height: 56, borderRadius: "50%", background: "#eab30820", border: "2px solid #eab308",
          display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", flexShrink: 0,
        }}>
          {photoUrl
            ? <img src={photoUrl} alt="avatar" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            : <span style={{ fontSize: 22, fontWeight: 700, color: "#eab308" }}>{name?.[0]?.toUpperCase() ?? "?"}</span>
          }
        </div>
        <div>
          <div style={{ fontWeight: 700, color: "#fafafa", fontSize: 15 }}>{name || "—"}</div>
          <div style={{ fontSize: 12, color: "#52525b", marginTop: 2 }}>{user?.email} · {user?.role?.replace("_", " ")}</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 2, marginBottom: 24, background: "#18181b", borderRadius: 10, padding: 4, width: "fit-content", border: "1px solid rgba(255,255,255,.06)" }}>
        {(["profile", "password"] as Tab[]).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: "7px 20px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, transition: "all .15s",
            background: tab === t ? "#eab308" : "transparent",
            color:      tab === t ? "#000"    : "#71717a",
          }}>{t === "profile" ? "Profile" : "Password"}</button>
        ))}
      </div>

      {/* ── Profile tab ─────────────────────────────────────────────────────── */}
      {tab === "profile" && (
        <form onSubmit={saveProfile}>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Full Name">
                <input style={inputStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name" required />
              </Field>
              <Field label="Phone">
                <input style={inputStyle} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+91 00000 00000" />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="Gender">
                <select style={selectStyle} value={gender} onChange={e => setGender(e.target.value)}>
                  <option value="">Select gender</option>
                  {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </Field>
              <Field label="Date of Birth">
                <input type="date" style={inputStyle} value={dob} onChange={e => setDob(e.target.value)} />
              </Field>
            </div>

            <Field label="Emergency Contact">
              <input style={inputStyle} value={emergencyContact} onChange={e => setEmergencyContact(e.target.value)} placeholder="Name & phone number" />
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }}>
              <Field label="Height (cm)">
                <input type="number" style={inputStyle} value={height} onChange={e => setHeight(e.target.value)} placeholder="175" min={1} />
              </Field>
              <Field label="Weight (kg)">
                <input type="number" style={inputStyle} value={weight} onChange={e => setWeight(e.target.value)} placeholder="70" min={1} />
              </Field>
              <Field label="Fitness Goal">
                <select style={selectStyle} value={goal} onChange={e => setGoal(e.target.value)}>
                  <option value="">Select goal</option>
                  {GOALS.map(g => <option key={g} value={g}>{g.replace("_", " ")}</option>)}
                </select>
              </Field>
            </div>

            <Field label="Profile Photo URL">
              <input style={inputStyle} value={photoUrl} onChange={e => setPhotoUrl(e.target.value)} placeholder="https://…" />
            </Field>

            {profileMsg && (
              <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: profileMsg.ok ? "#16a34a20" : "#dc262620", color: profileMsg.ok ? "#4ade80" : "#f87171", border: `1px solid ${profileMsg.ok ? "#4ade8040" : "#f8717140"}` }}>
                {profileMsg.text}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={profileSaving} style={{ padding: "9px 24px", borderRadius: 8, border: "none", cursor: profileSaving ? "not-allowed" : "pointer", background: profileSaving ? "#52525b" : "#eab308", color: "#000", fontWeight: 700, fontSize: 14 }}>
                {profileSaving ? "Saving…" : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* ── Password tab ─────────────────────────────────────────────────────── */}
      {tab === "password" && (
        <form onSubmit={changePassword}>
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, padding: "24px 20px", display: "flex", flexDirection: "column", gap: 20 }}>

            <div style={{ padding: "12px 16px", background: "#27272a", borderRadius: 8, border: "1px solid rgba(255,255,255,.06)", fontSize: 12, color: "#71717a" }}>
              For security, enter your current password before setting a new one.
            </div>

            <Field label="Current Password">
              <div style={{ position: "relative" }}>
                <input type={showPw ? "text" : "password"} style={{ ...inputStyle, paddingRight: 40 }} value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current password" required />
                <button type="button" onClick={() => setShowPw(!showPw)} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#52525b", padding: 0, fontSize: 12 }}>
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
            </Field>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <Field label="New Password">
                <input type={showPw ? "text" : "password"} style={inputStyle} value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 8 characters" required minLength={8} />
              </Field>
              <Field label="Confirm New Password">
                <input type={showPw ? "text" : "password"} style={inputStyle} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" required minLength={8} />
              </Field>
            </div>

            {/* Password strength indicator */}
            {newPassword && (
              <div>
                <div style={{ fontSize: 12, color: "#71717a", marginBottom: 6 }}>Password strength</div>
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { label: "8+ chars",  ok: newPassword.length >= 8 },
                    { label: "Uppercase", ok: /[A-Z]/.test(newPassword) },
                    { label: "Number",    ok: /[0-9]/.test(newPassword) },
                    { label: "Symbol",    ok: /[^A-Za-z0-9]/.test(newPassword) },
                  ].map(({ label, ok }) => (
                    <div key={label} style={{ flex: 1, textAlign: "center", padding: "4px 0", borderRadius: 4, fontSize: 11, fontWeight: 600, background: ok ? "#16a34a20" : "#27272a", color: ok ? "#4ade80" : "#52525b", border: `1px solid ${ok ? "#4ade8040" : "transparent"}` }}>
                      {ok ? "✓ " : ""}{label}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pwMsg && (
              <div style={{ padding: "10px 14px", borderRadius: 8, fontSize: 13, fontWeight: 500, background: pwMsg.ok ? "#16a34a20" : "#dc262620", color: pwMsg.ok ? "#4ade80" : "#f87171", border: `1px solid ${pwMsg.ok ? "#4ade8040" : "#f8717140"}` }}>
                {pwMsg.text}
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <button type="submit" disabled={pwSaving} style={{ padding: "9px 24px", borderRadius: 8, border: "none", cursor: pwSaving ? "not-allowed" : "pointer", background: pwSaving ? "#52525b" : "#eab308", color: "#000", fontWeight: 700, fontSize: 14 }}>
                {pwSaving ? "Updating…" : "Update Password"}
              </button>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
