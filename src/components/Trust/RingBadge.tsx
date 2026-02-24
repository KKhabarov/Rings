import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { RingLevel } from '../../types';
import { colors, typography } from '../../constants/theme';

const RING_KEYS = ['guest', 'local', 'resident', 'oldTimer', 'guardian'] as const;

const RING_COLORS: Record<RingLevel, string> = {
  [RingLevel.Guest]: colors.rings.guest,
  [RingLevel.Local]: colors.rings.local,
  [RingLevel.Resident]: colors.rings.resident,
  [RingLevel.OldTimer]: colors.rings.oldTimer,
  [RingLevel.Guardian]: colors.rings.guardian,
};

const RING_EMOJIS: Record<RingLevel, string> = {
  [RingLevel.Guest]: '⚪',
  [RingLevel.Local]: '🔵',
  [RingLevel.Resident]: '🟢',
  [RingLevel.OldTimer]: '🟡',
  [RingLevel.Guardian]: '🔴',
};

const SIZES = { small: 16, medium: 24, large: 32 };

interface RingBadgeProps {
  ring: RingLevel;
  size?: 'small' | 'medium' | 'large';
  showLabel?: boolean;
}

export default function RingBadge({ ring, size = 'small', showLabel = false }: RingBadgeProps) {
  const { t } = useTranslation();
  const diameter = SIZES[size];
  const ringColor = RING_COLORS[ring];
  const ringKey = RING_KEYS[ring];
  const emoji = RING_EMOJIS[ring];

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.dot,
          {
            width: diameter,
            height: diameter,
            borderRadius: diameter / 2,
            backgroundColor: ringColor,
          },
        ]}
      >
        <Text style={[styles.number, { fontSize: diameter * 0.5 }]}>{ring}</Text>
      </View>
      {showLabel && (
        <Text style={styles.label}>
          {emoji} {t(`rings.${ringKey}`)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  number: {
    color: '#fff',
    fontWeight: 'bold',
  },
  label: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
  },
});
