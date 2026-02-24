import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Switch,
  StyleSheet,
  ScrollView,
  Modal,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../constants/theme';
import { useAuthContext } from '../store/AuthContext';
import { RingLevel } from '../types';
import RingProgress from '../components/Trust/RingProgress';
import RingLimits from '../components/Trust/RingLimits';
import KarmaLog from '../components/Trust/KarmaLog';

const RING_COLORS: Record<RingLevel, string> = {
  [RingLevel.Guest]: colors.rings.guest,
  [RingLevel.Local]: colors.rings.local,
  [RingLevel.Resident]: colors.rings.resident,
  [RingLevel.OldTimer]: colors.rings.oldTimer,
  [RingLevel.Guardian]: colors.rings.guardian,
};

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const { profile, signOut, updateProfile } = useAuthContext();

  const [editing, setEditing] = useState(false);
  const [nickname, setNickname] = useState(profile?.nickname ?? '');
  const [karmaLogVisible, setKarmaLogVisible] = useState(false);

  const handleSaveNickname = async () => {
    await updateProfile({ nickname });
    setEditing(false);
  };

  const toggleLanguage = () => {
    i18n.changeLanguage(i18n.language === 'ru' ? 'en' : 'ru');
  };

  const ringColor = profile ? RING_COLORS[profile.ring] : colors.rings.guest;
  const ringKey = profile
    ? (['guest', 'local', 'resident', 'oldTimer', 'guardian'] as const)[profile.ring]
    : 'guest';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={[styles.avatar, { backgroundColor: ringColor }]}>
        <Text style={styles.avatarText}>
          {(profile?.nickname ?? '?')[0].toUpperCase()}
        </Text>
      </View>

      <Text style={styles.ringLabel}>{t(`rings.${ringKey}`)}</Text>

      {editing ? (
        <View style={styles.row}>
          <TextInput
            style={styles.input}
            value={nickname}
            onChangeText={setNickname}
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveNickname}>
            <Text style={styles.saveButtonText}>{t('profile.save')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.row}>
          <Text style={styles.name}>{profile?.nickname ?? '—'}</Text>
          <TouchableOpacity onPress={() => setEditing(true)}>
            <Text style={styles.editLink}>{t('profile.edit')}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <Text style={styles.statValue}>{profile?.karma ?? 0}</Text>
          <Text style={styles.statLabel}>{t('profile.karma')}</Text>
        </View>
        <View style={styles.stat}>
          <Text style={[styles.statValue, { color: ringColor }]}>{t(`rings.${ringKey}`)}</Text>
          <Text style={styles.statLabel}>{t('profile.ring')}</Text>
        </View>
      </View>

      {profile && <RingProgress profile={profile} />}
      {profile && <RingLimits ring={profile.ring} />}

      {profile && (
        <TouchableOpacity style={styles.karmaButton} onPress={() => setKarmaLogVisible(true)}>
          <Text style={styles.karmaButtonText}>{t('karma.history')}</Text>
        </TouchableOpacity>
      )}

      <Modal
        visible={karmaLogVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setKarmaLogVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('karma.history')}</Text>
            <TouchableOpacity onPress={() => setKarmaLogVisible(false)}>
              <Text style={styles.modalClose}>{t('common.back')}</Text>
            </TouchableOpacity>
          </View>
          <ScrollView>
            {profile && <KarmaLog userId={profile.id} />}
          </ScrollView>
        </View>
      </Modal>

      <View style={styles.langRow}>
        <Text style={styles.langLabel}>{t('profile.language')}</Text>
        <Switch
          value={i18n.language === 'en'}
          onValueChange={toggleLanguage}
          thumbColor={colors.primary}
        />
        <Text style={styles.langLabel}>{i18n.language.toUpperCase()}</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Text style={styles.logoutText}>{t('profile.logout')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: spacing.xl,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.background,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  avatarText: {
    color: '#fff',
    fontSize: typography.fontSizeXLarge,
    fontWeight: 'bold',
  },
  ringLabel: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  name: {
    fontSize: typography.fontSizeLarge,
    fontWeight: 'bold',
    color: colors.text,
  },
  editLink: {
    color: colors.primary,
    fontSize: typography.fontSizeBase,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    padding: spacing.sm,
    fontSize: typography.fontSizeBase,
    color: colors.text,
    minWidth: 150,
  },
  saveButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.xl,
    marginBottom: spacing.lg,
  },
  stat: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: typography.fontSizeLarge,
    fontWeight: 'bold',
    color: colors.text,
  },
  statLabel: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
  },
  langRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  langLabel: {
    fontSize: typography.fontSizeBase,
    color: colors.textSecondary,
  },
  logoutButton: {
    backgroundColor: '#EF4444',
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: typography.fontSizeMedium,
  },
  karmaButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  karmaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: typography.fontSizeBase,
    textAlign: 'center',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.fontSizeMedium,
    fontWeight: 'bold',
    color: colors.text,
  },
  modalClose: {
    fontSize: typography.fontSizeBase,
    color: colors.primary,
  },
});
