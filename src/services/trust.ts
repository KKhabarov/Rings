import { supabase } from './supabase';
import { RingLevel } from '../types';

// Limits per ring level
export const RING_LIMITS = {
  [RingLevel.Guest]: {
    messagesPerHour: 10,
    canSendDM: false,
    canCreateZone: false,
    canCreatePermanentZone: false,
    maxActiveZones: 0,
  },
  [RingLevel.Local]: {
    messagesPerHour: 60,
    canSendDM: true,
    canCreateZone: false,
    canCreatePermanentZone: false,
    maxActiveZones: 0,
  },
  [RingLevel.Resident]: {
    messagesPerHour: 120,
    canSendDM: true,
    canCreateZone: true,
    canCreatePermanentZone: false,
    maxActiveZones: 1,
  },
  [RingLevel.OldTimer]: {
    messagesPerHour: 300,
    canSendDM: true,
    canCreateZone: true,
    canCreatePermanentZone: true,
    maxActiveZones: 3,
  },
  [RingLevel.Guardian]: {
    messagesPerHour: 1000,
    canSendDM: true,
    canCreateZone: true,
    canCreatePermanentZone: true,
    maxActiveZones: -1, // unlimited
  },
} as const;

// Requirements per ring level
export const RING_REQUIREMENTS = {
  [RingLevel.Guest]: { activeDays: 0, karma: 0, phone: false },
  [RingLevel.Local]: { activeDays: 3, karma: 0, phone: true },
  [RingLevel.Resident]: { activeDays: 14, karma: 50, phone: true },
  [RingLevel.OldTimer]: { activeDays: 60, karma: 200, phone: true },
  [RingLevel.Guardian]: { activeDays: 180, karma: 1000, phone: true },
} as const;

export const trustService = {
  // Check message rate limit
  checkMessageRateLimit: async (userId: string): Promise<{ allowed: boolean; remaining: number }> => {
    const { data, error } = await supabase.rpc('check_message_rate_limit', {
      sender_id: userId,
    });
    if (error) return { allowed: false, remaining: 0 };
    return { allowed: data === true, remaining: 0 };
  },

  // Get karma log
  getKarmaLog: async (userId: string, limit: number = 20) => {
    const { data, error } = await supabase
      .from('karma_log')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    return { log: data, error };
  },

  // Increment active_days (call on app launch)
  incrementActiveDay: async (userId: string) => {
    const { error } = await supabase.rpc('increment_active_day', {
      target_user_id: userId,
    });
    return { error };
  },

  // Check if user has an active ban
  checkBanStatus: async (userId: string, zoneId?: string) => {
    let query = supabase
      .from('user_bans')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .or('expires_at.is.null,expires_at.gt.' + new Date().toISOString());

    if (zoneId) {
      query = query.or(`zone_id.is.null,zone_id.eq.${zoneId}`);
    }

    const { data, error } = await query;
    return {
      isBanned: (data && data.length > 0) || false,
      bans: data,
      error,
    };
  },

  // Get progress towards next ring
  getRingProgress: (profile: {
    active_days: number;
    karma: number;
    phone?: string;
    ring: RingLevel;
  }) => {
    if (profile.ring >= RingLevel.Guardian) {
      return { nextRing: null, progress: null, overallProgress: 1 };
    }

    const nextRing = (profile.ring + 1) as RingLevel;
    const requirements = RING_REQUIREMENTS[nextRing];

    const progress = {
      activeDays: {
        current: profile.active_days,
        required: requirements.activeDays,
        met: profile.active_days >= requirements.activeDays,
      },
      karma: {
        current: profile.karma,
        required: requirements.karma,
        met: profile.karma >= requirements.karma,
      },
      phone: {
        current: !!profile.phone,
        required: requirements.phone,
        met: !requirements.phone || !!profile.phone,
      },
    };

    const metCount = [progress.activeDays.met, progress.karma.met, progress.phone.met].filter(Boolean).length;

    return { nextRing, progress, overallProgress: metCount / 3 };
  },

  // Subscribe to a zone
  subscribeToZone: async (userId: string, zoneId: string) => {
    const { data, error } = await supabase
      .from('zone_subscriptions')
      .insert({ user_id: userId, zone_id: zoneId })
      .select()
      .single();
    return { subscription: data, error };
  },

  // Unsubscribe from a zone
  unsubscribeFromZone: async (userId: string, zoneId: string) => {
    const { error } = await supabase
      .from('zone_subscriptions')
      .delete()
      .eq('user_id', userId)
      .eq('zone_id', zoneId);
    return { error };
  },

  // Get all zone subscriptions for a user
  getZoneSubscriptions: async (userId: string) => {
    const { data, error } = await supabase
      .from('zone_subscriptions')
      .select('*, zones(*)')
      .eq('user_id', userId);
    return { subscriptions: data, error };
  },
};
