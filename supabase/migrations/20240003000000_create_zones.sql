CREATE TABLE zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT,
  center GEOGRAPHY(POINT, 4326) NOT NULL,
  radius FLOAT NOT NULL DEFAULT 2000, -- meters
  zone_type TEXT NOT NULL DEFAULT 'auto', -- 'auto' | 'user_temporary' | 'user_permanent' | 'event'
  created_by UUID REFERENCES profiles(id),
  category TEXT, -- 'sport', 'help', 'meetup', 'discussion', 'other'
  access_type TEXT NOT NULL DEFAULT 'open', -- 'open' | 'request'
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ, -- for temporary chats
  recurring_schedule JSONB, -- for repeating chats: {"day": "saturday", "start": "16:00", "end": "19:00"}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_zones_center ON zones USING GIST(center);
CREATE INDEX idx_zones_active ON zones(is_active);
CREATE INDEX idx_zones_type ON zones(zone_type);

ALTER TABLE zones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Zones are viewable by everyone" ON zones
  FOR SELECT USING (true);

CREATE POLICY "Residents can create zones" ON zones
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND ring >= 2)
  );

CREATE POLICY "Zone creators can update their zones" ON zones
  FOR UPDATE USING (created_by = auth.uid());
