import { supabase } from './supabase';

export const reactionsService = {
  getMessageReactions: async (messageId: string) => {
    const { data, error } = await supabase
      .from('reactions')
      .select('*')
      .eq('message_id', messageId);
    return { reactions: data, error };
  },

  addReaction: async (messageId: string, userId: string, reactionType: string = 'like') => {
    const { data, error } = await supabase
      .from('reactions')
      .insert({ message_id: messageId, user_id: userId, reaction_type: reactionType })
      .select()
      .single();
    return { reaction: data, error };
  },

  removeReaction: async (messageId: string, userId: string, reactionType: string = 'like') => {
    const { error } = await supabase
      .from('reactions')
      .delete()
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType);
    return { error };
  },

  toggleReaction: async (messageId: string, userId: string, reactionType: string = 'like') => {
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', userId)
      .eq('reaction_type', reactionType)
      .single();

    if (existing) {
      return reactionsService.removeReaction(messageId, userId, reactionType);
    } else {
      return reactionsService.addReaction(messageId, userId, reactionType);
    }
  },
};
