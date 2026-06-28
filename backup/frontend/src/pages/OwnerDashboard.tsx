import React, { useEffect, useState } from 'react';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  goal: string;
  created_at: string;
}

export default function OwnerDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/users');
        setUsers(response.data);
      } catch (err: any) {
        // Handle error (could be 401 if they didn't run the SQL script)
        setError(err.response?.data?.error || 'Failed to fetch users from database. Did you run the init.sql script?');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Total Active Members</h3>
          <p className="text-3xl font-bold text-maximus-primary">{users.length || 0}</p>
        </div>
        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Monthly Revenue (MRR)</h3>
          <p className="text-3xl font-bold text-maximus-accent">$18,450</p>
        </div>
        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Classes Today</h3>
          <p className="text-3xl font-bold text-maximus-light">8</p>
        </div>
      </div>

      <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
        <h2 className="text-xl font-semibold mb-4">Today's Schedule</h2>
        <div className="space-y-4">
          {[
            { time: '06:00 AM', name: 'CrossFit WOD', instructor: 'Mike T.' },
            { time: '08:00 AM', name: 'Vinyasa Yoga', instructor: 'Sarah J.' },
            { time: '12:00 PM', name: 'Strength Foundations', instructor: 'Alex R.' },
          ].map((cls, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <div className="flex items-center gap-4">
                <span className="font-semibold text-maximus-primary w-20">{cls.time}</span>
                <span className="font-medium">{cls.name}</span>
              </div>
              <span className="text-sm text-gray-500">{cls.instructor}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
