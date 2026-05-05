import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FileText, Plus, X, ShieldAlert, ShieldCheck } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Subscription {
  id: string;
  user_id: string;
  plan_type: string;
  start_date: string;
  end_date: string;
  status: string;
  users: {
    name: string;
    email: string;
  };
}

export default function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAssigning, setIsAssigning] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedPlan, setSelectedPlan] = useState('1 Month');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [subsRes, usersRes] = await Promise.all([
        api.get('/subscriptions'),
        api.get('/users')
      ]);
      setSubscriptions(subsRes.data);
      // Only show users with role 'user' for subscriptions
      setUsers(usersRes.data.filter((u: any) => u.role === 'user'));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/subscriptions', {
        user_id: selectedUserId,
        plan_type: selectedPlan
      });
      setIsAssigning(false);
      setSelectedUserId('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to assign subscription');
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    try {
      await api.put(`/subscriptions/${id}/status`, { status: newStatus });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-maximus-text-light dark:text-maximus-text-dark">Subscriptions</h1>
        <button 
          onClick={() => setIsAssigning(true)}
          className="flex items-center gap-2 bg-maximus-primary text-white px-4 py-2 rounded-lg font-bold hover:bg-maximus-hover transition-colors"
        >
          <Plus size={20} />
          Assign Plan
        </button>
      </div>

      {error && <div className="p-4 bg-red-100 text-red-700 rounded-lg">{error}</div>}

      {isAssigning && (
        <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Assign Subscription Plan</h2>
            <button onClick={() => setIsAssigning(false)} className="text-gray-500 hover:text-maximus-accent">
              <X size={24} />
            </button>
          </div>
          <p className="text-sm text-gray-500 mb-6">Payment is handled offline. Assigning a plan here grants the member system access for the specified duration.</p>
          <form onSubmit={handleAssign} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Member</label>
              <select required value={selectedUserId} onChange={e => setSelectedUserId(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
                <option value="" disabled>Select a member...</option>
                {users.map(u => (
                  <option key={u.id} value={u.id} className="bg-white dark:bg-gray-800">{u.name} ({u.email})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Plan Duration</label>
              <select value={selectedPlan} onChange={e => setSelectedPlan(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent">
                <option className="bg-white dark:bg-gray-800" value="1 Month">1 Month</option>
                <option className="bg-white dark:bg-gray-800" value="3 Months">3 Months</option>
                <option className="bg-white dark:bg-gray-800" value="6 Months">6 Months</option>
                <option className="bg-white dark:bg-gray-800" value="1 Year">1 Year</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end mt-4">
              <button type="submit" className="bg-maximus-accent hover:bg-yellow-500 text-black px-6 py-2 rounded-lg font-bold">
                Assign & Activate
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading subscriptions...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-500">
                  <th className="py-4 px-6">Member</th>
                  <th className="py-4 px-6">Plan</th>
                  <th className="py-4 px-6">Start Date</th>
                  <th className="py-4 px-6">Expiry Date</th>
                  <th className="py-4 px-6">Status / Access</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((sub) => {
                  const isExpired = new Date(sub.end_date) < new Date();
                  const effectiveStatus = isExpired ? 'expired' : sub.status;
                  
                  return (
                    <tr key={sub.id} className="border-b border-gray-100 dark:border-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800/20">
                      <td className="py-4 px-6">
                        <div className="font-medium">{sub.users?.name || 'Unknown'}</div>
                        <div className="text-sm text-gray-500">{sub.users?.email}</div>
                      </td>
                      <td className="py-4 px-6 font-medium text-maximus-primary">{sub.plan_type}</td>
                      <td className="py-4 px-6 text-gray-500">{new Date(sub.start_date).toLocaleDateString()}</td>
                      <td className={`py-4 px-6 font-medium ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                        {new Date(sub.end_date).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`flex w-fit items-center gap-1 px-2 py-1 rounded text-xs font-semibold ${
                          effectiveStatus === 'active' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 
                          effectiveStatus === 'expired' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                          'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        }`}>
                          {effectiveStatus === 'active' ? <ShieldCheck size={14} /> : <ShieldAlert size={14} />}
                          {effectiveStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => toggleStatus(sub.id, sub.status)}
                          className={`text-sm font-medium px-3 py-1 rounded border ${
                            sub.status === 'active' 
                              ? 'border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:hover:bg-red-900/20' 
                              : 'border-green-200 text-green-600 hover:bg-green-50 dark:border-green-900/50 dark:hover:bg-green-900/20'
                          }`}
                        >
                          {sub.status === 'active' ? 'Disable Access' : 'Enable Access'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
                {subscriptions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-gray-500">No subscriptions found.</td>
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
