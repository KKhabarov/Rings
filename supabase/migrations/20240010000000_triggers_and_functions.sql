-- Automatically create profile when user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, nickname, phone)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', 'Пользователь_' || LEFT(NEW.id::text, 8)),
    NEW.phone
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update user location
CREATE OR REPLACE FUNCTION update_user_location(
  user_id UUID,
  lat FLOAT,
  lng FLOAT
)
RETURNS VOID AS $$
BEGIN
  UPDATE profiles
  SET
    last_location = ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    last_seen = NOW(),
    updated_at = NOW()
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
