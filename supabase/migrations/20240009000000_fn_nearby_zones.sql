CREATE OR REPLACE FUNCTION nearby_zones(
  user_lat FLOAT,
  user_lng FLOAT,
  radius_meters FLOAT DEFAULT 5000
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  zone_type TEXT,
  category TEXT,
  radius FLOAT,
  distance_meters FLOAT,
  active_users_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    z.id,
    z.name,
    z.zone_type,
    z.category,
    z.radius,
    ST_Distance(
      z.center,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography
    ) AS distance_meters,
    (
      SELECT COUNT(*) FROM profiles p
      WHERE p.last_location IS NOT NULL
        AND p.last_seen > NOW() - INTERVAL '15 minutes'
        AND ST_DWithin(p.last_location, z.center, z.radius)
    ) AS active_users_count
  FROM zones z
  WHERE
    z.is_active = TRUE
    AND (z.expires_at IS NULL OR z.expires_at > NOW())
    AND ST_DWithin(
      z.center,
      ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography,
      radius_meters
    )
  ORDER BY distance_meters;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
