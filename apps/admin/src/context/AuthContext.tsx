"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { supabase } from '../lib/supabase';

interface UserProfile {
  id: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'TRAINER' | 'RECEPTIONIST' | 'MEMBER' | 'GUEST';
  gymId?: string;
  profile?: {
    name: string;
    phone?: string;
    photoUrl?: string;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  logout: () => Promise<void>;
  fetchBackendUser: (userId: string, jwtToken: string) => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchBackendUser = async (userId: string, jwtToken: string): Promise<UserProfile | null> => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/users/${userId}`, {
        headers: {
          'Authorization': `Bearer ${jwtToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        return data as UserProfile;
      }
    } catch (err) {
      console.error("Failed to fetch backend profile:", err);
    }
    return null;
  };

  useEffect(() => {
    // 1. Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session && session.user) {
        setToken(session.access_token);
        const backendProfile = await fetchBackendUser(session.user.id, session.access_token);
        
        if (backendProfile) {
          // If a member logs in to the admin dashboard, redirect them to member portal
          if (backendProfile.role === 'MEMBER') {
            window.location.href = process.env.NEXT_PUBLIC_MEMBER_PORTAL_URL || 'https://maximus-fitness-member.vercel.app/';
            return;
          }
          setUser(backendProfile);
        }
      } else {
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && session.user) {
        setToken(session.access_token);
        const backendProfile = await fetchBackendUser(session.user.id, session.access_token);
        if (backendProfile) {
          if (backendProfile.role === 'MEMBER') {
            window.location.href = process.env.NEXT_PUBLIC_MEMBER_PORTAL_URL || 'https://maximus-fitness-member.vercel.app/';
            return;
          }
          setUser(backendProfile);
          if (pathname === '/login') {
            router.push('/');
          }
        }
      } else {
        setUser(null);
        setToken(null);
        if (pathname !== '/login') {
          router.push('/login');
        }
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setToken(null);
    router.push('/login');
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, logout, fetchBackendUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
