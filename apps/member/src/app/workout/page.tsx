"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";

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

const DIFF_COLOR: Record<string, string> = {
  Beginner: "#22c55e", Intermediate: "#eab308", Advanced: "#f97316", Expert: "#ef4444",
};

interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  difficulty: string;
  instructions?: string;
  mediaUrl?: string;
  category: string;
  subcategory: string;
}

function parseEx(e: any): Exercise {
  const [category, subcategory] = String(e.muscleGroup ?? "").includes("|")
    ? e.muscleGroup.split("|")
    : [e.muscleGroup ?? "Other", ""];
  return { ...e, category, subcategory };
}

export default function WorkoutPage() {
  const { user, token, loading: authLoading } = useAuth();
  const router = useRouter();

  const [exercises,   setExercises]   = useState<Exercise[]>([]);
  const [fetching,    setFetching]    = useState(true);
  const [activeCategory, setActiveCat] = useState<string>("All");
  const [openSubs,    setOpenSubs]    = useState<Record<string, boolean>>({});
  const [search,      setSearch]      = useState("");
  const [diffFilter,  setDiffFilter]  = useState("All");
  const [expanded,    setExpanded]    = useState<string | null>(null);

  useEffect(() => { if (!authLoading && !user) router.push("/login"); }, [user, authLoading, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/exercises`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => setExercises(Array.isArray(data) ? data.map(parseEx) : []))
      .finally(() => setFetching(false));
  }, [token]);

  const categories = ["All", ...Object.keys(CATEGORIES).filter(c => exercises.some(e => e.category === c))];

  const filtered = exercises.filter(ex => {
    if (activeCategory !== "All" && ex.category !== activeCategory) return false;
    if (diffFilter !== "All" && ex.difficulty !== diffFilter) return false;
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.subcategory.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by category → subcategory
  const grouped: Record<string, Record<string, Exercise[]>> = {};
  for (const ex of filtered) {
    (grouped[ex.category] ??= {})[ex.subcategory] ??= [];
    grouped[ex.category][ex.subcategory].push(ex);
  }

  const toggleSub = (key: string) => setOpenSubs(p => ({ ...p, [key]: !p[key] }));

  if (authLoading || fetching) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#71717a" }}>Loading…</div>;
  }

  return (
    <div style={{ padding: "28px 24px", maxWidth: 980 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>Workout Library</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>{exercises.length} exercises across {Object.keys(CATEGORIES).filter(c => exercises.some(e => e.category === c)).length} categories</p>
      </div>

      {/* Search + difficulty filter */}
      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
        <input
          style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "7px 12px", color: "#fafafa", fontSize: 13, outline: "none", flex: 1, minWidth: 200 }}
          placeholder="Search exercises…"
          value={search} onChange={e => setSearch(e.target.value)}
        />
        {["All", "Beginner", "Intermediate", "Advanced", "Expert"].map(d => (
          <button key={d} onClick={() => setDiffFilter(d)} style={{
            padding: "5px 12px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer",
            background: diffFilter === d ? (DIFF_COLOR[d] ?? "#eab308") : "transparent",
            color:      diffFilter === d ? "#000" : "#71717a",
            borderColor:diffFilter === d ? (DIFF_COLOR[d] ?? "#eab308") : "rgba(255,255,255,.1)",
          }}>{d}</button>
        ))}
      </div>

      {/* Category pill tabs */}
      <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 24 }}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCat(cat)} style={{
            padding: "6px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", flexShrink: 0, transition: "all .15s",
            background: activeCategory === cat ? "#eab308" : "rgba(255,255,255,.04)",
            color:      activeCategory === cat ? "#000"    : "#71717a",
            borderColor:activeCategory === cat ? "#eab308" : "rgba(255,255,255,.08)",
          }}>{cat}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 0", color: "#52525b", fontSize: 14 }}>
          {search || diffFilter !== "All" || activeCategory !== "All" ? "No exercises match your filters." : "No exercises have been added yet."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          {Object.entries(grouped).map(([cat, subs]) => (
            <div key={cat}>
              {/* Category heading */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fafafa", margin: 0 }}>{cat}</h2>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
                <span style={{ fontSize: 12, color: "#52525b" }}>{Object.values(subs).flat().length} exercises</span>
              </div>

              {/* Subcategory accordions */}
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {Object.entries(subs).map(([sub, exs]) => {
                  const key    = `${cat}|${sub}`;
                  const isOpen = openSubs[key] ?? true; // open by default
                  return (
                    <div key={sub} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 12, overflow: "hidden" }}>
                      {/* Subcategory header */}
                      <button
                        onClick={() => toggleSub(key)}
                        style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#d4d4d8" }}>{sub}</span>
                          <span style={{ fontSize: 11, color: "#52525b", background: "rgba(255,255,255,.05)", borderRadius: 20, padding: "1px 7px" }}>{exs.length}</span>
                        </div>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="2" strokeLinecap="round" style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform .2s" }}>
                          <path d="M6 9l6 6 6-6"/>
                        </svg>
                      </button>

                      {/* Exercise cards */}
                      {isOpen && (
                        <div style={{ borderTop: "1px solid rgba(255,255,255,.05)", padding: "12px 14px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
                          {exs.map(ex => {
                            const isExp = expanded === ex.id;
                            return (
                              <div
                                key={ex.id}
                                onClick={() => setExpanded(isExp ? null : ex.id)}
                                style={{
                                  background: "#1c1c1e", border: `1px solid ${isExp ? "rgba(234,179,8,.3)" : "rgba(255,255,255,.06)"}`,
                                  borderRadius: 10, padding: "14px 16px", cursor: "pointer", transition: "border-color .2s",
                                }}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
                                  <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa", lineHeight: 1.3 }}>{ex.name}</span>
                                  <span style={{
                                    fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 20, flexShrink: 0,
                                    background: `${DIFF_COLOR[ex.difficulty] ?? "#a1a1aa"}1a`,
                                    color: DIFF_COLOR[ex.difficulty] ?? "#a1a1aa",
                                    border: `1px solid ${DIFF_COLOR[ex.difficulty] ?? "#a1a1aa"}44`,
                                  }}>{ex.difficulty}</span>
                                </div>

                                {isExp && ex.instructions && (
                                  <p style={{ fontSize: 12, color: "#71717a", lineHeight: 1.6, marginTop: 8, marginBottom: ex.mediaUrl ? 10 : 0 }}>
                                    {ex.instructions}
                                  </p>
                                )}

                                {isExp && ex.mediaUrl && (
                                  <a
                                    href={ex.mediaUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 11, color: "#818cf8", textDecoration: "none", marginTop: 6 }}
                                  >
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                                    Watch video
                                  </a>
                                )}

                                {!isExp && (
                                  <p style={{ fontSize: 11, color: "#52525b", margin: 0 }}>
                                    {ex.instructions ? ex.instructions.slice(0, 60) + (ex.instructions.length > 60 ? "…" : "") : "Tap to expand"}
                                  </p>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
