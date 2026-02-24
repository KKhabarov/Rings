import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Zone } from '../../types';
import { colors, spacing, typography } from '../../constants/theme';

interface ZoneInfoProps {
  zone: Zone | null;
  onOpenChat?: () => void;
}

function formatRadius(metres: number, tM: string, tKm: string): string {
  if (metres >= 1000) {
    return `${(metres / 1000).toFixed(1)} ${tKm}`;
  }
  return `${metres} ${tM}`;
}

export default function ZoneInfo({ zone, onOpenChat }: ZoneInfoProps) {
  const { t } = useTranslation();

  return (
    <View style={styles.container}>
      {zone ? (
        <>
      <Text style={styles.zoneName}>{'📍 ' + (zone.name || t('map.yourZone'))}</Text>
          <Text style={styles.meta}>
            {zone.active_users_count}
            {' '}
            {t('map.peopleInZone')}
            {'  •  '}
            {t('map.zoneRadius')}
            {': '}
            {formatRadius(zone.radius, t('map.meters'), t('map.kilometers'))}
          </Text>
          <TouchableOpacity style={styles.button} onPress={onOpenChat}>
            <Text style={styles.buttonText}>{t('map.openChat')}</Text>
          </TouchableOpacity>
        </>
      ) : (
        <Text style={styles.noZone}>{t('map.noActiveZones')}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: spacing.lg,
    left: spacing.md,
    right: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    padding: spacing.md,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  zoneName: {
    fontSize: typography.fontSizeMedium,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  meta: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: spacing.sm,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizeBase,
    fontWeight: '600',
  },
  noZone: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
