CREATE TABLE karma_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_karma_log_user ON karma_log(user_id, created_at DESC);

ALTER TABLE karma_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own karma log" ON karma_log
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can insert karma" ON karma_log
  FOR INSERT WITH CHECK (true);
