import { useTranslation } from 'react-i18next';
import { useAuthContext } from '../store/AuthContext';
import { colors } from '../constants/theme';
import { RingLevel } from '../types';
import { RING_LIMITS, RING_REQUIREMENTS, trustService } from '../services/trust';

const RING_KEYS = ['guest', 'local', 'resident', 'oldTimer', 'guardian'] as const;

const RING_COLORS: Record<RingLevel, string> = {
  [RingLevel.Guest]: colors.rings.guest,
  [RingLevel.Local]: colors.rings.local,
  [RingLevel.Resident]: colors.rings.resident,
  [RingLevel.OldTimer]: colors.rings.oldTimer,
  [RingLevel.Guardian]: colors.rings.guardian,
};

export function useRing() {
  const { t } = useTranslation();
  const { profile } = useAuthContext();

  const ring = profile?.ring ?? RingLevel.Guest;
  const karma = profile?.karma ?? 0;
  const limits = RING_LIMITS[ring];
  const ringKey = RING_KEYS[ring];
  const ringName = t(`rings.${ringKey}`);
  const ringColor = RING_COLORS[ring];

  const progress = profile
    ? trustService.getRingProgress({
        active_days: profile.active_days ?? 0,
        karma: profile.karma,
        phone: profile.phone,
        ring: profile.ring,
      })
    : null;

  const checkMessageLimit = async (): Promise<boolean> => {
    if (!profile) return false;
    const { allowed } = await trustService.checkMessageRateLimit(profile.id);
    return allowed;
  };

  return {
    ring,
    ringName,
    ringColor,
    karma,
    limits,
    requirements: RING_REQUIREMENTS[ring],
    progress,
    canSendMessage: true, // enforced server-side; client uses useAntiSpam
    canSendDM: limits.canSendDM,
    canCreateZone: limits.canCreateZone,
    checkMessageLimit,
  };
}
