import { supabase } from './supabase';
import { User } from '../types';

export const profileService = {
  getProfile: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return { profile: data as User | null, error };
  },

  updateProfile: async (userId: string, updates: Partial<User>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId)
      .select()
      .single();
    return { profile: data as User | null, error };
  },

  updateLocation: async (userId: string, latitude: number, longitude: number) => {
    const { error } = await supabase.rpc('update_user_location', {
      user_id: userId,
      lat: latitude,
      lng: longitude,
    });
    return { error };
  },
};
