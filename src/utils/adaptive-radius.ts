const STEP = 500; // metres

/**
 * Calculate an adaptive search radius based on the number of active users nearby.
 * - activeUsersCount > targetMax  → shrink radius (floor: minRadius)
 * - activeUsersCount < targetMin  → grow  radius (ceil:  maxRadius)
 * - otherwise                     → keep current radius
 */
export function calculateAdaptiveRadius(
  currentRadius: number,
  activeUsersCount: number,
  minRadius = 500,
  maxRadius = 20000,
  targetMin = 30,
  targetMax = 300,
): number {
  if (activeUsersCount > targetMax) {
    return Math.max(minRadius, currentRadius - STEP);
  }
  if (activeUsersCount < targetMin) {
    return Math.min(maxRadius, currentRadius + STEP);
  }
  return currentRadius;
}

/**
 * Calculate the great-circle distance between two coordinates using the
 * Haversine formula.
 * @returns Distance in metres.
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000; // Earth radius in metres
  const toRad = (deg: number) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
