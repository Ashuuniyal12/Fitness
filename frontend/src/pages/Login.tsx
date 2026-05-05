import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      login(token, user);
      
      if (user.role === 'admin') {
        navigate('/owner/dashboard');
      } else {
        navigate('/member/dashboard');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-maximus-background-light dark:bg-maximus-background-dark text-maximus-text-light dark:text-maximus-text-dark relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <div className="bg-maximus-surface-light dark:bg-maximus-surface-dark p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8 flex flex-col items-center">
          <img src="/logo.png" alt="Maximus Fitness Logo" className="w-24 h-24 mb-4 rounded-full object-cover shadow-sm" />
          <h1 className="text-3xl font-bold text-maximus-primary mb-2">Maximus Fitness</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        {error && <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input 
              type="text" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-maximus-primary focus:border-transparent outline-none"
              placeholder="admin"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input 
              type="password" 
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-transparent focus:ring-2 focus:ring-maximus-primary focus:border-transparent outline-none"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-maximus-primary hover:bg-maximus-hover dark:hover:bg-maximus-light text-white font-bold rounded-lg transition-colors"
          >
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-sm text-center text-gray-500 mb-4">Demo Navigation (Bypasses Auth for Testing)</p>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/owner/dashboard')}
              className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Owner Portal
            </button>
            <button 
              onClick={() => navigate('/member/dashboard')}
              className="flex-1 py-2 px-4 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-sm font-medium rounded-lg transition-colors"
            >
              Member Portal
            </button>
          </div>
        </div>

        <div className="mt-6 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm text-maximus-accent hover:underline"
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
