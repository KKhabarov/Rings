-- Function to find users within a radius (in meters)
CREATE OR REPLACE FUNCTION nearby_users(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_meters FLOAT DEFAULT 2000
)
RETURNS TABLE (
  id UUID,
  nickname TEXT,
  avatar_url TEXT,
  ring INTEGER,
  karma INTEGER,
  distance_meters FLOAT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.nickname,
    p.avatar_url,
    p.ring,
    p.karma,
    ST_Distance(
      p.last_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters
  FROM profiles p
  WHERE
    p.last_location IS NOT NULL
    AND p.last_seen > NOW() - INTERVAL '15 minutes'
    AND ST_DWithin(
      p.last_location,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
