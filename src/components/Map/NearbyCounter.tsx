import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography } from '../../constants/theme';

interface NearbyCounterProps {
  count: number;
}

function getBackgroundColor(count: number): string {
  if (count === 0) return 'rgba(107,114,128,0.85)';
  if (count <= 10) return 'rgba(59,130,246,0.85)';
  if (count <= 50) return 'rgba(16,185,129,0.85)';
  if (count <= 200) return 'rgba(245,158,11,0.85)';
  return 'rgba(239,68,68,0.85)';
}

export default function NearbyCounter({ count }: NearbyCounterProps) {
  const { t } = useTranslation();
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(count);

  useEffect(() => {
    if (prevCount.current !== count) {
      prevCount.current = count;
      Animated.sequence([
        Animated.timing(scaleAnim, { toValue: 1.2, duration: 150, useNativeDriver: true }),
        Animated.timing(scaleAnim, { toValue: 1, duration: 150, useNativeDriver: true }),
      ]).start();
    }
  }, [count, scaleAnim]);

  return (
    <View style={styles.wrapper}>
      <Animated.View
        style={[
          styles.container,
          { backgroundColor: getBackgroundColor(count), transform: [{ scale: scaleAnim }] },
        ]}
      >
        <Text style={styles.text}>
          {'👥 '}
          {count}
          {' '}
          {t('map.peopleNearby')}
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    top: spacing.lg,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 10,
  },
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
  },
  text: {
    color: '#FFFFFF',
    fontSize: typography.fontSizeMedium,
    fontWeight: '600',
  },
});
