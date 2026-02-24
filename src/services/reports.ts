import { supabase } from './supabase';

export const reportsService = {
  reportMessage: async (
    reporterId: string,
    messageId: string,
    reportedUserId: string,
    reason: string,
    description?: string,
  ) => {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_message_id: messageId,
        reported_user_id: reportedUserId,
        reason,
        description,
      })
      .select()
      .single();
    return { report: data, error };
  },

  reportUser: async (
    reporterId: string,
    reportedUserId: string,
    reason: string,
    description?: string,
  ) => {
    const { data, error } = await supabase
      .from('reports')
      .insert({
        reporter_id: reporterId,
        reported_user_id: reportedUserId,
        reason,
        description,
      })
      .select()
      .single();
    return { report: data, error };
  },
};
