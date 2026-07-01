"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

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

interface Plan {
  id: string;
  name: string;
  description?: string;
  goal: string;
  workoutExercises: {
    exerciseId: string;
    sets: number;
    reps: number;
    restSeconds: number;
    exercise: Exercise;
  }[];
}

interface LeaderboardRecord {
  id: string;
  memberId: string;
  memberName: string;
  photoUrl: string | null;
  weight: number;
  reps: number;
  bodyWeight: number | null;
  date: string;
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

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<"active" | "plans" | "leaderboard" | "library">("active");

  // Shared Data
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [fetchingEx, setFetchingEx] = useState(true);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [fetchingPlans, setFetchingPlans] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Tab 1: Active Workout Logging State
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [activeSession, setActiveSession] = useState<{
    planId: string;
    exercises: {
      exerciseId: string;
      name: string;
      sets: { weight: string; reps: string; done: boolean; isPr: boolean }[];
      targetSets: number;
      targetReps: number;
      restSeconds: number;
    }[];
  } | null>(null);

  // Tab 1: Break Timer State
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [timerMax, setTimerMax] = useState(60);

  // Tab 2: Custom Plan Builder Form State
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [newPlanName, setNewPlanName] = useState("");
  const [newPlanGoal, setNewPlanGoal] = useState("STRENGTH");
  const [newPlanDesc, setNewPlanDesc] = useState("");
  const [newPlanExs, setNewPlanExs] = useState<{ exerciseId: string; sets: number; reps: number; restSeconds: number }[]>([]);
  const [submittingPlan, setSubmittingPlan] = useState(false);

  // Tab 3: Leaderboard States
  const [leaderboardExId, setLeaderboardExId] = useState("");
  const [leaderboards, setLeaderboards] = useState<Record<string, LeaderboardRecord[]>>({
    Lightweight: [], Middleweight: [], Heavyweight: [], "Super Heavyweight": []
  });
  const [fetchingLeaderboard, setFetchingLeaderboard] = useState(false);
  const [activeBwCat, setActiveBwCat] = useState<string>("Middleweight");
  const [leaderboardDropdownOpen, setLeaderboardDropdownOpen] = useState(false);

  // Tab 4: Library Filter States
  const [search, setSearch] = useState("");
  const [diffFilter, setDiffFilter] = useState("All");
  const [activeCategory, setActiveCat] = useState("All");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [openSubs, setOpenSubs] = useState<Record<string, boolean>>({});

