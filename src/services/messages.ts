import { supabase } from './supabase';

export const messagesService = {
  getZoneMessages: async (
    zoneId: string,
    subchannel: string = 'general',
    limit: number = 50,
    offset: number = 0,
  ) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*, profiles:user_id(nickname, avatar_url, ring, karma)')
      .eq('zone_id', zoneId)
      .eq('subchannel', subchannel)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    return { messages: data, error };
  },

  sendMessage: async (
    userId: string,
    zoneId: string,
    text: string,
    subchannel: string = 'general',
    location?: { latitude: number; longitude: number },
  ) => {
    const messageData: Record<string, unknown> = {
      user_id: userId,
      zone_id: zoneId,
      text: text.trim(),
      subchannel,
    };
    if (location) {
      const lat = Math.max(-90, Math.min(90, location.latitude));
      const lon = Math.max(-180, Math.min(180, location.longitude));
      messageData.location = `POINT(${lon} ${lat})`;
    }
    const { data, error } = await supabase
      .from('messages')
      .insert(messageData)
      .select('*, profiles:user_id(nickname, avatar_url, ring, karma)')
      .single();
    return { message: data, error };
  },

  deleteMessage: async (messageId: string) => {
    const { error } = await supabase.from('messages').delete().eq('id', messageId);
    return { error };
  },

  subscribeToZoneMessages: (
    zoneId: string,
    subchannel: string = 'general',
    onMessage: (message: Record<string, unknown>) => void,
  ) => {
    const channel = supabase
      .channel(`zone-${zoneId}-${subchannel}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `zone_id=eq.${zoneId}`,
        },
        (payload) => {
          const newMsg = payload.new as Record<string, unknown>;
          if (newMsg.subchannel === subchannel) {
            onMessage(newMsg);
          }
        },
      )
      .subscribe();

    return channel;
  },

  unsubscribeFromZone: (channel: ReturnType<typeof supabase.channel>) => {
    supabase.removeChannel(channel);
  },
};
