import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';

interface SpamWarningProps {
  messagesRemaining: number;
  resetTime: Date | null;
}

export default function SpamWarning({ messagesRemaining, resetTime }: SpamWarningProps) {
  const { t } = useTranslation();

  const isLimitReached = messagesRemaining <= 0;

  const minutesUntilReset = resetTime
    ? Math.max(0, Math.ceil((resetTime.getTime() - Date.now()) / 60_000))
    : null;

  const backgroundColor = isLimitReached ? '#FEE2E2' : '#FEF9C3';
  const borderColor = isLimitReached ? colors.danger : '#F59E0B';
  const textColor = isLimitReached ? colors.danger : '#92400E';

  const message = isLimitReached
    ? `🚫 ${t('spam.limitReached')}${minutesUntilReset !== null ? `. ${t('spam.resetIn')} ${minutesUntilReset} ${t('spam.minutes')}` : ''}`
    : `⚠️ ${t('spam.messagesRemaining')}: ${messagesRemaining}${minutesUntilReset !== null ? `. ${t('spam.resetIn')} ${minutesUntilReset} ${t('spam.minutes')}` : ''}`;

  return (
    <View style={[styles.container, { backgroundColor, borderColor }]}>
      <Text style={[styles.text, { color: textColor }]}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
  },
  text: {
    fontSize: typography.fontSizeSmall,
    fontWeight: '500',
  },
});
