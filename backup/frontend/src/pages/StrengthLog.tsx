import React, { useState, useMemo } from 'react';
import { RestTimer } from '../components/RestTimer';
import { WorkoutChart } from '../components/WorkoutChart';
import { calculateEpley1RM, calculateSetVolume } from '../utils/metrics';
import { Plus, Trash2, CheckCircle2 } from 'lucide-react';

interface SetData {
  id: string;
  weight: number;
  reps: number;
  rpe: number;
  type: 'Warmup' | 'Normal' | 'Drop' | 'Failure';
  completed: boolean;
}

// Dummy historical data for the chart
const historicalVolume = [
  { date: 'Mon', volume: 3200 },
  { date: 'Wed', volume: 3800 },
  { date: 'Fri', volume: 4100 },
  { date: 'Today', volume: 0 },
];

export default function StrengthLog() {
  const [exerciseName, setExerciseName] = useState('Back Squat');
  const [sets, setSets] = useState<SetData[]>([
    { id: '1', weight: 135, reps: 10, rpe: 6, type: 'Warmup', completed: true },
    { id: '2', weight: 225, reps: 8, rpe: 7, type: 'Normal', completed: false },
  ]);

  const handleAddSet = () => {
    const lastSet = sets[sets.length - 1];
    setSets([
      ...sets,
      {
        id: Date.now().toString(),
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 0,
        rpe: lastSet ? lastSet.rpe : 7,
        type: 'Normal',
        completed: false,
      }
    ]);
  };

  const handleUpdateSet = (id: string, field: keyof SetData, value: any) => {
    setSets(sets.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const handleRemoveSet = (id: string) => {
    setSets(sets.filter(s => s.id !== id));
  };

  // Calculations based on COMPLETED sets
  const completedSets = sets.filter(s => s.completed);
  
  const currentVolume = useMemo(() => {
    return completedSets.reduce((total, s) => total + calculateSetVolume(Number(s.weight) || 0, Number(s.reps) || 0), 0);
  }, [completedSets]);

  const estimated1RM = useMemo(() => {
    if (completedSets.length === 0) return 0;
    // Find the set that gives the highest 1RM
    let max1RM = 0;
    completedSets.forEach(s => {
      const rm = calculateEpley1RM(Number(s.weight) || 0, Number(s.reps) || 0);
      if (!isNaN(rm) && rm > max1RM) max1RM = rm;
    });
    return max1RM;
  }, [completedSets]);

  // Update chart data with current session volume
  const chartData = useMemo(() => {
    const data = historicalVolume.map(item => ({ ...item }));
    data[data.length - 1].volume = currentVolume || 0;
    return data;
  }, [currentVolume]);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-maximus-text-light dark:text-maximus-text-dark mb-1">Strength Log</h1>
          <p className="text-gray-500">Track your progressive overload.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Logging */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">Exercise</label>
              <select 
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                className="w-full md:w-1/2 px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-maximus-primary outline-none font-semibold text-lg"
              >
                <option value="Back Squat">Back Squat</option>
                <option value="Bench Press">Bench Press</option>
                <option value="Deadlift">Deadlift</option>
                <option value="Overhead Press">Overhead Press</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-500">
                    <th className="pb-3 w-12 text-center">Set</th>
                    <th className="pb-3 w-32">Type</th>
                    <th className="pb-3 w-24">lbs</th>
                    <th className="pb-3 w-24">Reps</th>
                    <th className="pb-3 w-24">RPE</th>
                    <th className="pb-3 w-16 text-center">Done</th>
                    <th className="pb-3 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {sets.map((set, index) => (
                    <tr key={set.id} className={`border-b border-gray-100 dark:border-gray-800/50 transition-colors ${set.completed ? 'bg-maximus-primary/5 dark:bg-maximus-primary/10' : ''}`}>
                      <td className="py-4 text-center font-medium text-gray-500">{index + 1}</td>
                      <td className="py-4 pr-4">
                        <select 
                          value={set.type} 
                          onChange={(e) => handleUpdateSet(set.id, 'type', e.target.value)}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-maximus-primary outline-none py-1"
                        >
                          <option value="Warmup">Warmup</option>
                          <option value="Normal">Normal</option>
                          <option value="Drop">Drop Set</option>
                          <option value="Failure">Failure</option>
                        </select>
                      </td>
                      <td className="py-4 pr-4">
                        <input 
                          type="number" 
                          value={set.weight} 
                          onChange={(e) => handleUpdateSet(set.id, 'weight', Number(e.target.value))}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-maximus-primary outline-none py-1 text-center"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input 
                          type="number" 
                          value={set.reps} 
                          onChange={(e) => handleUpdateSet(set.id, 'reps', Number(e.target.value))}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-maximus-primary outline-none py-1 text-center"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input 
                          type="number" 
                          max="10" min="1"
                          value={set.rpe} 
                          onChange={(e) => handleUpdateSet(set.id, 'rpe', Number(e.target.value))}
                          className="w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-maximus-primary outline-none py-1 text-center"
                        />
                      </td>
                      <td className="py-4 text-center">
                        <button 
                          onClick={() => handleUpdateSet(set.id, 'completed', !set.completed)}
                          className={`p-1 rounded-full transition-colors ${set.completed ? 'text-green-500' : 'text-gray-300 dark:text-gray-600 hover:text-green-400'}`}
                        >
                          <CheckCircle2 size={24} />
                        </button>
                      </td>
                      <td className="py-4 text-right">
                        <button 
                          onClick={() => handleRemoveSet(set.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button 
              onClick={handleAddSet}
              className="mt-6 flex items-center justify-center w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg text-gray-500 hover:text-maximus-primary hover:border-maximus-primary transition-colors font-medium"
            >
              <Plus size={20} className="mr-2" /> Add Set
            </button>
          </div>
        </div>

        {/* Right Column: Timers & Stats */}
        <div className="space-y-6">
          <RestTimer defaultSeconds={90} />

          <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-4">Session Metrics</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end border-b border-gray-100 dark:border-gray-800 pb-4">
                <span className="text-gray-600 dark:text-gray-400">Est. 1RM (Epley)</span>
                <span className="text-2xl font-bold text-maximus-primary">{estimated1RM} <span className="text-sm font-normal text-gray-500">lbs</span></span>
              </div>
              <div className="flex justify-between items-end pb-2">
                <span className="text-gray-600 dark:text-gray-400">Total Volume</span>
                <span className="text-2xl font-bold text-maximus-accent">{currentVolume.toLocaleString()} <span className="text-sm font-normal text-gray-500">lbs</span></span>
              </div>
            </div>
          </div>

          <WorkoutChart data={chartData} />
        </div>
      </div>
    </div>
  );
}
