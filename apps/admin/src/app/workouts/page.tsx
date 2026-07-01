"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Category / Subcategory taxonomy ──────────────────────────────────────────
const CATEGORIES: Record<string, string[]> = {
  "Chest":               ["Upper Chest", "Middle Chest", "Lower Chest"],
  "Back":                ["Upper Back", "Middle Back", "Lower Back", "Lats", "Traps"],
  "Shoulders":           ["Front Delts", "Side Delts", "Rear Delts"],
  "Biceps":              ["Long Head", "Short Head", "Brachialis"],
  "Triceps":             ["Long Head", "Lateral Head", "Medial Head"],
  "Legs":                ["Quadriceps", "Hamstrings", "Glutes", "Calves", "Hip Flexors"],
  "Core":                ["Upper Abs", "Lower Abs", "Obliques", "Transverse Abdominis"],
  "Forearms":            ["Wrist Flexors", "Wrist Extensors", "Grip"],
  "Neck":                ["Front Neck", "Rear Neck"],
  "Full Body":           ["Push", "Pull", "Legs", "Compound", "Functional"],
  "Cardio":              ["Running", "Walking", "Cycling", "Rowing", "Elliptical", "Stair Climber", "Jump Rope", "HIIT"],
  "Functional Training": ["Balance", "Agility", "Coordination", "Mobility", "Stability"],
  "Yoga":                ["Beginner", "Intermediate", "Advanced", "Power Yoga", "Hatha Yoga", "Vinyasa Yoga", "Ashtanga Yoga", "Yin Yoga", "Meditation", "Pranayama"],
  "Zumba":               ["Beginner", "Intermediate", "Advanced", "Aqua Zumba", "Strong Nation"],
  "CrossFit":            ["Strength", "MetCon", "Gymnastics", "Olympic Lifting", "Endurance"],
  "HIIT":                ["Beginner", "Intermediate", "Advanced", "Tabata", "EMOM", "AMRAP"],
  "Pilates":             ["Mat Pilates", "Reformer Pilates", "Core Pilates"],
  "Stretching":          ["Dynamic Stretching", "Static Stretching", "Mobility", "Recovery"],
  "Rehabilitation":      ["Knee Rehab", "Shoulder Rehab", "Back Rehab", "Posture Correction", "Injury Recovery"],
};

const DIFFICULTIES = ["Beginner", "Intermediate", "Advanced", "Expert"];
const CAT_NAMES = Object.keys(CATEGORIES);

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string; // "Category|Subcategory"
  difficulty: string;
  instructions?: string;
  mediaUrl?: string;
  createdAt: string;
}

function parseExercise(e: Exercise) {
  const [category, subcategory] = e.muscleGroup.includes("|")
    ? e.muscleGroup.split("|")
    : [e.muscleGroup, ""];
  return { ...e, category, subcategory };
}

const DIFF_COLOR: Record<string, string> = {
  Beginner: "#22c55e", Intermediate: "#eab308", Advanced: "#f97316", Expert: "#ef4444",
};

const emptyForm = { name: "", category: CAT_NAMES[0], subcategory: CATEGORIES[CAT_NAMES[0]][0], difficulty: "Beginner", instructions: "", mediaUrl: "" };

