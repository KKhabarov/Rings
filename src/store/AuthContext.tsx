import React, { createContext, useContext } from 'react';
import { AuthError, Session } from '@supabase/supabase-js';
import { useAuth } from '../hooks/useAuth';
import { User } from '../types';

interface AuthResult {
  data?: unknown;
  error: AuthError | Error | null;
}

interface AuthContextValue {
  session: Session | null;
  user: Session['user'] | null;
  profile: User | null;
  loading: boolean;
  signUp: (email: string, password: string, nickname: string) => Promise<AuthResult>;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signOut: () => Promise<AuthResult>;
  updateProfile: (updates: Partial<User>) => Promise<AuthResult>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuthContext must be used within AuthProvider');
  return ctx;
}
