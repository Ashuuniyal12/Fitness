import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

interface RestTimerProps {
  defaultSeconds?: number;
}

export function RestTimer({ defaultSeconds = 90 }: RestTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(defaultSeconds);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((seconds) => seconds - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      setIsActive(false);
      // Optional: Play a sound when timer finishes
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, secondsLeft]);

  const toggle = () => setIsActive(!isActive);
  
  const reset = () => {
    setIsActive(false);
    setSecondsLeft(defaultSeconds);
  };

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const adjustTime = (amount: number) => {
    setSecondsLeft(prev => Math.max(0, prev + amount));
  };

  return (
    <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark border border-gray-200 dark:border-gray-800 rounded-xl p-4 flex flex-col items-center">
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-widest mb-2">Rest Timer</h3>
      <div className="text-4xl font-bold font-mono mb-4 text-maximus-text-light dark:text-maximus-text-dark">
        {formatTime(secondsLeft)}
      </div>
      
      <div className="flex gap-4 mb-4">
        <button onClick={() => adjustTime(-15)} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">-15s</button>
        <button onClick={() => adjustTime(15)} className="px-2 py-1 text-sm bg-gray-100 dark:bg-gray-800 rounded hover:bg-gray-200 dark:hover:bg-gray-700">+15s</button>
      </div>

      <div className="flex gap-3">
        <button 
          onClick={toggle}
          className={`flex items-center justify-center p-3 rounded-full ${isActive ? 'bg-maximus-accent text-white' : 'bg-maximus-primary text-white hover:bg-maximus-hover'}`}
        >
          {isActive ? <Pause size={20} /> : <Play size={20} />}
        </button>
        <button 
          onClick={reset}
          className="flex items-center justify-center p-3 rounded-full bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-700"
        >
          <RotateCcw size={20} />
        </button>
      </div>
    </div>
  );
}
