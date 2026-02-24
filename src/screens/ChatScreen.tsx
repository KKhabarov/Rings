import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../store/AuthContext';
import { useLocation } from '../hooks/useLocation';
import { useCurrentZone } from '../hooks/useCurrentZone';
import { useZoneChat } from '../hooks/useZoneChat';
import { useSubChannels } from '../hooks/useSubChannels';
import { reportsService } from '../services/reports';
import { reactionsService } from '../services/reactions';
import { messagesService } from '../services/messages';
import SubChannelTabs from '../components/Chat/SubChannelTabs';
import MessageBubble from '../components/Chat/MessageBubble';
import MessageInput from '../components/Chat/MessageInput';
import EmptyChat from '../components/Chat/EmptyChat';
import ReportModal from '../components/Chat/ReportModal';
import { MessageWithAuthor } from '../types';

export default function ChatScreen() {
  const { t } = useTranslation();
  const { user } = useAuthContext();
  const { location } = useLocation();
  const { currentZone } = useCurrentZone(location);
  const zoneId = currentZone?.id ?? null;

  const { channels, activeChannel, setActiveChannel } = useSubChannels(zoneId);
  const { messages, loading, sending, sendMessage, loadMore, hasMore } = useZoneChat(
    zoneId,
    activeChannel,
  );

  const [reportMessageId, setReportMessageId] = useState<string | null>(null);

  const handleReact = async (messageId: string, reactionType: string) => {
    if (!user) return;
    await reactionsService.toggleReaction(messageId, user.id, reactionType);
  };

  const handleReport = (messageId: string) => {
    setReportMessageId(messageId);
  };

  const handleReportSubmit = async (reason: string, description?: string) => {
    if (!user || !reportMessageId) return;
    const msg = messages.find((m) => m.id === reportMessageId);
    if (!msg) return;
    await reportsService.reportMessage(user.id, reportMessageId, msg.user_id, reason, description);
    setReportMessageId(null);
  };

  const handleDelete = async (messageId: string) => {
    await messagesService.deleteMessage(messageId);
  };

  if (!currentZone) {
    return (
      <View style={styles.centered}>
        <Text style={styles.noZoneIcon}>📍</Text>
        <Text style={styles.noZoneTitle}>{t('chat.noZone')}</Text>
        <Text style={styles.noZoneDescription}>{t('chat.noZoneDescription')}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: MessageWithAuthor }) => (
    <MessageBubble
      message={item}
      isOwn={item.user_id === user?.id}
      onReact={handleReact}
      onReport={handleReport}
      onDelete={handleDelete}
    />
  );

  const renderHeader = () => {
    if (!hasMore) return null;
    return (
      <TouchableOpacity style={styles.loadMoreButton} onPress={loadMore}>
        <Text style={styles.loadMoreText}>{t('chat.loadMore')}</Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📍 {currentZone.name}</Text>
        <Text style={styles.headerSubtitle}>
          {currentZone.active_users_count} {t('chat.peopleHere')}
        </Text>
      </View>

      <SubChannelTabs
        channels={channels}
        activeChannel={activeChannel}
        onChannelChange={setActiveChannel}
      />

      {loading && messages.length === 0 ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          inverted
          contentContainerStyle={messages.length === 0 ? styles.emptyChatContainer : undefined}
          ListEmptyComponent={<EmptyChat />}
          ListFooterComponent={renderHeader}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={() => loadMore()}
              tintColor={colors.primary}
            />
          }
        />
      )}

      <MessageInput
        onSend={sendMessage}
        sending={sending}
        placeholder={t('chat.writeMessage')}
      />

      <ReportModal
        visible={reportMessageId !== null}
        onClose={() => setReportMessageId(null)}
        onSubmit={handleReportSubmit}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSizeMedium,
    fontWeight: 'bold',
    color: colors.text,
  },
  headerSubtitle: {
    fontSize: typography.fontSizeSmall,
    color: colors.textSecondary,
  },
  noZoneIcon: {
    fontSize: 48,
    marginBottom: spacing.md,
  },
  noZoneTitle: {
    fontSize: typography.fontSizeLarge,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  noZoneDescription: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  loadMoreButton: {
    padding: spacing.md,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: typography.fontSizeBase,
    color: colors.primary,
  },
  emptyChatContainer: {
    flex: 1,
  },
});

