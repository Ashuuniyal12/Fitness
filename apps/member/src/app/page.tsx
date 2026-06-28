'use client';

import * as React from 'react';
import { Card, Button, Input } from '@maximus/ui';
import { calculateBMI, getBMICategory } from '@maximus/utils';
import {
  Flame, Award, Trophy, Compass, Plus, Dumbbell, CompassIcon,
  Calendar, RotateCcw, Droplet, User, CheckCircle
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MemberPortal() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'workout' | 'progress'>('dashboard');

  // Member stats
  const [waterCups, setWaterCups] = React.useState(3); // 250ml per cup
  const [workoutStreak, setWorkoutStreak] = React.useState(5);
  const [caloriesBurned, setCaloriesBurned] = React.useState(420);

  // Active workout state
  const [workoutExercises, setWorkoutExercises] = React.useState([
    { id: '1', name: 'Barbell Squat', sets: 4, reps: 8, completedSets: 0, weight: 80, pr: 95 },
    { id: '2', name: 'Bench Press', sets: 4, reps: 10, completedSets: 0, weight: 65, pr: 75 },
    { id: '3', name: 'Incline Dumbbell Fly', sets: 3, reps: 12, completedSets: 0, weight: 16, pr: 20 },
    { id: '4', name: 'Leg Extensions', sets: 3, reps: 15, completedSets: 0, weight: 45, pr: 55 }
  ]);

  const completeSet = (id: string) => {
    setWorkoutExercises(workoutExercises.map(ex => {
      if (ex.id === id && ex.completedSets < ex.sets) {
        return { ...ex, completedSets: ex.completedSets + 1 };
      }
      return ex;
    }));
  };

  const resetWorkout = () => {
    setWorkoutExercises(workoutExercises.map(ex => ({ ...ex, completedSets: 0 })));
  };

  // Progress metrics history
  const progressData = [
    { date: 'Jun 1', weight: 74.5 },
    { date: 'Jun 7', weight: 74.1 },
    { date: 'Jun 14', weight: 73.8 },
    { date: 'Jun 21', weight: 73.4 },
    { date: 'Jun 27', weight: 73.1 }
  ];

  return (
    <div className="min-h-screen flex bg-zinc-950 text-zinc-100">
      {/* Sidebar */}
      <aside className="w-64 border-r border-zinc-900 bg-zinc-950 p-6 space-y-8 flex-shrink-0">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Maximus Logo" className="h-12 w-auto object-contain" />
        </div>
        <nav className="space-y-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'dashboard' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            My Dashboard
          </button>
          <button
            onClick={() => setActiveTab('workout')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'workout' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            Start Workout
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'progress' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            Progress Logs
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {activeTab === 'dashboard' && 'Welcome back, Aarav!'}
              {activeTab === 'workout' && 'Active Session: Leg + Chest Hypertrophy'}
              {activeTab === 'progress' && 'Weight & PR Timeline'}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Goal: Muscle Gain | Active Subscription: Elite Annual</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:3000', '_blank')}>View Website</Button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Gamification Level Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-900 to-indigo-900 p-6 border border-violet-800/40">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_right,#8b5cf6_0%,transparent_60%)]" />
              <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-yellow-400" />
                    <span className="text-sm font-bold uppercase tracking-wider text-violet-300">Level 8 Titan</span>
                  </div>
                  <h2 className="text-xl font-extrabold text-white">Earned 1,840 Points this month</h2>
                  <p className="text-sm text-violet-200">You are 160 points away from Level 9! Complete today\'s workout to level up.</p>
                </div>
                <div className="w-48 bg-zinc-950/40 rounded-full h-3 overflow-hidden border border-violet-700/20">
                  <div className="bg-gradient-to-r from-violet-400 to-indigo-400 h-full rounded-full" style={{ width: '85%' }} />
                </div>
              </div>
            </div>

            {/* Core Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Active Streak</span>
                    <div className="text-3xl font-extrabold flex items-baseline gap-1">
                      <span>{workoutStreak}</span>
                      <span className="text-xs font-medium text-zinc-500">days</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-orange-600/10 border border-orange-500/10">
                    <Flame className="w-5 h-5 text-orange-400" />
                  </div>
                </div>
              </Card>

              <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Est. Calories Burned</span>
                    <div className="text-3xl font-extrabold flex items-baseline gap-1">
                      <span>{caloriesBurned}</span>
                      <span className="text-xs font-medium text-zinc-500">kcal</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-red-600/10 border border-red-500/10">
                    <Flame className="w-5 h-5 text-red-400" />
                  </div>
                </div>
              </Card>

              <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Hydration Tracker</span>
                    <div className="text-3xl font-extrabold flex items-baseline gap-1">
                      <span>{(waterCups * 0.25).toFixed(2)}</span>
                      <span className="text-xs font-medium text-zinc-500">Liters</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setWaterCups(waterCups + 1)}
                    className="p-2.5 rounded-xl bg-sky-600/10 border border-sky-500/10 hover:bg-sky-500/20 active:scale-95 transition"
                  >
                    <Droplet className="w-5 h-5 text-sky-400" />
                  </button>
                </div>
              </Card>

              <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">Current Weight</span>
                    <div className="text-3xl font-extrabold flex items-baseline gap-1">
                      <span>73.1</span>
                      <span className="text-xs font-medium text-zinc-500">kg</span>
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/10">
                    <User className="w-5 h-5 text-violet-400" />
                  </div>
                </div>
              </Card>
            </div>

            {/* Badges unlocked */}
            <Card className="border border-zinc-900 bg-zinc-900/30 p-6" hoverEffect={false}>
              <div className="mb-6">
                <h3 className="text-lg font-bold">Unlocked Badges</h3>
                <p className="text-xs text-zinc-500">Gamified milestone rewards</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[
                  { name: 'Early Bird', desc: 'Check in before 7 AM', unlocked: true },
                  { name: 'Calorie Slayer', desc: 'Burn 500+ kcal in 1 session', unlocked: true },
                  { name: 'Iron Lifter', desc: 'Log Squat 1RM over 90kg', unlocked: true },
                  { name: 'Consistency Master', desc: 'Maintain a 5-day check-in streak', unlocked: true }
                ].map((badge, idx) => (
                  <div key={idx} className="flex flex-col items-center justify-center p-4 border border-zinc-800 rounded-xl bg-zinc-900/60 text-center space-y-2">
                    <div className="w-10 h-10 rounded-full bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20 text-yellow-400">
                      <Trophy className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-sm text-zinc-100">{badge.name}</div>
                    <div className="text-[10px] text-zinc-500">{badge.desc}</div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'workout' && (
          <div className="space-y-6">
            <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40 p-6">
              <div className="flex justify-between items-center mb-6 border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <Dumbbell className="w-5.5 h-5.5 text-violet-400" /> Start Workout Active Log
                  </h3>
                  <p className="text-xs text-zinc-500">Mark sets as completed during your exercises</p>
                </div>
                <Button variant="outline" size="sm" onClick={resetWorkout}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Reset Session
                </Button>
              </div>

              <div className="space-y-6">
                {workoutExercises.map((ex) => (
                  <div key={ex.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl border border-zinc-800/80 bg-zinc-950/60 gap-4">
                    <div className="space-y-1">
                      <span className="font-semibold text-white">{ex.name}</span>
                      <div className="text-xs text-zinc-400 flex items-center gap-3">
                        <span>Sets: {ex.sets} | Reps: {ex.reps}</span>
                        <span className="text-violet-400 font-medium">Logged Weight: {ex.weight} kg</span>
                        <span className="text-zinc-500">PR: {ex.pr} kg</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {/* Completed indicator */}
                      <div className="text-xs font-semibold text-zinc-400 bg-zinc-900 border border-zinc-800 px-3 py-1 rounded-lg">
                        Completed: {ex.completedSets} / {ex.sets} sets
                      </div>
                      <Button
                        variant={ex.completedSets === ex.sets ? 'outline' : 'primary'}
                        size="sm"
                        onClick={() => completeSet(ex.id)}
                        disabled={ex.completedSets === ex.sets}
                      >
                        {ex.completedSets === ex.sets ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : 'Log Set'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'progress' && (
          <div className="space-y-8">
            <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/30 p-6">
              <div className="mb-6">
                <h3 className="text-lg font-bold">Weight Progress Timeline</h3>
                <p className="text-xs text-zinc-500">Track weight fluctuations over the last 30 days</p>
              </div>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={progressData}>
                    <defs>
                      <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                    <XAxis dataKey="date" stroke="#a1a1aa" fontSize={12} />
                    <YAxis domain={[70, 76]} stroke="#a1a1aa" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                    <Area type="monotone" dataKey="weight" stroke="#8b5cf6" strokeWidth={3} fillOpacity={1} fill="url(#weightGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        )}
      </main>
    </div>
  );
}
