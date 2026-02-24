import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { User, RingLevel } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';
import { trustService } from '../../services/trust';
import RingBadge from './RingBadge';

interface RingProgressProps {
  profile: User;
}

export default function RingProgress({ profile }: RingProgressProps) {
  const { t } = useTranslation();
  const RING_KEYS = ['guest', 'local', 'resident', 'oldTimer', 'guardian'] as const;

  if (profile.ring >= RingLevel.Guardian) {
    return (
      <View style={styles.container}>
        <View style={styles.currentRow}>
          <RingBadge ring={profile.ring} size="large" showLabel />
        </View>
        <Text style={styles.maxLevel}>{t('rings.maxLevel')}</Text>
      </View>
    );
  }

  const { nextRing, progress, overallProgress } = trustService.getRingProgress({
    active_days: profile.active_days ?? 0,
    karma: profile.karma,
    phone: profile.phone,
    ring: profile.ring,
  });

  const nextRingKey = nextRing !== null ? RING_KEYS[nextRing] : null;
  const percent = Math.round((overallProgress ?? 0) * 100);

  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>{t('rings.currentRing')}</Text>
      <View style={styles.currentRow}>
        <RingBadge ring={profile.ring} size="large" showLabel />
      </View>

      {nextRing !== null && nextRingKey && progress && (
        <>
          <View style={styles.nextRingRow}>
            <Text style={styles.nextLabel}>{t('rings.nextRing')}: </Text>
            <RingBadgeInline ring={nextRing} label={t(`rings.${nextRingKey}`)} />
          </View>

          <View style={styles.requirementRow}>
            <Text style={styles.requirementLabel}>{t('rings.activeDays')}</Text>
            <Text style={styles.requirementValues}>
              {progress.activeDays.current} / {progress.activeDays.required}
            </Text>
            <ProgressBar value={progress.activeDays.current} max={progress.activeDays.required} />
          </View>

          <View style={styles.requirementRow}>
            <Text style={styles.requirementLabel}>{t('rings.karmaRequired')}</Text>
            <Text style={styles.requirementValues}>
              {progress.karma.current} / {progress.karma.required}
            </Text>
            <ProgressBar value={progress.karma.current} max={progress.karma.required} />
          </View>

          <View style={styles.requirementRow}>
            <Text style={styles.requirementLabel}>{t('rings.phoneVerified')}</Text>
            <Text style={[styles.checkMark, { color: progress.phone.met ? colors.rings.resident : colors.danger }]}>
              {progress.phone.met ? '✅' : '❌'}
            </Text>
          </View>

          <Text style={styles.overallProgress}>
            {percent}% {t('rings.progressPercent')}
          </Text>
        </>
      )}
    </View>
  );
}

function RingBadgeInline({ ring, label }: { ring: RingLevel; label: string }) {
  const RING_EMOJIS: Record<RingLevel, string> = {
    [RingLevel.Guest]: '⚪',
    [RingLevel.Local]: '🔵',
    [RingLevel.Resident]: '🟢',
    [RingLevel.OldTimer]: '🟡',
    [RingLevel.Guardian]: '🔴',
  };
  return (
    <Text style={styles.nextLabel}>
      {RING_EMOJIS[ring]} {label}
    </Text>
  );
}

function ProgressBar({ value, max }: { value: number; max: number }) {
  const ratio = max > 0 ? Math.min(value / max, 1) : 1;
  return (
    <View style={styles.barTrack}>
      <View style={[styles.barFill, { width: `${Math.round(ratio * 100)}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    borderRadius: 12,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  currentRow: {
    marginBottom: spacing.sm,
  },
  nextRingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  nextLabel: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  maxLevel: {
    fontSize: typography.fontSizeMedium,
    fontWeight: 'bold',
    color: colors.rings.guardian,
    marginTop: spacing.sm,
  },
  requirementRow: {
    marginBottom: spacing.sm,
  },
  requirementLabel: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  requirementValues: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
    marginBottom: 4,
  },
  checkMark: {
    fontSize: typography.fontSizeBase,
  },
  barTrack: {
    height: 8,
    backgroundColor: colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: 8,
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  overallProgress: {
    fontSize: typography.fontSizeBase,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.sm,
  },
});
