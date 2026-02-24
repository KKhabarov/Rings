CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  phone TEXT,
  ring INTEGER NOT NULL DEFAULT 0, -- RingLevel: 0=Guest, 1=Local, 2=Resident, 3=OldTimer, 4=Guardian
  karma INTEGER NOT NULL DEFAULT 0,
  active_days INTEGER NOT NULL DEFAULT 0,
  warnings_count INTEGER NOT NULL DEFAULT 0,
  bans_count INTEGER NOT NULL DEFAULT 0,
  successful_chats_count INTEGER NOT NULL DEFAULT 0,
  messages_with_reactions_count INTEGER NOT NULL DEFAULT 0,
  last_location GEOGRAPHY(POINT, 4326),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for geospatial queries (find nearby users)
CREATE INDEX idx_profiles_last_location ON profiles USING GIST(last_location);

-- Index for ring level filtering
CREATE INDEX idx_profiles_ring ON profiles(ring);

-- RLS (Row Level Security)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Users can read any profile
CREATE POLICY "Profiles are viewable by everyone" ON profiles
  FOR SELECT USING (true);

-- Users can update only their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
