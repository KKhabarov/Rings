import { useState, useEffect } from 'react';
import { AuthError, Session } from '@supabase/supabase-js';
import { authService } from '../services/auth';
import { profileService } from '../services/profile';
import { User } from '../types';

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService.getSession().then(({ session: s }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        profileService.getProfile(s.user.id).then(({ profile: p }) => setProfile(p));
      }
      setLoading(false);
    });

    const { data: listener } = authService.onAuthStateChange(async (event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        const { profile: p } = await profileService.getProfile(s.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, nickname: string) => {
    setLoading(true);
    const result = await authService.signUp(email, password, nickname);
    setLoading(false);
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    setLoading(false);
    return result;
  };

  const signOut = async () => {
    setLoading(true);
    const result = await authService.signOut();
    setLoading(false);
    return result;
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!user) return { data: null, profile: null, error: new AuthError('Not authenticated') };
    const result = await profileService.updateProfile(user.id, updates);
    if (result.profile) setProfile(result.profile);
    return result;
  };

  return { session, user, profile, loading, signUp, signIn, signOut, updateProfile };
}
