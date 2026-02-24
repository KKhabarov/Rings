import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';
import { MessageWithAuthor, RingLevel } from '../../types';
import { formatRelativeTime } from '../../utils/time';

interface MessageBubbleProps {
  message: MessageWithAuthor;
  isOwn: boolean;
  onReact: (messageId: string, reactionType: string) => void;
  onReport: (messageId: string) => void;
  onDelete: (messageId: string) => void;
}

const RING_COLORS: Record<RingLevel, string> = {
  [RingLevel.Guest]: colors.rings.guest,
  [RingLevel.Local]: colors.rings.local,
  [RingLevel.Resident]: colors.rings.resident,
  [RingLevel.OldTimer]: colors.rings.oldTimer,
  [RingLevel.Guardian]: colors.rings.guardian,
};

const REACTIONS = [
  { type: 'like', emoji: '👍' },
  { type: 'thanks', emoji: '🙏' },
  { type: 'funny', emoji: '😄' },
  { type: 'sad', emoji: '😢' },
];

export default function MessageBubble({
  message,
  isOwn,
  onReact,
  onReport,
  onDelete,
}: MessageBubbleProps) {
  const { t, i18n } = useTranslation();
  const [showActions, setShowActions] = useState(false);

  const ringColor = RING_COLORS[message.author.ring] ?? colors.rings.guest;
  const timeStr = formatRelativeTime(message.created_at, i18n.language);
  const initials = message.author.nickname.charAt(0).toUpperCase();

  const handleLongPress = () => {
    setShowActions(true);
  };

  const handleDeletePress = () => {
    setShowActions(false);
    Alert.alert(t('messageActions.delete'), t('messageActions.deleteConfirm'), [
      { text: t('report.cancel'), style: 'cancel' },
      { text: t('messageActions.delete'), style: 'destructive', onPress: () => onDelete(message.id) },
    ]);
  };

  const reactionCounts = message.reactions ?? {};

  return (
    <TouchableWithoutFeedback onLongPress={handleLongPress}>
      <View style={[styles.wrapper, isOwn ? styles.wrapperOwn : styles.wrapperOther]}>
        {!isOwn && (
          <View style={[styles.avatar, { backgroundColor: ringColor }]}>
            {message.author.avatar_url ? null : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>
        )}
        <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
          {!isOwn && (
            <View style={styles.authorRow}>
              <Text style={styles.nickname}>{message.author.nickname}</Text>
              <View style={[styles.ringDot, { backgroundColor: ringColor }]} />
            </View>
          )}
          <Text style={[styles.text, isOwn && styles.textOwn]}>{message.text}</Text>
          <Text style={[styles.time, isOwn && styles.timeOwn]}>{timeStr}</Text>

          {Object.keys(reactionCounts).length > 0 && (
            <View style={styles.reactionsRow}>
              {Object.entries(reactionCounts).map(([type, count]) => {
                const r = REACTIONS.find((x) => x.type === type);
                if (!r || count === 0) return null;
                return (
                  <TouchableOpacity
                    key={type}
                    style={styles.reactionBadge}
                    onPress={() => onReact(message.id, type)}
                  >
                    <Text style={styles.reactionText}>
                      {r.emoji} {count}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>

        {showActions && (
          <TouchableWithoutFeedback onPress={() => setShowActions(false)}>
            <View style={styles.actionsOverlay}>
              <View style={styles.actionsMenu}>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setShowActions(false);
                    onReact(message.id, 'like');
                  }}
                >
                  <Text style={styles.actionText}>{t('messageActions.react')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionItem}
                  onPress={() => {
                    setShowActions(false);
                    onReport(message.id);
                  }}
                >
                  <Text style={styles.actionText}>{t('messageActions.report')}</Text>
                </TouchableOpacity>
                {isOwn && (
                  <TouchableOpacity style={styles.actionItem} onPress={handleDeletePress}>
                    <Text style={[styles.actionText, styles.deleteText]}>
                      {t('messageActions.delete')}
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    marginVertical: spacing.xs,
    paddingHorizontal: spacing.md,
    alignItems: 'flex-end',
  },
  wrapperOwn: {
    justifyContent: 'flex-end',
  },
  wrapperOther: {
    justifyContent: 'flex-start',
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  avatarText: {
    color: colors.background,
    fontWeight: 'bold',
    fontSize: typography.fontSizeBase,
  },
  bubble: {
    maxWidth: '75%',
    borderRadius: 12,
    padding: spacing.sm,
  },
  bubbleOwn: {
    backgroundColor: colors.primary,
    borderBottomRightRadius: 2,
  },
  bubbleOther: {
    backgroundColor: colors.border,
    borderBottomLeftRadius: 2,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  nickname: {
    fontSize: typography.fontSizeSmall,
    fontWeight: '600',
    color: colors.textSecondary,
    marginRight: spacing.xs,
  },
  ringDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  text: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
  },
  textOwn: {
    color: colors.background,
  },
  time: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
    marginTop: 2,
    textAlign: 'left',
  },
  timeOwn: {
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
  },
  reactionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.xs,
    gap: spacing.xs,
  },
  reactionBadge: {
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 10,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  reactionText: {
    fontSize: typography.fontSizeSmall,
  },
  actionsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionsMenu: {
    backgroundColor: colors.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    minWidth: 160,
  },
  actionItem: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  actionText: {
    fontSize: typography.fontSizeBase,
    color: colors.text,
  },
  deleteText: {
    color: colors.danger,
  },
});
