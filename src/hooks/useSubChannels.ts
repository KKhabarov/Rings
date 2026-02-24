import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChatChannel } from '../types';

const DEFAULT_CHANNELS: ChatChannel[] = [
  { id: 'general', name: '', icon: '💬' },
  { id: 'help', name: '', icon: '🆘' },
  { id: 'giveaway', name: '', icon: '🎁' },
  { id: 'noise', name: '', icon: '🔊' },
];

interface UseSubChannelsResult {
  channels: ChatChannel[];
  activeChannel: string;
  setActiveChannel: (channel: string) => void;
}

export function useSubChannels(_zoneId: string | null): UseSubChannelsResult {
  const { t } = useTranslation();
  const [activeChannel, setActiveChannel] = useState('general');

  const channels: ChatChannel[] = DEFAULT_CHANNELS.map((ch) => ({
    ...ch,
    name: t(`channels.${ch.id}`),
  }));

  return { channels, activeChannel, setActiveChannel };
}
