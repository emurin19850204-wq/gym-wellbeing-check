'use client';

// ============================================
// 認証コンテキスト（Supabase対応版）
// ============================================

import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { User } from '@/lib/types';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { authService, profileService } from '@/lib/data-service';
import { MOCK_USERS, MOCK_TRAINERS, MOCK_ADMINS } from '@/lib/mock-store';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  getUserById: (id: string) => Promise<User | undefined>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初回ロード時にセッション復元
  useEffect(() => {
    const restoreSession = async () => {
      if (isSupabaseConfigured && supabase) {
        const currentUser = await authService.getCurrentUser();
        if (currentUser) {
          setUser(currentUser);
        }
      }
      setIsLoading(false);
    };
    restoreSession();
  }, []);

  // Supabase認証状態変更リスナー
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await profileService.getProfile(session.user.id);
          setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const foundUser = await authService.login(email, password);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const getAllUsers = useCallback(async () => {
    return profileService.getAllMembers();
  }, []);

  const getUserById = useCallback(async (id: string) => {
    const profile = await profileService.getProfile(id);
    return profile || undefined;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated: !!user, isLoading, login, logout, getAllUsers, getUserById }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
