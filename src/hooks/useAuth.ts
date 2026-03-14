import { useState, useEffect } from 'react';
import { AuthError, Session } from '@supabase/supabase-js';
import { authService } from '../services/auth';
import { profileService } from '../services/profile';
import { User } from '../types';

const PROFILE_RETRY_ATTEMPTS = 3;
const PROFILE_RETRY_DELAY_MS = 1000;

async function fetchProfileWithRetry(userId: string): Promise<User | null> {
  for (let attempt = 0; attempt < PROFILE_RETRY_ATTEMPTS; attempt++) {
    const { profile } = await profileService.getProfile(userId);
    if (profile) return profile;
    if (attempt < PROFILE_RETRY_ATTEMPTS - 1) {
      await new Promise((resolve) => setTimeout(resolve, PROFILE_RETRY_DELAY_MS));
    }
  }
  return null;
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<Session['user'] | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authService
      .getSession()
      .then(({ session: s }) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          return fetchProfileWithRetry(s.user.id).then((p) => setProfile(p));
        }
      })
      .catch((error) => {
        console.error('[useAuth] getSession error:', error);
      })
      .finally(() => setLoading(false));

    const { data: listener } = authService.onAuthStateChange(async (event, s) => {
      setLoading(true);
      try {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          const p = await fetchProfileWithRetry(s.user.id);
          setProfile(p);
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error('[useAuth] onAuthStateChange profile load error:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, nickname: string) => {
    setLoading(true);
    const result = await authService.signUp(email, password, nickname);
    if (result.error) {
      setLoading(false);
    }
    // on success, onAuthStateChange will fire and set loading=false
    return result;
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const result = await authService.signIn(email, password);
    if (result.error) {
      setLoading(false);
    }
    // on success, onAuthStateChange will fire and set loading=false
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
