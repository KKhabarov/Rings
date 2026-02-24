// Ring levels
export enum RingLevel {
  Guest = 0,    // Гость
  Local = 1,    // Местный
  Resident = 2, // Резидент
  OldTimer = 3, // Старожил
  Guardian = 4, // Хранитель
}

// User
export interface User {
  id: string;
  nickname: string;
  avatar_url?: string;
  phone?: string;
  ring: RingLevel;
  karma: number;
  created_at: string;
  last_seen: string;
  active_days: number;
  messages_with_reactions_count: number;
  successful_chats_count: number;
  bans_count: number;
  warnings_count: number;
}

// Zone
export interface Zone {
  id: string;
  name: string;
  center: { latitude: number; longitude: number };
  radius: number;
  active_users_count: number;
}

// Message
export interface Message {
  id: string;
  user_id: string;
  zone_id: string;
  text: string;
  created_at: string;
  reactions: Record<string, number>;
}

// Sub-channel
export interface SubChannel {
  id: string;
  zone_id: string;
  name: string;
  category: string;
}

// Nearby user (returned by nearby_users RPC)
export interface NearbyUser {
  id: string;
  nickname: string;
  avatar_url?: string;
  ring: RingLevel;
  karma: number;
  distance_meters: number;
}

// Location coordinates
export interface LocationCoords {
  latitude: number;
  longitude: number;
}

export interface MessageWithAuthor extends Message {
  subchannel?: string;
  author: {
    nickname: string;
    avatar_url?: string;
    ring: RingLevel;
    karma: number;
  };
}

export interface ChatChannel {
  id: string;
  name: string;
  icon: string;
}

export type ReportReason = 'spam' | 'harassment' | 'threats' | 'inappropriate' | 'other';
