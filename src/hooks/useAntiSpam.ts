import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../store/AuthContext';
import { RING_LIMITS } from '../services/trust';
import { RingLevel } from '../types';

const HOUR_MS = 60 * 60 * 1000;

interface SentMessage {
  timestamp: number;
}

export function useAntiSpam() {
  const { t } = useTranslation();
  const { profile } = useAuthContext();

  const ring = profile?.ring ?? RingLevel.Guest;
  const limit = RING_LIMITS[ring].messagesPerHour;

  const sentMessages = useRef<SentMessage[]>([]);
  const [messagesSent, setMessagesSent] = useState(0);
  const [resetTime, setResetTime] = useState<Date | null>(null);

  const pruneOldMessages = useCallback(() => {
    const cutoff = Date.now() - HOUR_MS;
    sentMessages.current = sentMessages.current.filter((m) => m.timestamp > cutoff);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      pruneOldMessages();
      setMessagesSent(sentMessages.current.length);
    }, 10_000);
    return () => clearInterval(interval);
  }, [pruneOldMessages]);

  const recordMessage = useCallback(() => {
    pruneOldMessages();
    sentMessages.current.push({ timestamp: Date.now() });
    setMessagesSent(sentMessages.current.length);

    const oldest = sentMessages.current[0];
    if (oldest) {
      setResetTime(new Date(oldest.timestamp + HOUR_MS));
    }
  }, [pruneOldMessages]);

  const messagesRemaining = Math.max(0, limit - messagesSent);
  const canSend = messagesSent < limit;

  const getMinutesUntilReset = () => {
    if (!resetTime) return null;
    const diff = resetTime.getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / 60_000));
  };

  const minutesUntilReset = getMinutesUntilReset();

  let warningMessage: string | null = null;
  if (!canSend) {
    const mins = minutesUntilReset ?? 0;
    warningMessage = `${t('spam.limitReached')}. ${t('spam.resetIn')} ${mins} ${t('spam.minutes')}`;
  } else if (messagesRemaining <= 5) {
    warningMessage = `${t('spam.messagesRemaining')}: ${messagesRemaining}`;
    if (minutesUntilReset !== null) {
      warningMessage += `. ${t('spam.resetIn')} ${minutesUntilReset} ${t('spam.minutes')}`;
    }
  }

  return {
    canSend,
    messagesRemaining,
    messagesSent,
    limit,
    resetTime,
    warningMessage,
    recordMessage,
  };
}