  // Search & Edit States
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [builderSearch, setBuilderSearch] = useState("");
  const [leaderboardSearch, setLeaderboardSearch] = useState("");

  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  // Fetch Exercises & Plans
  const fetchExercises = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/exercises`, { headers });
      const data = await res.json();
      setExercises(Array.isArray(data) ? data.map(parseEx) : []);
    } catch {
      setError("Failed to load exercises");
    } finally {
      setFetchingEx(false);
    }
  }, [token]);

  const fetchPlans = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API}/workouts/plans`, { headers });
      const data = await res.json();
      setPlans(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load plans");
    } finally {
      setFetchingPlans(false);
    }
  }, [token]);

  useEffect(() => {
    if (!authLoading && !user) router.push("/login");
  }, [user, authLoading, router]);

  useEffect(() => {
    if (token) {
      fetchExercises();
      fetchPlans();
    }
  }, [token, fetchExercises, fetchPlans]);

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

  // Rest Break Timer synthesis sound
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.6, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } catch (err) {
      console.warn("Audio Context beep failed", err);
    }
  };

  // Timer Tick implementation
  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      const id = setTimeout(() => setTimeLeft(t => (t !== null ? t - 1 : null)), 1000);
      return () => clearTimeout(id);
    } else if (timeLeft === 0) {
      playBeep();
      setTimeLeft(null);
    }
  }, [timeLeft]);

  const startBreakTimer = (duration: number) => {
    setTimeLeft(duration);
    setTimerMax(duration);
  };

  // Custom Plan submit
  const handleCreatePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) { setError("Plan name is required"); return; }
    if (newPlanExs.length === 0) { setError("Add at least one exercise to the plan"); return; }

    setSubmittingPlan(true);
    setError(""); setSuccess("");
    try {
      const method = editingPlanId ? "PATCH" : "POST";
      const url = editingPlanId ? `${API}/workouts/plans/${editingPlanId}` : `${API}/workouts/plans`;
      const res = await fetch(url, {
        method,
        headers: jsonHeaders,
        body: JSON.stringify({
          name: newPlanName.trim(),
          description: newPlanDesc || undefined,
          goal: newPlanGoal,
          exercises: newPlanExs
        })
      });
      if (res.ok) {
        setSuccess(editingPlanId ? "Custom workout plan updated successfully!" : "Custom workout plan created successfully!");
        setNewPlanName(""); setNewPlanDesc(""); setNewPlanExs([]);
        setEditingPlanId(null);
        setShowPlanModal(false);
        fetchPlans();
      } else {
        const d = await res.json();
        setError(d.message || "Failed to save plan");
      }
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setSubmittingPlan(false);
    }
  };

  // Select workout plan & start logging
  const handleStartWorkout = (plan: Plan) => {
    setSelectedPlan(plan);
    setActiveSession({
      planId: plan.id,
      exercises: plan.workoutExercises.map(we => ({
        exerciseId: we.exerciseId,
        name: we.exercise.name,
        sets: Array.from({ length: we.sets }, () => ({ weight: "", reps: String(we.reps), done: false, isPr: false })),
        targetSets: we.sets,
        targetReps: we.reps,
        restSeconds: we.restSeconds
      }))
    });
    setError(""); setSuccess("");
  };

  // Log completed set
  const toggleSetDone = (exIndex: number, setIndex: number) => {
    if (!activeSession) return;
    const s = { ...activeSession };
    const set = s.exercises[exIndex].sets[setIndex];
    
    if (!set.weight || !set.reps) {
      setError("Please fill in weight and reps before marking a set as done.");
      return;
    }
    
    setError("");
    const isDone = !set.done;
    set.done = isDone;
    setActiveSession(s);

    if (isDone) {
      startBreakTimer(s.exercises[exIndex].restSeconds);
    }
  };

  // Update set values
  const updateSetField = (exIndex: number, setIndex: number, field: "weight" | "reps" | "isPr", val: any) => {
    if (!activeSession) return;
    const s = { ...activeSession };
    const set = s.exercises[exIndex].sets[setIndex] as any;
    set[field] = val;
    setActiveSession(s);
  };

  // Submit logged session and send PR claims
  const handleFinishWorkout = async () => {
    if (!activeSession) return;

    const loggedExs = activeSession.exercises.map(ex => {
      const completedSets = ex.sets.filter(s => s.done);
      if (completedSets.length === 0) return null;
      return {
        exerciseId: ex.exerciseId,
        sets: completedSets.length,
        reps: Math.round(completedSets.reduce((sum, s) => sum + parseInt(s.reps || "0"), 0) / completedSets.length),
        weight: completedSets.reduce((sum, s) => sum + parseFloat(s.weight || "0"), 0) / completedSets.length,
        restSeconds: ex.restSeconds,
        notes: `Logged via customized set tracking.`
      };
    }).filter(Boolean) as any[];

    if (loggedExs.length === 0) {
      setError("You must complete at least one set to record a workout.");
      return;
    }

    setSubmittingPlan(true);
    setError(""); setSuccess("");
    try {
      const res = await fetch(`${API}/workouts/sessions`, {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          workoutPlanId: activeSession.planId,
          notes: "Crushed a session!",
          exercises: loggedExs
        })
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.message || "Failed to log workout session");
        setSubmittingPlan(false);
        return;
      }

      // Submit PR Claims
      for (const ex of activeSession.exercises) {
        for (const set of ex.sets) {
          if (set.done && set.isPr) {
            await fetch(`${API}/workouts/pr`, {
              method: "POST",
              headers: jsonHeaders,
              body: JSON.stringify({
                exerciseId: ex.exerciseId,
                weight: parseFloat(set.weight),
                reps: parseInt(set.reps)
              })
            });
          }
        }
      }

      setSuccess("Workout session logged! PR claims submitted for review.");
      setActiveSession(null);
      setSelectedPlan(null);
    } catch {
      setError("Failed to record workout session.");
    } finally {
      setSubmittingPlan(false);
    }
  };

  // Add exercise row to plan builder
  const addExToPlan = (exId: string) => {
    if (newPlanExs.some(e => e.exerciseId === exId)) return;
    setNewPlanExs(p => [...p, { exerciseId: exId, sets: 3, reps: 10, restSeconds: 60 }]);
  };

  // Remove exercise from plan builder
  const removeExFromPlan = (index: number) => {
    setNewPlanExs(p => p.filter((_, i) => i !== index));
  };

  // Edit builder exercise parameter
  const updateBuilderEx = (index: number, field: "sets" | "reps" | "restSeconds", val: number) => {
    const arr = [...newPlanExs];
    arr[index][field] = val;
    setNewPlanExs(arr);
  };

  const toggleSub = (key: string) => setOpenSubs(p => ({ ...p, [key]: !p[key] }));

  // Group exercises for display
  const CATEGORY_KEYS = Object.keys(CATEGORIES);
  const activeCategories = ["All", ...CATEGORY_KEYS.filter(c => exercises.some(e => e.category === c))];
  const filteredExs = exercises.filter(ex => {
    if (activeCategory !== "All" && ex.category !== activeCategory) return false;
    if (diffFilter !== "All" && ex.difficulty !== diffFilter) return false;
    if (search && !ex.name.toLowerCase().includes(search.toLowerCase()) && !ex.subcategory.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const grouped: Record<string, Record<string, Exercise[]>> = {};
  for (const ex of filteredExs) {
    (grouped[ex.category] ??= {})[ex.subcategory] ??= [];
    grouped[ex.category][ex.subcategory].push(ex);
  }

  if (authLoading || fetchingEx || fetchingPlans) {
    return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "#71717a" }}>Loading…</div>;
  }

  return (
    <div style={{ padding: "24px 16px", maxWidth: 980, display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#fafafa", margin: 0 }}>Workouts & Leaderboards</h1>
        <p style={{ fontSize: 13, color: "#71717a", marginTop: 4 }}>Log workouts, claim PRs, and challenge yourself</p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 12, borderBottom: "1px solid rgba(255,255,255,.07)", overflowX: "auto", paddingBottom: 4 }}>
        {[
          { id: "active", label: "Active Workout" },
          { id: "plans", label: "Custom Plans" },
          { id: "leaderboard", label: "Leaderboard" },
          { id: "library", label: "Exercise Library" }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => { setError(""); setSuccess(""); setActiveTab(t.id as any); }}
            style={{
              background: "none",
              border: "none",
              borderBottom: activeTab === t.id ? "2px solid #eab308" : "2px solid transparent",
              color: activeTab === t.id ? "#fafafa" : "#71717a",
              padding: "8px 12px",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              flexShrink: 0,
              transition: "all 0.15s"
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Break Timer Float Widget */}
      {timeLeft !== null && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "linear-gradient(135deg, #1e1b4b 0%, #0c0a09 100%)",
          border: "2px solid #6366f1",
          borderRadius: 20,
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 16,
          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
          zIndex: 1000
        }}>
          <div>
            <div style={{ fontSize: 10, color: "#a1a1aa", textTransform: "uppercase", letterSpacing: ".05em" }}>Rest Break</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fafafa", fontFamily: "monospace", marginTop: 2 }}>
              {timeLeft}s
            </div>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <button
              onClick={() => setTimeLeft(t => (t !== null ? t + 15 : null))}
              style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "4px 8px", color: "#fafafa", fontSize: 11, cursor: "pointer" }}
            >
              +15s
            </button>
            <button
              onClick={() => setTimeLeft(null)}
              style={{ background: "rgba(239,68,68,.2)", border: "1px solid rgba(239,68,68,.3)", borderRadius: 8, padding: "4px 8px", color: "#f87171", fontSize: 11, cursor: "pointer", fontWeight: 600 }}
            >
              Skip
            </button>
          </div>
        </div>
      )}

      {(error || success) && (
        <div style={{ background: error ? "rgba(239,68,68,.1)" : "rgba(34,197,94,.1)", border: `1px solid ${error ? "rgba(239,68,68,.3)" : "rgba(34,197,94,.3)"}`, borderRadius: 8, padding: "10px 14px", color: error ? "#f87171" : "#4ade80", fontSize: 13 }}>
          {error || success}
        </div>
      )}

      {/* TAB 1: ACTIVE WORKOUT */}
      {activeTab === "active" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {!activeSession ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>Select a Workout Routine to Start:</div>
              {plans.length === 0 ? (
                <div style={{ textAlign: "center", padding: "48px 20px", background: "#18181b", border: "1px dashed rgba(255,255,255,.07)", borderRadius: 12, color: "#71717a" }}>
                  No plans available. Head over to the "Custom Plans" tab to build your own routine!
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 }}>
                  {plans.map(p => (
                    <div key={p.id} style={{
                      background: "#18181b",
                      border: "1px solid rgba(255,255,255,.07)",
                      borderRadius: 14,
                      padding: 16,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12
                    }}>
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>{p.name}</span>
                          <span style={{ fontSize: 10, background: "rgba(234,179,8,.1)", color: "#eab308", padding: "1px 6px", borderRadius: 4, fontWeight: 600 }}>{p.goal}</span>
                        </div>
                        {p.description && <p style={{ fontSize: 12, color: "#71717a", marginTop: 4, marginBottom: 8 }}>{p.description}</p>}
                        <div style={{ fontSize: 11, color: "#a1a1aa", marginTop: 6 }}>
                          {p.workoutExercises.length} exercise{p.workoutExercises.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                      <button
                        onClick={() => handleStartWorkout(p)}
                        style={{
                          background: "#eab308",
                          border: "none",
                          borderRadius: 8,
                          padding: "8px 0",
                          color: "#000",
                          fontWeight: 700,
                          fontSize: 12,
                          cursor: "pointer",
                          textAlign: "center"
                        }}
                      >
                        Start Routine
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {/* Active workout header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, background: "#18181b", padding: 16, borderRadius: 14, border: "1px solid rgba(255,255,255,.07)" }}>
                <div>
                  <div style={{ fontSize: 11, color: "#eab308", fontWeight: 600, textTransform: "uppercase" }}>Active Workout Session</div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fafafa", margin: "2px 0 0 0" }}>{selectedPlan?.name}</h3>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={() => { if (confirm("Cancel active workout? Progress will be lost.")) { setActiveSession(null); setSelectedPlan(null); } }}
                    style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.2)", borderRadius: 8, padding: "8px 14px", color: "#f87171", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleFinishWorkout}
                    disabled={submittingPlan}
                    style={{ background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)", border: "none", borderRadius: 8, padding: "8px 16px", color: "#fff", fontSize: 12, fontWeight: 700, cursor: submittingPlan ? "not-allowed" : "pointer" }}
                  >
                    {submittingPlan ? "Saving..." : "Finish Workout"}
                  </button>
                </div>
              </div>

              {/* Set Tracking List */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                {activeSession.exercises.map((ex, exIndex) => (
                  <div key={ex.exerciseId} style={{ background: "#18181b", border: "1px solid rgba(255,255,255,.07)", borderRadius: 16, overflow: "hidden" }}>
                    <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 14, fontWeight: 700, color: "#fafafa" }}>{exIndex + 1}. {ex.name}</span>
                      <span style={{ fontSize: 11, color: "#71717a" }}>Rest: {ex.restSeconds}s</span>
                    </div>
                    
                    <div style={{ padding: 14, display: "flex", flexDirection: "column", gap: 10 }}>
                      {/* Set Headers */}
                      <div style={{ display: "grid", gridTemplateColumns: "50px 1fr 1fr 60px 40px", gap: 8, fontSize: 10, color: "#71717a", fontWeight: 600, textTransform: "uppercase" }}>
                        <div style={{ textAlign: "center" }}>Set</div>
                        <div>Weight (kg)</div>
                        <div>Reps</div>
                        <div style={{ textAlign: "center" }}>PR?</div>
                        <div style={{ textAlign: "center" }}>Log</div>
                      </div>

                      {/* Sets list */}
                      {ex.sets.map((set, setIndex) => (
                        <div key={setIndex} style={{
                          display: "grid",
                          gridTemplateColumns: "50px 1fr 1fr 60px 40px",
                          gap: 8,
                          alignItems: "center",
                          background: set.done ? "rgba(34,197,94,.05)" : "transparent",
                          padding: "4px 0",
                          borderRadius: 8
                        }}>
                          <div style={{ textAlign: "center", fontSize: 12, fontWeight: 600, color: set.done ? "#22c55e" : "#71717a" }}>
                            {setIndex + 1}
                          </div>
                          <input
                            type="number"
                            placeholder="0"
                            value={set.weight}
                            disabled={set.done}
                            onChange={e => updateSetField(exIndex, setIndex, "weight", e.target.value)}
                            style={{
                              background: "#27272a", border: "1px solid rgba(255,255,255,.07)", borderRadius: 6, padding: "6px 8px", color: "#fafafa", fontSize: 13, outline: "none", width: "100%"
                            }}
                          />
                          <input
                            type="number"
                            placeholder={String(ex.targetReps)}
                            value={set.reps}
                            disabled={set.done}
                            onChange={e => updateSetField(exIndex, setIndex, "reps", e.target.value)}
                            style={{
                              background: "#27272a", border: "1px solid rgba(255,255,255,.07)", borderRadius: 6, padding: "6px 8px", color: "#fafafa", fontSize: 13, outline: "none", width: "100%"
                            }}
                          />
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <button
                              type="button"
                              disabled={set.done}
                              onClick={() => updateSetField(exIndex, setIndex, "isPr", !set.isPr)}
                              style={{
                                background: "none",
                                border: "none",
                                fontSize: 16,
                                cursor: set.done ? "not-allowed" : "pointer",
                                opacity: set.isPr ? 1 : 0.25,
                                filter: set.isPr ? "grayscale(0%)" : "grayscale(100%)",
                                transition: "all 0.15s"
                              }}
                              title="Claim Personal Record (PR)"
                            >
                              🏆
                            </button>
                          </div>
                          <div style={{ display: "flex", justifyContent: "center" }}>
                            <button
                              type="button"
                              onClick={() => toggleSetDone(exIndex, setIndex)}
                              style={{
                                background: set.done ? "#22c55e" : "rgba(255,255,255,.04)",
                                border: `1px solid ${set.done ? "#22c55e" : "rgba(255,255,255,.1)"}`,
                                color: set.done ? "#000" : "#71717a",
                                borderRadius: "50%",
                                width: 26,
                                height: 26,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                fontSize: 12,
                                fontWeight: "bold",
                                cursor: "pointer",
                                transition: "all 0.15s"
                              }}
                            >
                              {set.done ? "✓" : "+"}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CUSTOM PLANS */}
      {activeTab === "plans" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: "#e4e4e7" }}>My Workout Routines</span>
            <button
              onClick={() => {
                setError(""); setSuccess("");
                setEditingPlanId(null);
                setNewPlanName("");
                setNewPlanGoal("STRENGTH");
                setNewPlanDesc("");
                setNewPlanExs([]);
                setShowPlanModal(true);
              }}
              style={{ background: "#eab308", border: "none", borderRadius: 8, padding: "8px 16px", color: "#000", fontWeight: 700, fontSize: 12, cursor: "pointer" }}
            >
              + Create Custom Plan
            </button>
          </div>

          {plans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 20px", background: "#18181b", border: "1px dashed rgba(255,255,255,.07)", borderRadius: 14, color: "#71717a" }}>
              No custom plans created yet. Build your first one by clicking "+ Create Custom Plan" above!
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 14 }}>
              {plans.map(p => (
                <div key={p.id} style={{
                  background: "#18181b",
                  border: "1px solid rgba(255,255,255,.07)",
                  borderRadius: 14,
                  padding: 16,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  gap: 12
                }}>
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fafafa", margin: 0 }}>{p.name}</h3>
                      <span style={{ fontSize: 9, background: "rgba(255,255,255,.05)", color: "#a1a1aa", padding: "2px 6px", borderRadius: 4, fontWeight: 600 }}>{p.goal}</span>
                    </div>
                    {p.description && <p style={{ fontSize: 12, color: "#71717a", marginTop: 4, marginBottom: 8 }}>{p.description}</p>}
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                      <span style={{ fontSize: 11, color: "#71717a", textTransform: "uppercase", letterSpacing: ".025em" }}>Exercises ({p.workoutExercises.length})</span>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 2 }}>
                        {p.workoutExercises.map((we, idx) => (
                          <span key={idx} style={{ fontSize: 10, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)", color: "#d4d4d8", padding: "1px 6px", borderRadius: 4 }}>
                            {we.exercise.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      onClick={() => {
                        setError(""); setSuccess("");
                        setEditingPlanId(p.id);
                        setNewPlanName(p.name);
                        setNewPlanGoal(p.goal);
                        setNewPlanDesc(p.description || "");
                        setNewPlanExs(p.workoutExercises.map(we => ({
                          exerciseId: we.exerciseId,
                          sets: we.sets,
                          reps: we.reps,
                          restSeconds: we.restSeconds
                        })));
                        setShowPlanModal(true);
                      }}
                      style={{
                        flex: 1,
                        background: "rgba(255,255,255,.05)",
                        border: "1px solid rgba(255,255,255,.1)",
                        borderRadius: 8,
                        padding: "6px 0",
                        color: "#fafafa",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                        textAlign: "center"
                      }}
                    >
                      Edit Routine
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Create Plan Modal */}
          {showPlanModal && (
            <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.75)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100, padding: 16 }}>
              <div style={{ background: "#1c1c1e", border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, padding: 24, width: "100%", maxWidth: 540, maxHeight: "90vh", overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fafafa", margin: 0 }}>
                    {editingPlanId ? "Edit Custom Workout Plan" : "Build Custom Workout Plan"}
                  </h3>
                  <button onClick={() => setShowPlanModal(false)} style={{ background: "none", border: "none", color: "#71717a", cursor: "pointer", fontSize: 22 }}>×</button>
                </div>

                <form onSubmit={handleCreatePlan} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 4 }}>Plan Name</label>
                    <input
                      style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 12px", color: "#fafafa", fontSize: 13, outline: "none", width: "100%" }}
                      placeholder="e.g. Hypertrophy Pull Day"
                      value={newPlanName}
                      onChange={e => setNewPlanName(e.target.value)}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 4 }}>Goal Type</label>
                    <select
                      value={newPlanGoal}
                      onChange={e => setNewPlanGoal(e.target.value)}
                      style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 12px", color: "#fafafa", fontSize: 13, outline: "none", width: "100%" }}
                    >
                      {["STRENGTH", "MUSCLE_GAIN", "WEIGHT_LOSS", "FITNESS"].map(g => (
                        <option key={g} value={g}>{g.replace("_", " ")}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 4 }}>Description (Optional)</label>
                    <textarea
                      style={{ background: "#27272a", border: "1px solid rgba(255,255,255,.08)", borderRadius: 8, padding: "8px 12px", color: "#fafafa", fontSize: 13, outline: "none", width: "100%", minHeight: 60 }}
                      placeholder="Describe target muscles, routine schedule, etc."
                      value={newPlanDesc}
                      onChange={e => setNewPlanDesc(e.target.value)}
                    />
                  </div>

                  {/* Added Exercises checklist */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <span style={{ fontSize: 12, color: "#a1a1aa", fontWeight: 600 }}>Plan Exercises ({newPlanExs.length})</span>
                    {newPlanExs.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#52525b", fontStyle: "italic", textAlign: "center", padding: "14px 0", background: "rgba(255,255,255,.02)", border: "1px dashed rgba(255,255,255,.05)", borderRadius: 8 }}>
                        No exercises added. Select exercises from the checklist below!
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                        {newPlanExs.map((pe, peIdx) => {
                          const ex = exercises.find(e => e.id === pe.exerciseId);
                          return (
                            <div key={peIdx} style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              background: "#27272a",
                              borderRadius: 8,
                              padding: "8px 12px",
                              gap: 12,
                              flexWrap: "wrap"
                            }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#fafafa", flex: 1, minWidth: 120 }}>{ex?.name}</span>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ fontSize: 11, color: "#71717a" }}>Sets:</span>
                                  <input
                                    type="number"
                                    value={pe.sets}
                                    min={1}
                                    onChange={e => updateBuilderEx(peIdx, "sets", parseInt(e.target.value) || 3)}
                                    style={{ width: 44, background: "#1c1c1e", border: "1px solid rgba(255,255,255,.07)", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 11, textAlign: "center" }}
                                  />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ fontSize: 11, color: "#71717a" }}>Reps:</span>
                                  <input
                                    type="number"
                                    value={pe.reps}
                                    min={1}
                                    onChange={e => updateBuilderEx(peIdx, "reps", parseInt(e.target.value) || 10)}
                                    style={{ width: 44, background: "#1c1c1e", border: "1px solid rgba(255,255,255,.07)", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 11, textAlign: "center" }}
                                  />
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <span style={{ fontSize: 11, color: "#71717a" }}>Rest(s):</span>
                                  <input
                                    type="number"
                                    value={pe.restSeconds}
                                    min={10}
                                    step={10}
                                    onChange={e => updateBuilderEx(peIdx, "restSeconds", parseInt(e.target.value) || 60)}
                                    style={{ width: 50, background: "#1c1c1e", border: "1px solid rgba(255,255,255,.07)", color: "#fff", borderRadius: 4, padding: "2px 4px", fontSize: 11, textAlign: "center" }}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removeExFromPlan(peIdx)}
                                  style={{ background: "none", border: "none", color: "#ef4444", fontSize: 15, cursor: "pointer", fontWeight: "bold" }}
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Exercise selector box */}
                  <div style={{ border: "1px solid rgba(255,255,255,.05)", borderRadius: 8, background: "rgba(255,255,255,.02)", padding: 12 }}>
                    <span style={{ display: "block", fontSize: 12, color: "#a1a1aa", marginBottom: 8, fontWeight: 600 }}>Click Exercise to Add to Routine:</span>
                    
                    <input
                      placeholder="Search exercise by name..."
                      value={builderSearch}
                      onChange={e => setBuilderSearch(e.target.value)}
                      style={{
                        background: "#27272a",
                        border: "1px solid rgba(255,255,255,.08)",
                        borderRadius: 6,
                        padding: "6px 10px",
                        color: "#fafafa",
                        fontSize: 12,
                        outline: "none",
                        width: "100%",
                        marginBottom: 10
                      }}
                    />

                    <div style={{ maxHeight: 150, overflowY: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                      {exercises.filter(ex => ex.name.toLowerCase().includes(builderSearch.toLowerCase())).map(ex => {
                        const isAdded = newPlanExs.some(e => e.exerciseId === ex.id);
                        return (
                          <div
                            key={ex.id}
                            onClick={() => !isAdded && addExToPlan(ex.id)}
                            style={{
                              padding: "6px 10px",
                              borderRadius: 6,
                              fontSize: 12,
                              background: isAdded ? "rgba(255,255,255,.02)" : "rgba(234,179,8,.08)",
                              border: `1px solid ${isAdded ? "rgba(255,255,255,.03)" : "rgba(234,179,8,.2)"}`,
                              color: isAdded ? "#52525b" : "#fafafa",
                              cursor: isAdded ? "not-allowed" : "pointer",
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}
                          >
                            <span>{ex.name}</span>
                            <span style={{ fontSize: 9, color: "#71717a" }}>{ex.category}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button
                      type="button"
                      onClick={() => setShowPlanModal(false)}
                      style={{ flex: 1, background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: 8, padding: "10px 0", color: "#fafafa", fontSize: 13, cursor: "pointer" }}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingPlan || newPlanExs.length === 0}
                      style={{ flex: 1, background: "linear-gradient(90deg, #6366f1 0%, #4f46e5 100%)", border: "none", borderRadius: 8, padding: "10px 0", color: "#fff", fontSize: 13, fontWeight: 700, cursor: (submittingPlan || newPlanExs.length === 0) ? "not-allowed" : "pointer" }}
                    >
                      {submittingPlan ? "Saving Plan..." : editingPlanId ? "Update Plan" : "Create Plan"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: GYM LEADERBOARD */}
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
                No verified PRs in this weight class yet. Be the first to claim a record!
              </div>
            ) : (
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(255,255,255,.05)", background: "rgba(255,255,255,.02)" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Rank</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Athlete</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Weight Lifted</th>
                    <th style={{ padding: "10px 16px", textAlign: "center", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Reps</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#71717a", textTransform: "uppercase" }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboards[activeBwCat].map((rec, idx) => {
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
            )}
          </div>
        </div>
      )}

      {/* TAB 4: EXERCISE LIBRARY */}
      {activeTab === "library" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {/* Search + difficulty filter */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
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
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
            {activeCategories.map(cat => (
              <button key={cat} onClick={() => setActiveCat(cat)} style={{
                padding: "6px 14px", borderRadius: 20, border: "1px solid", fontSize: 12, fontWeight: 500, cursor: "pointer", flexShrink: 0, transition: "all .15s",
                background: activeCategory === cat ? "#eab308" : "rgba(255,255,255,.04)",
                color:      activeCategory === cat ? "#000"    : "#71717a",
                borderColor:activeCategory === cat ? "#eab308" : "rgba(255,255,255,.08)",
              }}>{cat}</button>
            ))}
          </div>

          {filteredExs.length === 0 ? (
            <div style={{ textAlign: "center", padding: "60px 0", color: "#52525b", fontSize: 14 }}>
              {search || diffFilter !== "All" || activeCategory !== "All" ? "No exercises match your filters." : "No exercises have been added yet."}
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {Object.entries(grouped).map(([cat, subs]) => (
                <div key={cat}>
                  {/* Category heading */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fafafa", margin: 0 }}>{cat}</h2>
                    <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,.06)" }} />
                    <span style={{ fontSize: 11, color: "#52525b" }}>{Object.values(subs).flat().length} exercises</span>
                  </div>

                  {/* Subcategory accordions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {Object.entries(subs).map(([sub, exs]) => {
                      const key = `${cat}|${sub}`;
                      const isOpen = openSubs[key] ?? true;
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
                              <path d="M6 9l6 6 6-6" />
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
                                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" /></svg>
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
      )}
    </div>
  );
}
