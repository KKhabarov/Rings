import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../constants/theme';

interface MessageInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
  placeholder?: string;
  sending?: boolean;
}

export default function MessageInput({
  onSend,
  disabled = false,
  placeholder,
  sending = false,
}: MessageInputProps) {
  const { t } = useTranslation();
  const [text, setText] = useState('');

  const handleSend = () => {
    if (!text.trim() || disabled || sending) return;
    onSend(text.trim());
    setText('');
  };

  if (disabled) {
    return (
      <View style={styles.disabledContainer}>
        <Text style={styles.disabledText}>{t('chat.outsideZone')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={text}
        onChangeText={setText}
        placeholder={placeholder ?? t('chat.writeMessage')}
        placeholderTextColor={colors.textSecondary}
        multiline
        numberOfLines={4}
        maxLength={1000}
        editable={!sending}
      />
      <TouchableOpacity
        style={[styles.sendButton, (!text.trim() || sending) && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={!text.trim() || sending}
      >
        {sending ? (
          <ActivityIndicator size="small" color={colors.background} />
        ) : (
          <Text style={styles.sendIcon}>➤</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  input: {
    flex: 1,
    minHeight: 40,
    maxHeight: 100,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    fontSize: typography.fontSizeBase,
    color: colors.text,
    backgroundColor: colors.background,
    marginRight: spacing.sm,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.border,
  },
  sendIcon: {
    color: colors.background,
    fontSize: typography.fontSizeMedium,
  },
  disabledContainer: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    alignItems: 'center',
  },
  disabledText: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});
