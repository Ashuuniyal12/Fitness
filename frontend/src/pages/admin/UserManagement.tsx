import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { UserPlus, Save, X } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  goal: string;
  trainer_id: string | null;
  created_at: string;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isCreating, setIsCreating] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [newUserGoal, setNewUserGoal] = useState('strength');

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editTrainerId, setEditTrainerId] = useState<string>('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const trainers = users.filter(u => u.role === 'trainer');

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
        goal: newUserGoal
      });
      setIsCreating(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  const handleAssignTrainer = async (userId: string) => {
    try {
      await api.put(`/users/${userId}`, {
        trainer_id: editTrainerId || null
      });
      setEditingUserId(null);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update user');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-maximus-text-light dark:text-maximus-text-dark">User Management</h1>
        <button 
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-maximus-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-maximus-hover transition-colors"
        >
          <UserPlus size={20} />
          Add User
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {isCreating && (
        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create New User</h2>
            <button onClick={() => setIsCreating(false)} className="text-gray-500 hover:text-maximus-accent">
              <X size={24} />
            </button>
          </div>
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input type="text" required value={newUserName} onChange={e => setNewUserName(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" required value={newUserEmail} onChange={e => setNewUserEmail(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Temporary Password</label>
              <input type="password" required minLength={6} value={newUserPassword} onChange={e => setNewUserPassword(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Role</label>
              <select value={newUserRole} onChange={e => setNewUserRole(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
                <option className="bg-white dark:bg-gray-800" value="user">Member</option>
                <option className="bg-white dark:bg-gray-800" value="trainer">Trainer</option>
                <option className="bg-white dark:bg-gray-800" value="admin">Admin</option>
              </select>
            </div>
            {newUserRole === 'user' && (
              <div>
                <label className="block text-sm font-medium mb-1">Fitness Goal</label>
                <select value={newUserGoal} onChange={e => setNewUserGoal(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
                  <option className="bg-white dark:bg-gray-800" value="strength">Strength</option>
                  <option className="bg-white dark:bg-gray-800" value="weight_loss">Weight Loss</option>
                  <option className="bg-white dark:bg-gray-800" value="muscle_gain">Muscle Gain</option>
                </select>
              </div>
            )}
            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="submit" className="bg-maximus-accent hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold">
                Create Account
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading users...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-500">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email</th>
                  <th className="py-4 px-6">Role</th>
                  <th className="py-4 px-6">Goal</th>
                  <th className="py-4 px-6">Trainer</th>
                  <th className="py-4 px-6">Joined</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                    <td className="py-4 px-6 font-medium">{user.name}</td>
                    <td className="py-4 px-6 text-gray-500">{user.email}</td>
                    <td className="py-4 px-6">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        user.role === 'admin' ? 'bg-maximus-primary/20 text-maximus-primary' : 
                        user.role === 'trainer' ? 'bg-maximus-accent/20 text-maximus-accent' :
                        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 capitalize">{user.goal ? user.goal.replace('_', ' ') : '-'}</td>
                    <td className="py-4 px-6">
                      {editingUserId === user.id && user.role === 'user' ? (
                        <select 
                          value={editTrainerId} 
                          onChange={(e) => setEditTrainerId(e.target.value)}
                          className="px-2 py-1 text-sm rounded border border-gray-300 dark:border-gray-600 bg-transparent"
                        >
                          <option value="">No Trainer</option>
                          {trainers.map(t => (
                            <option key={t.id} value={t.id} className="bg-white dark:bg-gray-800">{t.name}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-gray-500 text-sm">
                          {user.trainer_id ? trainers.find(t => t.id === user.trainer_id)?.name || 'Unknown' : 'None'}
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-gray-500 text-sm">{new Date(user.created_at).toLocaleDateString()}</td>
                    <td className="py-4 px-6 text-right">
                      {user.role === 'user' && (
                        editingUserId === user.id ? (
                          <button onClick={() => handleAssignTrainer(user.id)} className="text-green-500 hover:text-green-600 p-1">
                            <Save size={18} />
                          </button>
                        ) : (
                          <button onClick={() => { setEditingUserId(user.id); setEditTrainerId(user.trainer_id || ''); }} className="text-maximus-primary hover:text-maximus-hover text-sm font-medium">
                            Assign
                          </button>
                        )
                      )}
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-gray-500">No users found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
