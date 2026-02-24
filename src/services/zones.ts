import { supabase } from './supabase';
import { Zone } from '../types';

export const zonesService = {
  getNearbyZones: async (latitude: number, longitude: number, radiusMeters?: number) => {
    const { data, error } = await supabase.rpc('nearby_zones', {
      user_lat: latitude,
      user_lng: longitude,
      radius_meters: radiusMeters || 5000,
    });
    return { zones: data as Zone[] | null, error };
  },

  getNearbyUsersCount: async (latitude: number, longitude: number, radiusMeters?: number) => {
    const { data, error } = await supabase.rpc('nearby_users', {
      user_lat: latitude,
      user_lng: longitude,
      radius_meters: radiusMeters || 2000,
    });
    return { users: data, count: (data as unknown[])?.length || 0, error };
  },

  getZone: async (zoneId: string) => {
    const { data, error } = await supabase
      .from('zones')
      .select('*')
      .eq('id', zoneId)
      .single();
    return { zone: data as Zone | null, error };
  },
};
