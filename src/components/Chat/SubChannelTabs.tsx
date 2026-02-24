import React from 'react';
import { ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '../../constants/theme';
import { ChatChannel } from '../../types';

interface SubChannelTabsProps {
  channels: ChatChannel[];
  activeChannel: string;
  onChannelChange: (channelId: string) => void;
}

export default function SubChannelTabs({
  channels,
  activeChannel,
  onChannelChange,
}: SubChannelTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.container}
      contentContainerStyle={styles.content}
    >
      {channels.map((ch) => {
        const isActive = ch.id === activeChannel;
        return (
          <TouchableOpacity
            key={ch.id}
            onPress={() => onChannelChange(ch.id)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {ch.icon} {ch.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.background,
  },
  content: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  tab: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    marginHorizontal: spacing.xs,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
  },
  tabTextActive: {
    color: colors.background,
    fontWeight: '600',
  },
});
