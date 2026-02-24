import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';

interface LocationPermissionProps {
  onRequestPermission: () => void;
}

export default function LocationPermission({ onRequestPermission }: LocationPermissionProps) {
  const { t } = useTranslation();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) {
    return (
      <View style={styles.dismissed}>
        <Text style={styles.deniedText}>{t('location.permissionDenied')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>📍</Text>
      <Text style={styles.title}>{t('location.permissionTitle')}</Text>
      <Text style={styles.description}>{t('location.permissionDescription')}</Text>
      <TouchableOpacity style={styles.allowButton} onPress={onRequestPermission}>
        <Text style={styles.allowButtonText}>{t('location.permissionButton')}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.laterButton} onPress={() => setDismissed(true)}>
        <Text style={styles.laterButtonText}>{t('location.permissionLater')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  icon: {
    fontSize: 64,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizeXLarge,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  description: {
    fontSize: typography.fontSizeMedium,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: spacing.xl,
  },
  allowButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    width: '100%',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  allowButtonText: {
    color: '#FFFFFF',
    fontSize: typography.fontSizeMedium,
    fontWeight: '600',
  },
  laterButton: {
    paddingVertical: spacing.sm,
  },
  laterButtonText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizeBase,
  },
  dismissed: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xl,
  },
  deniedText: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
