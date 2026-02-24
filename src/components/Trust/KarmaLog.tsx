import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import { trustService } from '../../services/trust';
import { formatRelativeTime } from '../../utils/time';

interface KarmaEntry {
  id: string;
  amount: number;
  reason: string;
  created_at: string;
}

const REASON_EMOJI: Record<string, string> = {
  reaction_received: '👍',
  thanks_received: '🙏',
  report_received: '⚠️',
  message_deleted: '🗑️',
  event_created: '🎉',
};

interface KarmaLogProps {
  userId: string;
}

export default function KarmaLog({ userId }: KarmaLogProps) {
  const { t, i18n } = useTranslation();
  const [log, setLog] = useState<KarmaEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trustService.getKarmaLog(userId).then(({ log: data }) => {
      setLog((data as KarmaEntry[]) ?? []);
      setLoading(false);
    });
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  if (log.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.empty}>{t('karma.title')}: —</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {log.map((entry) => {
        const emoji = REASON_EMOJI[entry.reason] ?? '•';
        const reasonLabel = t(`karma.${entry.reason}`, entry.reason);
        const timeStr = formatRelativeTime(entry.created_at, i18n.language);
        const isPositive = entry.amount > 0;

        return (
          <View key={entry.id} style={styles.row}>
            <Text style={[styles.amount, { color: isPositive ? colors.rings.resident : colors.danger }]}>
              {isPositive ? '+' : ''}{entry.amount}
            </Text>
            <Text style={styles.emoji}>{emoji}</Text>
            <View style={styles.info}>
              <Text style={styles.reason}>{reasonLabel}</Text>
              <Text style={styles.time}>{timeStr}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: spacing.xs,
  },
  centered: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  empty: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: spacing.sm,
  },
  amount: {
    fontSize: typography.fontSizeBase,
    fontWeight: 'bold',
    minWidth: 40,
    textAlign: 'right',
  },
  emoji: {
    fontSize: typography.fontSizeMedium,
  },
  info: {
    flex: 1,
  },
  reason: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
  },
  time: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
  },
});
