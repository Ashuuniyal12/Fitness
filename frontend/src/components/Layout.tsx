import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { LogOut, User, Users, Activity, Calendar, LayoutDashboard, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface LayoutProps {
  role: 'owner' | 'member';
}

export function Layout({ role }: LayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = role === 'owner' ? [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/owner/dashboard' },
    { name: 'User Management', icon: Users, path: '/owner/users' },
    { name: 'Subscriptions', icon: FileText, path: '/owner/subscriptions' },
    { name: 'Schedule', icon: Calendar, path: '/owner/schedule' },
  ] : [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/member/dashboard' },
    { name: 'Strength Log', icon: Activity, path: '/member/workouts/strength' },
    { name: 'Classes', icon: Calendar, path: '/member/classes' },
  ];

  return (
    <div className="flex h-screen bg-maximus-background-light dark:bg-maximus-background-dark text-maximus-text-light dark:text-maximus-text-dark">
      {/* Sidebar */}
      <aside className="w-64 bg-maximus-surface-light dark:bg-maximus-surface-dark border-r border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-6 flex flex-col items-center border-b border-gray-200 dark:border-gray-800">
          <img src="/logo.png" alt="Maximus Fitness" className="w-16 h-16 rounded-full mb-3 shadow-sm object-cover" />
          <h2 className="text-xl font-bold text-maximus-primary">Maximus</h2>
          <span className="text-xs text-gray-500 uppercase tracking-widest mt-1">{role} Portal</span>
        </div>
        
        <nav className="flex-1 py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.name}>
                <Link
                  to={item.path}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-maximus-primary/10 text-gray-700 dark:text-gray-300 hover:text-maximus-primary transition-colors"
                >
                  <item.icon size={20} />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button 
            onClick={handleLogout}
            className="flex w-full items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
          >
            <LogOut size={20} />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-8 bg-maximus-surface-light dark:bg-maximus-surface-dark border-b border-gray-200 dark:border-gray-800">
          <h1 className="text-xl font-semibold">Welcome back!</h1>
          <ThemeToggle />
        </header>
        <div className="flex-1 overflow-auto p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
