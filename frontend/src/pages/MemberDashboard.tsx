import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MemberDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="bg-maximus-primary/10 border border-maximus-primary/20 p-6 rounded-xl">
        <h2 className="text-2xl font-bold text-maximus-accent mb-2">Ready to crush it today?</h2>
        <p className="text-gray-700 dark:text-gray-300">Your next scheduled class is CrossFit WOD at 6:00 PM.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/member/workouts/strength')}
          className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-maximus-primary transition-colors cursor-pointer group"
        >
          <div className="w-12 h-12 bg-maximus-primary/20 text-maximus-primary rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6.5 6.5 11 11"/><path d="m21 21-1-1"/><path d="m3 3 1 1"/><path d="m18 22 4-4"/><path d="m2 6 4-4"/><path d="m3 10 7-7"/><path d="m14 21 7-7"/></svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Strength Log</h3>
          <p className="text-sm text-gray-500">Record your sets, reps, and track progressive overload.</p>
        </div>

        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-maximus-primary transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-maximus-accent/20 text-maximus-accent rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">WOD Timer</h3>
          <p className="text-sm text-gray-500">Access AMRAP, EMOM, and For Time digital timers.</p>
        </div>

        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 hover:border-maximus-primary transition-colors cursor-pointer group">
          <div className="w-12 h-12 bg-maximus-light/20 text-maximus-light rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
          </div>
          <h3 className="font-semibold text-lg mb-1">Yoga Booking</h3>
          <p className="text-sm text-gray-500">Reserve your spot on the interactive studio map.</p>
        </div>
      </div>
    </div>
  );
}
