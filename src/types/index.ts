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