export default function WorkoutsPage() {
  const { token } = useAuth();
  const [exercises,   setExercises]   = useState<ReturnType<typeof parseExercise>[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState("");
  const [success,     setSuccess]     = useState("");
  const [submitting,  setSubmitting]  = useState(false);
  const [showModal,   setShowModal]   = useState(false);
  const [editTarget,  setEditTarget]  = useState<ReturnType<typeof parseExercise> | null>(null);
  const [form,        setForm]        = useState(emptyForm);
  const [search,      setSearch]      = useState("");
  const [filterCat,   setFilterCat]   = useState("All");
  const [deletingId,  setDeletingId]  = useState<string | null>(null);

  // Tab State & PR Approval States
  const [activeTab, setActiveTab] = useState<"library" | "prs" | "leaderboard">("library");

  // Leaderboard States
  const [leaderboardExId, setLeaderboardExId] = useState("");
  const [leaderboardSearch, setLeaderboardSearch] = useState("");
  const [leaderboards, setLeaderboards] = useState<Record<string, any[]>>({
    Lightweight: [], Middleweight: [], Heavyweight: [], "Super Heavyweight": []
  });
  const [fetchingLeaderboard, setFetchingLeaderboard] = useState(false);
  const [activeBwCat, setActiveBwCat] = useState<string>("Middleweight");
  const [leaderboardDropdownOpen, setLeaderboardDropdownOpen] = useState(false);
  interface PendingPR {
    id: string;
    maxWeight: number;
    reps: number;
    bodyWeight?: number;
    status: string;
    createdAt: string;
    exercise: {
      name: string;
    };
    member: {
      profile?: {
        name: string;
      };
      email: string;
    };
  }
  const [pendingPrs, setPendingPrs] = useState<PendingPR[]>([]);
  const [loadingPrs, setLoadingPrs] = useState(false);

  const headers     = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchAll = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    const res  = await fetch(`${API}/exercises`, { headers });
    const data = await res.json();
    setExercises(Array.isArray(data) ? data.map(parseExercise) : []);
    setLoading(false);
  }, [token]);

  const fetchPendingPrs = useCallback(async () => {
    if (!token) return;
    setLoadingPrs(true);
    try {
      const res = await fetch(`${API}/workouts/prs/pending`, { headers });
      if (res.ok) {
        const data = await res.json();
        setPendingPrs(data);
      }
    } catch {
      setError("Failed to load pending PRs");
    } finally {
      setLoadingPrs(false);
    }
  }, [token]);

  useEffect(() => { 
    fetchAll(); 
  }, [fetchAll]);

  useEffect(() => {
    if (activeTab === "prs") {
      fetchPendingPrs();
    }
  }, [activeTab, fetchPendingPrs]);

  // Fetch Leaderboard for Selected Exercise
  useEffect(() => {
    if (activeTab === "leaderboard" && leaderboardExId && token) {
      setFetchingLeaderboard(true);
      fetch(`${API}/workouts/leaderboard?exerciseId=${leaderboardExId}`, { headers })
        .then(r => r.json())
        .then(data => {
          if (data && typeof data === "object") {
            setLeaderboards(data);
          }
        })
        .catch(() => setError("Failed to fetch leaderboard"))
        .finally(() => setFetchingLeaderboard(false));
    }
  }, [activeTab, leaderboardExId, token]);

  // Initialize Leaderboard Select when active
  useEffect(() => {
    if (activeTab === "leaderboard" && exercises.length > 0 && !leaderboardExId) {
      setLeaderboardExId(exercises[0].id);
    }
  }, [activeTab, exercises, leaderboardExId]);

  const handleVerifyPr = async (id: string, approve: boolean) => {
    try {
      setError(""); setSuccess("");
      const action = approve ? "approve" : "reject";
      const res = await fetch(`${API}/workouts/prs/${id}/${action}`, {
        method: "PATCH",
        headers,
      });
      if (res.ok) {
        setSuccess(`PR claim successfully ${approve ? "approved" : "rejected"}.`);
        setPendingPrs(prev => prev.filter(p => p.id !== id));
      } else {
        setError("Verification update failed");
      }
    } catch {
      setError("Verification update failed");
    }
  };

  // Keep subcategory in sync when category changes
  const setCategory = (cat: string) => {
    setForm(f => ({ ...f, category: cat, subcategory: CATEGORIES[cat]?.[0] ?? "" }));
  };

  const openCreate = () => {
    setEditTarget(null);
    setForm(emptyForm);
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const openEdit = (ex: ReturnType<typeof parseExercise>) => {
    setEditTarget(ex);
    setForm({ name: ex.name, category: ex.category, subcategory: ex.subcategory, difficulty: ex.difficulty, instructions: ex.instructions ?? "", mediaUrl: ex.mediaUrl ?? "" });
    setError(""); setSuccess("");
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required."); return; }
    setSubmitting(true); setError(""); setSuccess("");
    try {
      const body = JSON.stringify({ name: form.name.trim(), category: form.category, subcategory: form.subcategory, difficulty: form.difficulty, instructions: form.instructions || undefined, mediaUrl: form.mediaUrl || undefined });
      const url    = editTarget ? `${API}/exercises/${editTarget.id}` : `${API}/exercises`;
      const method = editTarget ? "PUT" : "POST";
      const res    = await fetch(url, { method, headers: jsonHeaders, body });
      const data   = await res.json();
      if (!res.ok) { setError(data.message || "Save failed"); return; }
      setSuccess(editTarget ? "Workout updated." : "Workout added.");
      setShowModal(false);
      await fetchAll();
    } catch { setError("Network error"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await fetch(`${API}/exercises/${id}`, { method: "DELETE", headers });
      setSuccess(`"${name}" deleted.`);
      setExercises(prev => prev.filter(e => e.id !== id));
    } catch { setError("Failed to delete"); }
    finally { setDeletingId(null); }
  };

  const filtered = exercises.filter(ex => {
    const matchesCat  = filterCat === "All" || ex.category === filterCat;
    const matchesSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase()) || ex.subcategory.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  // Group for display
  const grouped: Record<string, ReturnType<typeof parseExercise>[]> = {};
  for (const ex of filtered) {
    (grouped[ex.category] ??= []).push(ex);
  }

  return (
    <div style={{ padding: "28px 24px", display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>Workouts</h1>
          <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>
            {activeTab === "library" 
              ? `${exercises.length} exercise${exercises.length !== 1 ? "s" : ""} in library`
              : activeTab === "prs"
              ? `${pendingPrs.length} PR claim${pendingPrs.length !== 1 ? "s" : ""} pending approval`
              : "View the top Personal Records across all gym members"
            }
          </p>
        </div>
        {activeTab === "library" && (
          <button onClick={openCreate} style={{ background: "#eab308", border: "none", borderRadius: 9, padding: "9px 18px", color: "#000", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
            + Add Workout
          </button>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 16, borderBottom: "1px solid rgba(255,255,255,.07)" }}>
        <button
          onClick={() => setActiveTab("library")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "library" ? "2px solid #eab308" : "2px solid transparent",
            color: activeTab === "library" ? "#fafafa" : "#71717a",
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s"
          }}
        >
          Workout Library
        </button>
        <button
          onClick={() => setActiveTab("prs")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "prs" ? "2px solid #eab308" : "2px solid transparent",
            color: activeTab === "prs" ? "#fafafa" : "#71717a",
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 6
          }}
        >
          PR Verification
          {pendingPrs.length > 0 && (
            <span style={{
              background: "#ef4444",
              color: "#fff",
              borderRadius: "50%",
              padding: "1px 6px",
              fontSize: 10,
              fontWeight: 700
            }}>
              {pendingPrs.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("leaderboard")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "leaderboard" ? "2px solid #eab308" : "2px solid transparent",
            color: activeTab === "leaderboard" ? "#fafafa" : "#71717a",
            padding: "8px 16px",
            fontSize: 14,
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.15s"
          }}
        >
          PR Leaderboard
        </button>
      </div>

      {(error || success) && (
        <div style={{ background: error ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.1)", border: `1px solid ${error ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.3)"}`, borderRadius: 8, padding: "10px 14px", color: error ? "#f87171" : "#4ade80", fontSize: 13 }}>
          {error || success}
        </div>
      )}

      {/* Library View */}
      {activeTab === "library" && (
        <>
          {/* Filters */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
            <input
              style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 12px", color: "#fafafa", fontSize: 13, outline: "none", width: 220 }}
              placeholder="Search workouts…"
              value={search} onChange={e => setSearch(e.target.value)}
            />
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {["All", ...CAT_NAMES].map(cat => (
                <button key={cat} onClick={() => setFilterCat(cat)} style={{
                  padding: "5px 12px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", transition: "all .15s",
                  background: filterCat === cat ? "#eab308" : "transparent",
                  color:      filterCat === cat ? "#000"    : "#71717a",
                  borderColor:filterCat === cat ? "#eab308" : "rgba(255,255,255,.1)",
                }}>{cat}</button>
              ))}
            </div>
          </div>

          {/* Grouped table */}
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#71717a" }}>Loading…</div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#52525b", fontSize: 14 }}>
              {search || filterCat !== "All" ? "No workouts match your filters." : 'No workouts yet. Click "Add Workout" to begin.'}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {Object.entries(grouped).map(([cat, items]) => (
                <div key={cat} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
                  <div style={{ padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,.06)", display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>{cat}</span>
                    <span style={{ fontSize: 11, color: "#52525b", background: "rgba(255,255,255,.05)", borderRadius: 20, padding: "2px 8px" }}>{items.length}</span>
                  </div>
                  <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "400px" }}>
                    <table style={{ width: "100%", minWidth: "750px", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                      <thead>
                        <tr style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                          {["Name", "Subcategory", "Difficulty", "Instructions", ""].map(h => (
                            <th key={h} style={{ position: "sticky", top: 0, background: "#18181b", zIndex: 10, padding: "8px 16px", textAlign: "left", fontSize: 11, fontWeight: 600, color: "#52525b", textTransform: "uppercase", letterSpacing: ".05em" }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {items.map(ex => (
                          <tr key={ex.id} style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                            <td style={{ padding: "11px 16px", color: "#d4d4d8", fontWeight: 500 }}>{ex.name}</td>
                            <td style={{ padding: "11px 16px", color: "#71717a" }}>{ex.subcategory}</td>
                            <td style={{ padding: "11px 16px" }}>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: `${DIFF_COLOR[ex.difficulty]}1a`, color: DIFF_COLOR[ex.difficulty] ?? "#a1a1aa", border: `1px solid ${DIFF_COLOR[ex.difficulty]}44` }}>
                                {ex.difficulty}
                              </span>
                            </td>
                            <td style={{ padding: "11px 16px", color: "#52525b", maxWidth: 280, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                              {ex.instructions || "—"}
                            </td>
                            <td style={{ padding: "11px 16px" }}>
                              <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                                <button onClick={() => openEdit(ex)} style={{ background: "rgba(129,140,248,.12)", border: "1px solid rgba(129,140,248,.25)", color: "#818cf8", borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>Edit</button>
                                <button onClick={() => handleDelete(ex.id, ex.name)} disabled={deletingId === ex.id} style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", color: "#f87171", borderRadius: 7, padding: "4px 10px", fontSize: 12, cursor: "pointer" }}>
                                  {deletingId === ex.id ? "…" : "Delete"}
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* PR Approvals View */}
      {activeTab === "prs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {loadingPrs ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#71717a" }}>Loading pending claims…</div>
          ) : pendingPrs.length === 0 ? (
            <div style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "#18181b",
              borderRadius: 14,
              border: "1px dashed rgba(255,255,255,.07)",
              color: "#71717a",
              fontSize: 14
            }}>
              All caught up! No pending PR claims to verify.
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
              {pendingPrs.map(pr => (
                <div key={pr.id} style={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 16,
                  padding: 18,
                  display: "flex",
                  flexDirection: "column",
                  gap: 14,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                      <span style={{
                        fontSize: 11,
                        background: "rgba(234, 179, 8, 0.1)",
                        color: "#eab308",
                        fontWeight: 600,
                        padding: "2px 8px",
                        borderRadius: 20
                      }}>
                        {pr.exercise.name}
                      </span>
                      <h3 style={{ fontSize: 20, fontWeight: 850, color: "#fafafa", margin: "8px 0 2px 0" }}>
                        {pr.maxWeight} kg
                      </h3>
                      <span style={{ fontSize: 13, color: "#a1a1aa" }}>for {pr.reps} rep{pr.reps !== 1 ? 's' : ''}</span>
                    </div>
                    <span style={{ fontSize: 11, color: "#71717a" }}>
                      {new Date(pr.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", paddingTop: 12, display: "flex", flexDirection: "column", gap: 4 }}>
                    <div style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: ".05em" }}>Athlete</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#e4e4e7" }}>
                      {pr.member.profile?.name || "Gym Member"}
                    </div>
                    <div style={{ fontSize: 12, color: "#71717a" }}>
                      {pr.member.email}
                    </div>
                    {pr.bodyWeight && (
                      <div style={{ fontSize: 11, color: "#818cf8", marginTop: 4, fontWeight: 500 }}>
                        Bodyweight at lift: {pr.bodyWeight} kg
                      </div>
                    )}
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
                    <button
                      onClick={() => handleVerifyPr(pr.id, true)}
                      style={{
                        flex: 1,
                        background: "rgba(34, 197, 94, 0.1)",
                        border: "1px solid rgba(34, 197, 94, 0.3)",
                        borderRadius: 8,
                        padding: "8px 0",
                        color: "#4ade80",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleVerifyPr(pr.id, false)}
                      style={{
                        flex: 1,
                        background: "rgba(239, 68, 68, 0.1)",
                        border: "1px solid rgba(239, 68, 68, 0.3)",
                        borderRadius: 8,
                        padding: "8px 0",
                        color: "#f87171",
                        fontWeight: 600,
                        fontSize: 12,
                        cursor: "pointer",
                        transition: "all 0.15s"
                      }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GYM LEADERBOARD (ADMIN VIEW) */}
      {activeTab === "leaderboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Custom Search-Select Dropdown */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
            <label style={{ fontSize: 12, color: "#a1a1aa" }}>Select Exercise Leaderboard:</label>
            
            {/* Trigger Button */}
            <button
              type="button"
              onClick={() => setLeaderboardDropdownOpen(!leaderboardDropdownOpen)}
              style={{
                background: "#18181b",
                border: "1px solid rgba(255,255,255,.07)",
                borderRadius: 8,
                padding: "10px 14px",
                color: "#fafafa",
                fontSize: 14,
                textAlign: "left",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%"
              }}
            >
              <span>
                {exercises.find(ex => ex.id === leaderboardExId)?.name || "Select Exercise..."}
              </span>
              <span style={{ fontSize: 10, color: "#71717a" }}>▼</span>
            </button>

            {/* Dropdown Box */}
            {leaderboardDropdownOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "#1c1c1e",
                  border: "1px solid rgba(255,255,255,.1)",
                  borderRadius: 8,
                  marginTop: 6,
                  zIndex: 20,
                  boxShadow: "0 10px 25px rgba(0,0,0,.5)",
                  padding: 8,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8
                }}
              >
                {/* Search Bar inside Dropdown */}
                <input
                  autoFocus
                  placeholder="Type to search exercises..."
                  value={leaderboardSearch}
                  onChange={e => setLeaderboardSearch(e.target.value)}
                  style={{
                    background: "#27272a",
                    border: "1px solid rgba(255,255,255,.08)",
                    borderRadius: 6,
                    padding: "8px 10px",
                    color: "#fafafa",
                    fontSize: 13,
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box"
                  }}
                />

                {/* Option Items List */}
                <div
                  style={{
                    maxHeight: 200,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: 2
                  }}
                >
                  {exercises
                    .filter(ex => ex.name.toLowerCase().includes(leaderboardSearch.toLowerCase()))
                    .map(ex => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          setLeaderboardExId(ex.id);
                          setLeaderboardDropdownOpen(false);
                          setLeaderboardSearch("");
                        }}
                        style={{
                          background: leaderboardExId === ex.id ? "rgba(234,179,8,.1)" : "transparent",
                          color: leaderboardExId === ex.id ? "#eab308" : "#fafafa",
                          border: "none",
                          borderRadius: 6,
                          padding: "8px 10px",
                          textAlign: "left",
                          fontSize: 13,
                          cursor: "pointer",
                          transition: "background 0.1s"
                        }}
                        onMouseEnter={e => {
                          if (leaderboardExId !== ex.id) e.currentTarget.style.background = "rgba(255,255,255,.03)";
                        }}
                        onMouseLeave={e => {
                          if (leaderboardExId !== ex.id) e.currentTarget.style.background = "transparent";
                        }}
                      >
                        {ex.name}
                      </button>
                    ))}
                  {exercises.filter(ex => ex.name.toLowerCase().includes(leaderboardSearch.toLowerCase())).length === 0 && (
                    <div style={{ padding: "12px 10px", color: "#52525b", fontSize: 13, textAlign: "center" }}>
                      No matching exercises found
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Body Weight Category Tabs */}
          <div style={{ display: "flex", gap: 4, overflowX: "auto", paddingBottom: 4 }}>
            {[
              { id: "Lightweight", label: "Lightweight (≤ 60 kg)" },
              { id: "Middleweight", label: "Middleweight (61 - 75 kg)" },
              { id: "Heavyweight", label: "Heavyweight (76 - 90 kg)" },
              { id: "Super Heavyweight", label: "Super Heavyweight (> 90 kg)" }
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveBwCat(cat.id)}
                style={{
                  background: activeBwCat === cat.id ? "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)" : "rgba(255,255,255,.04)",
                  color: activeBwCat === cat.id ? "#fff" : "#a1a1aa",
                  border: activeBwCat === cat.id ? "none" : "1px solid rgba(255,255,255,.08)",
                  borderRadius: 20,
                  padding: "6px 14px",
                  fontSize: 11,
                  fontWeight: 600,
                  cursor: "pointer",
                  flexShrink: 0
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Ranks list */}
          <div style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 14, overflow: "hidden" }}>
            {fetchingLeaderboard ? (
              <div style={{ textAlign: "center", padding: "48px 0", color: "#71717a" }}>Loading rankings…</div>
            ) : !leaderboards[activeBwCat] || leaderboards[activeBwCat].length === 0 ? (
              <div style={{ textAlign: "center", padding: "48px 20px", color: "#52525b", fontSize: 13 }}>
                No verified PRs in this weight class yet.
              </div>
            ) : (
              <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "400px" }}>
                <table style={{ width: "100%", minWidth: "750px", borderCollapse: "separate", borderSpacing: 0, fontSize: 13 }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.02)" }}>
                      <th style={{ position: "sticky", top: 0, background: "#18181b", zIndex: 10, padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Rank</th>
                      <th style={{ position: "sticky", top: 0, background: "#18181b", zIndex: 10, padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Athlete</th>
                      <th style={{ position: "sticky", top: 0, background: "#18181b", zIndex: 10, padding: "10px 16px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Weight Lifted</th>
                      <th style={{ position: "sticky", top: 0, background: "#18181b", zIndex: 10, padding: "10px 16px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Reps</th>
                      <th style={{ position: "sticky", top: 0, background: "#18181b", zIndex: 10, padding: "10px 16px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboards[activeBwCat].map((rec: any, idx: number) => {
                      const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                      return (
                        <tr key={rec.id} style={{ borderBottom: "1px solid rgba(255,255,255,.03)", background: idx < 3 ? "rgba(129,140,248,.02)" : "transparent" }}>
                          <td style={{ padding: "12px 16px", fontWeight: 700, color: medal ? "inherit" : "#71717a" }}>
                            {medal || `#${idx + 1}`}
                          </td>
                          <td style={{ padding: "12px 16px", color: "#fafafa", fontWeight: 600 }}>
                            <div>
                              <span>{rec.memberName}</span>
                              <span style={{ fontSize: 11, color: "#71717a", fontWeight: 400, marginLeft: 8 }}>
                                (BW: {rec.bodyWeight ? `${rec.bodyWeight} kg` : "70 kg default"})
                              </span>
                            </div>
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: "#818cf8", fontWeight: 700 }}>
                            {rec.weight} kg
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "center", color: "#fafafa" }}>
                            {rec.reps}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right", color: "#71717a", fontSize: 11 }}>
                            {new Date(rec.date).toLocaleDateString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────────────── */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 20 }}>
          <div style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,.1)", borderRadius: 16, padding: 28, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: "#fafafa", margin: 0 }}>
                {editTarget ? "Edit Workout" : "Add Workout"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            {error && <div style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "8px 12px", color: "#f87171", marginBottom: 14, fontSize: 13 }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {/* Name */}
              <div>
                <label style={lbl}>Name *</label>
                <input style={inp} value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Incline Dumbbell Press" required />
              </div>

              {/* Category + Subcategory side by side */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={lbl}>Category *</label>
                  <select style={inp} value={form.category} onChange={e => setCategory(e.target.value)}>
                    {CAT_NAMES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={lbl}>Subcategory *</label>
                  <select style={inp} value={form.subcategory} onChange={e => setForm(f => ({ ...f, subcategory: e.target.value }))}>
                    {(CATEGORIES[form.category] ?? []).map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label style={lbl}>Difficulty *</label>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {DIFFICULTIES.map(d => (
                    <button key={d} type="button" onClick={() => setForm(f => ({ ...f, difficulty: d }))} style={{
                      flex: 1, padding: "7px 0", borderRadius: 8, border: `1px solid ${form.difficulty === d ? DIFF_COLOR[d] : "rgba(255,255,255,.1)"}`,
                      background: form.difficulty === d ? `${DIFF_COLOR[d]}1a` : "transparent",
                      color: form.difficulty === d ? DIFF_COLOR[d] : "#71717a",
                      cursor: "pointer", fontSize: 12, fontWeight: 600, transition: "all .15s",
                    }}>{d}</button>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              <div>
                <label style={lbl}>Instructions / Description</label>
                <textarea style={{ ...inp, height: 90, resize: "vertical" }} value={form.instructions} onChange={e => setForm(f => ({ ...f, instructions: e.target.value }))} placeholder="Step-by-step instructions, muscles worked, tips…" />
              </div>

              {/* Media URL */}
              <div>
                <label style={lbl}>Video / Image URL <span style={{ color: "#52525b" }}>(optional)</span></label>
                <input style={inp} value={form.mediaUrl} onChange={e => setForm(f => ({ ...f, mediaUrl: e.target.value }))} placeholder="https://youtube.com/..." />
              </div>

              <button type="submit" disabled={submitting} style={{ background: "#eab308", border: "none", borderRadius: 9, padding: "10px 0", color: "#000", fontWeight: 700, fontSize: 14, cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? .6 : 1, marginTop: 4 }}>
                {submitting ? "Saving…" : editTarget ? "Save Changes" : "Add Workout"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const lbl: React.CSSProperties = { display: "block", fontSize: 12, fontWeight: 500, color: "#a1a1aa", marginBottom: 6 };
const inp: React.CSSProperties = { width: "100%", background: "#27272a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "8px 12px", color: "#fafafa", fontSize: 13, outline: "none", boxSizing: "border-box" };
