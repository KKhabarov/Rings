import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RingLevel } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';
import { RING_LIMITS } from '../../services/trust';

interface RingLimitsProps {
  ring: RingLevel;
}

interface PrivilegeRowProps {
  label: string;
  available: boolean;
  detail?: string;
}

function PrivilegeRow({ label, available, detail }: PrivilegeRowProps) {
  return (
    <View style={styles.privilegeRow}>
      <Text style={[styles.checkMark, { color: available ? colors.rings.resident : colors.textSecondary }]}>
        {available ? '✅' : '❌'}
      </Text>
      <Text style={[styles.privilegeLabel, !available && styles.privilegeLabelDisabled]}>
        {label}
        {detail ? ` (${detail})` : ''}
      </Text>
    </View>
  );
}

export default function RingLimits({ ring }: RingLimitsProps) {
  const { t } = useTranslation();
  const limits = RING_LIMITS[ring];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('limits.title')}</Text>
      <PrivilegeRow label={t('limits.readChats')} available />
      <PrivilegeRow
        label={t('limits.sendMessages')}
        available
        detail={`${limits.messagesPerHour} ${t('limits.messagesPerHour')}`}
      />
      <PrivilegeRow label={t('limits.directMessages')} available={limits.canSendDM} />
      <PrivilegeRow label={t('limits.createTemporaryZones')} available={limits.canCreateZone} />
      <PrivilegeRow label={t('limits.createPermanentZones')} available={limits.canCreatePermanentZone} />
      <PrivilegeRow
        label={t('limits.moderation')}
        available={ring >= RingLevel.Guardian}
      />
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
  title: {
    fontSize: typography.fontSizeMedium,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  privilegeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  checkMark: {
    fontSize: typography.fontSizeBase,
  },
  privilegeLabel: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
  },
  privilegeLabelDisabled: {
    color: colors.textSecondary,
  },
});
