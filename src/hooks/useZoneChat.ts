import { useState, useEffect, useCallback, useRef } from 'react';
import { messagesService } from '../services/messages';
import { useAuthContext } from '../store/AuthContext';
import { MessageWithAuthor } from '../types';

const PAGE_SIZE = 50;

interface UseZoneChatResult {
  messages: MessageWithAuthor[];
  loading: boolean;
  sending: boolean;
  error: string | null;
  sendMessage: (text: string) => Promise<void>;
  loadMore: () => Promise<void>;
  hasMore: boolean;
}

export function useZoneChat(
  zoneId: string | null,
  subchannel: string = 'general',
): UseZoneChatResult {
  const { user } = useAuthContext();
  const [messages, setMessages] = useState<MessageWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const offsetRef = useRef(0);
  const channelRef = useRef<ReturnType<typeof messagesService.subscribeToZoneMessages> | null>(
    null,
  );

  const mapRow = (row: Record<string, unknown>): MessageWithAuthor => {
    const profiles = row.profiles as
      | { nickname: string; avatar_url?: string; ring: number; karma: number }
      | null;
    return {
      id: row.id as string,
      user_id: row.user_id as string,
      zone_id: row.zone_id as string,
      text: row.text as string,
      created_at: row.created_at as string,
      reactions: (row.reactions as Record<string, number>) ?? {},
      subchannel: (row.subchannel as string) ?? subchannel,
      author: {
        nickname: profiles?.nickname ?? 'Unknown',
        avatar_url: profiles?.avatar_url,
        ring: (profiles?.ring ?? 0) as MessageWithAuthor['author']['ring'],
        karma: profiles?.karma ?? 0,
      },
    };
  };

  const loadMessages = useCallback(
    async (reset: boolean = false) => {
      if (!zoneId) return;
      setLoading(true);
      setError(null);
      const offset = reset ? 0 : offsetRef.current;
      const { messages: data, error: err } = await messagesService.getZoneMessages(
        zoneId,
        subchannel,
        PAGE_SIZE,
        offset,
      );
      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }
      const rows = (data ?? []) as Record<string, unknown>[];
      const mapped = rows.map(mapRow);
      if (reset) {
        setMessages(mapped);
        offsetRef.current = mapped.length;
      } else {
        setMessages((prev) => [...prev, ...mapped]);
        offsetRef.current = offset + mapped.length;
      }
      setHasMore(rows.length === PAGE_SIZE);
      setLoading(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [zoneId, subchannel],
  );

  useEffect(() => {
    if (!zoneId) {
      setMessages([]);
      return;
    }

    loadMessages(true);

    channelRef.current = messagesService.subscribeToZoneMessages(
      zoneId,
      subchannel,
      (newMsg) => {
        const mapped = mapRow(newMsg);
        setMessages((prev) => {
          if (prev.some((m) => m.id === mapped.id)) return prev;
          return [mapped, ...prev];
        });
      },
    );

    return () => {
      if (channelRef.current) {
        messagesService.unsubscribeFromZone(channelRef.current);
        channelRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zoneId, subchannel]);

  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !zoneId || !text.trim()) return;
      setSending(true);
      setError(null);
      const { error: err } = await messagesService.sendMessage(
        user.id,
        zoneId,
        text,
        subchannel,
      );
      if (err) {
        setError(err.message);
      }
      setSending(false);
    },
    [user, zoneId, subchannel],
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;
    await loadMessages(false);
  }, [hasMore, loading, loadMessages]);

  return { messages, loading, sending, error, sendMessage, loadMore, hasMore };
}
