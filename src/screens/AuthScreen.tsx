import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../store/AuthContext';

export default function AuthScreen() {
  const { t } = useTranslation();
  const { signIn, signUp, loading } = useAuthContext();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    if (!email || !password || (mode === 'register' && !nickname)) {
      setErrorMsg(t('errors.fillAllFields'));
      return;
    }
    const { error } =
      mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password, nickname);
    if (error) setErrorMsg(error.message);
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <Text style={styles.title}>
        {mode === 'login' ? t('auth.login') : t('auth.register')}
      </Text>

      <View style={styles.tabs}>
        <TouchableOpacity
          style={[styles.tab, mode === 'login' && styles.tabActive]}
          onPress={() => { setMode('login'); setErrorMsg(''); }}
        >
          <Text style={[styles.tabText, mode === 'login' && styles.tabTextActive]}>
            {t('auth.login')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, mode === 'register' && styles.tabActive]}
          onPress={() => { setMode('register'); setErrorMsg(''); }}
        >
          <Text style={[styles.tabText, mode === 'register' && styles.tabTextActive]}>
            {t('auth.register')}
          </Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.input}
        placeholder={t('auth.email')}
        placeholderTextColor={colors.textSecondary}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <TextInput
        style={styles.input}
        placeholder={t('auth.password')}
        placeholderTextColor={colors.textSecondary}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      {mode === 'register' && (
        <TextInput
          style={styles.input}
          placeholder={t('auth.nickname')}
          placeholderTextColor={colors.textSecondary}
          value={nickname}
          onChangeText={setNickname}
        />
      )}

      {!!errorMsg && <Text style={styles.error}>{errorMsg}</Text>}

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>
            {mode === 'login' ? t('auth.login') : t('auth.register')}
          </Text>
        )}
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
  },
  title: {
    fontSize: typography.fontSizeXLarge,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  tabs: {
    flexDirection: 'row',
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.textSecondary,
    fontSize: typography.fontSizeBase,
  },
  tabTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.md,
    marginBottom: spacing.sm,
    color: colors.text,
    fontSize: typography.fontSizeBase,
  },
  button: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: spacing.md,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: typography.fontSizeMedium,
  },
  error: {
    color: '#EF4444',
    marginBottom: spacing.sm,
    fontSize: typography.fontSizeBase,
  },
});
