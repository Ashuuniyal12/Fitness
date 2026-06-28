'use client';

import * as React from 'react';
import { Card, Button, Input } from '@maximus/ui';
import { formatCurrency } from '@maximus/utils';
import {
  Users, DollarSign, Calendar, TrendingUp, AlertTriangle, ArrowRight,
  TrendingDown, Check, UserPlus, ShieldAlert, Award
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'members' | 'leads'>('dashboard');

  // Dummy statistics
  const stats = [
    { label: "Today's Revenue", val: 12500, icon: DollarSign, trend: '+18% vs yesterday' },
    { label: 'Active Subscriptions', val: 342, icon: Users, trend: '+4 new today' },
    { label: 'Today\'s Attendance', val: 89, icon: Check, trend: 'High density peak: 6 PM' },
    { label: 'Pending Dues', val: 4500, icon: AlertTriangle, trend: '2 members overdue' }
  ];

  // Dummy member data
  const [members, setMembers] = React.useState([
    { id: '1', name: 'Aarav Mehta', email: 'aarav@gmail.com', role: 'MEMBER', plan: 'Elite Annual', status: 'ACTIVE' },
    { id: '2', name: 'Neha Sharma', email: 'neha@gmail.com', role: 'MEMBER', plan: 'Monthly Core', status: 'ACTIVE' },
    { id: '3', name: 'Vikram Singh', email: 'vikram@gmail.com', role: 'MEMBER', plan: 'Couple Plan', status: 'FROZEN' },
    { id: '4', name: 'Rohan Gupta', email: 'rohan@gmail.com', role: 'TRAINER', plan: 'Personal Trainer', status: 'ACTIVE' }
  ]);

  const [newMemberName, setNewMemberName] = React.useState('');
  const [newMemberEmail, setNewMemberEmail] = React.useState('');
  const [newMemberPlan, setNewMemberPlan] = React.useState('Monthly Core');

  const addMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMemberName && newMemberEmail) {
      setMembers([
        ...members,
        {
          id: String(members.length + 1),
          name: newMemberName,
          email: newMemberEmail,
          role: 'MEMBER',
          plan: newMemberPlan,
          status: 'ACTIVE'
        }
      ]);
      setNewMemberName('');
      setNewMemberEmail('');
    }
  };

  const toggleFreeze = (id: string) => {
    setMembers(members.map(m => {
      if (m.id === id) {
        return { ...m, status: m.status === 'ACTIVE' ? 'FROZEN' : 'ACTIVE' };
      }
      return m;
    }));
  };

  // Leads state
  const [leads, setLeads] = React.useState([
    { id: '1', name: 'Sanjay Kumar', phone: '9876543211', source: 'Instagram', status: 'Interested' },
    { id: '2', name: 'Pooja Patel', phone: '9876543212', source: 'Website', status: 'Follow Up' },
    { id: '3', name: 'Kabir Dev', phone: '9876543213', source: 'Walk-in', status: 'Joined' }
  ]);

  // Chart data
  const revenueData = [
    { day: 'Mon', revenue: 4000 },
    { day: 'Tue', revenue: 7500 },
    { day: 'Wed', revenue: 5000 },
    { day: 'Thu', revenue: 9000 },
    { day: 'Fri', revenue: 11000 },
    { day: 'Sat', revenue: 12500 },
    { day: 'Sun', revenue: 8000 }
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
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('members')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'members' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            Members
          </button>
          <button
            onClick={() => setActiveTab('leads')}
            className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition ${activeTab === 'leads' ? 'bg-violet-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/50'}`}
          >
            Leads pipeline
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {activeTab === 'dashboard' && 'Dashboard Overview'}
              {activeTab === 'members' && 'Member Database'}
              {activeTab === 'leads' && 'CRM Pipeline'}
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Gym Ecosystem Tenant: Core Head Office</p>
          </div>
          <div className="flex gap-4">
            <Button variant="outline" size="sm" onClick={() => window.open('http://localhost:3000', '_blank')}>View Website</Button>
          </div>
        </header>

        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            {/* Stats grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {stats.map((s, idx) => {
                const Icon = s.icon;
                return (
                  <Card key={idx} hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{s.label}</span>
                        <div className="text-2xl font-extrabold">
                          {s.label.includes('Revenue') || s.label.includes('Dues') ? formatCurrency(s.val) : s.val}
                        </div>
                      </div>
                      <div className="p-2.5 rounded-xl bg-violet-600/10 border border-violet-500/10">
                        <Icon className="w-5 h-5 text-violet-400" />
                      </div>
                    </div>
                    <div className="mt-4 text-xs font-medium text-emerald-400 flex items-center gap-1">
                      <span>{s.trend}</span>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Chart + Today's check-ins */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <Card className="lg:col-span-2 border border-zinc-900 bg-zinc-900/30 p-6 flex flex-col justify-between" hoverEffect={false}>
                <div className="mb-4">
                  <h3 className="text-lg font-bold">Revenue Timeline</h3>
                  <p className="text-xs text-zinc-500">Weekly transactions analysis</p>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenueData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
                      <XAxis dataKey="day" stroke="#a1a1aa" fontSize={12} />
                      <YAxis stroke="#a1a1aa" fontSize={12} />
                      <Tooltip contentStyle={{ backgroundColor: '#18181b', border: '1px solid #27272a' }} />
                      <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={3} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Activity log */}
              <Card className="border border-zinc-900 bg-zinc-900/30 p-6" hoverEffect={false}>
                <div className="mb-6">
                  <h3 className="text-lg font-bold">Recent Check-ins</h3>
                  <p className="text-xs text-zinc-500">Live entry activity logs</p>
                </div>
                <div className="space-y-4">
                  {[
                    { name: 'Amit Kumar', time: '10:14 PM', action: 'Scan Check-in' },
                    { name: 'Neha Sharma', time: '09:42 PM', action: 'Scan Check-out' },
                    { name: 'Aarav Mehta', time: '08:15 PM', action: 'Scan Check-in' },
                    { name: 'Vikram Singh', time: '07:30 PM', action: 'Scan Check-in' }
                  ].map((log, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-3 rounded-lg bg-zinc-950/60 border border-zinc-900">
                      <div>
                        <div className="font-semibold text-zinc-100">{log.name}</div>
                        <div className="text-[10px] uppercase font-bold text-violet-400 mt-0.5">{log.action}</div>
                      </div>
                      <span className="text-xs text-zinc-400">{log.time}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="space-y-8">
            {/* Create member */}
            <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-violet-400" /> Enroll New Member
              </h3>
              <form onSubmit={addMember} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                <Input
                  label="Full Name"
                  placeholder="e.g. John Doe"
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  required
                />
                <Input
                  label="Email"
                  placeholder="e.g. john@domain.com"
                  type="email"
                  value={newMemberEmail}
                  onChange={(e) => setNewMemberEmail(e.target.value)}
                  required
                />
                <div className="space-y-1.5 w-full">
                  <label className="block text-sm font-medium text-neutral-400">Membership Plan</label>
                  <select
                    className="w-full rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-2.5 text-neutral-100 focus:border-violet-500 focus:outline-none"
                    value={newMemberPlan}
                    onChange={(e) => setNewMemberPlan(e.target.value)}
                  >
                    <option value="Monthly Core">Monthly Core</option>
                    <option value="Elite Annual">Elite Annual</option>
                    <option value="Couple Plan">Couple Plan</option>
                  </select>
                </div>
                <Button type="submit" variant="primary">Add Member</Button>
              </form>
            </Card>

            {/* List */}
            <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="text-xs uppercase font-bold text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-4 px-4">Name</th>
                      <th className="py-4 px-4">Email</th>
                      <th className="py-4 px-4">Plan Type</th>
                      <th className="py-4 px-4">Role</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {members.map((m) => (
                      <tr key={m.id} className="hover:bg-zinc-900/20">
                        <td className="py-4 px-4 font-semibold text-white">{m.name}</td>
                        <td className="py-4 px-4 text-zinc-400">{m.email}</td>
                        <td className="py-4 px-4">{m.plan}</td>
                        <td className="py-4 px-4 text-xs font-bold text-violet-400">{m.role}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${m.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                            {m.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right space-x-2">
                          <Button variant="outline" size="sm" onClick={() => toggleFreeze(m.id)}>
                            {m.status === 'ACTIVE' ? 'Freeze' : 'Unfreeze'}
                          </Button>
                          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">Delete</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'leads' && (
          <Card hoverEffect={false} className="border border-zinc-900 bg-zinc-900/40">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-bold">Inbound CRM Pipeline</h3>
                <p className="text-xs text-zinc-500">Manage leads captured via website widget</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-zinc-300">
                  <thead className="text-xs uppercase font-bold text-zinc-500 border-b border-zinc-800">
                    <tr>
                      <th className="py-4 px-4">Lead Name</th>
                      <th className="py-4 px-4">Contact Phone</th>
                      <th className="py-4 px-4">Channel Source</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800">
                    {leads.map((l) => (
                      <tr key={l.id} className="hover:bg-zinc-900/20">
                        <td className="py-4 px-4 font-semibold text-white">{l.name}</td>
                        <td className="py-4 px-4 text-zinc-400">{l.phone}</td>
                        <td className="py-4 px-4 text-xs font-bold text-zinc-500">{l.source}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${l.status === 'Joined' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-violet-500/10 text-violet-400 border border-violet-500/20'}`}>
                            {l.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <Button variant="outline" size="sm">Follow Up</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        )}
      </main>
    </div>
  );
}
