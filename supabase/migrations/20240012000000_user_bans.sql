CREATE TABLE user_bans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  banned_by UUID REFERENCES profiles(id),
  ban_type TEXT NOT NULL DEFAULT 'warning',
  reason TEXT NOT NULL,
  zone_id UUID REFERENCES zones(id),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_bans_user ON user_bans(user_id, is_active);
CREATE INDEX idx_user_bans_zone ON user_bans(zone_id, is_active);

ALTER TABLE user_bans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own bans" ON user_bans
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Guardians can view zone bans" ON user_bans
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND ring >= 4)
  );

CREATE POLICY "Guardians can create bans" ON user_bans
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND ring >= 4)
    OR banned_by IS NULL
  );
