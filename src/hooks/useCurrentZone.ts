import { useState, useEffect, useCallback } from 'react';
import { zonesService } from '../services/zones';
import { LocationCoords, Zone } from '../types';
import { calculateDistance } from '../utils/adaptive-radius';

interface UseCurrentZoneResult {
  currentZone: Zone | null;
  nearbyZones: Zone[];
  loading: boolean;
}

export function useCurrentZone(location: LocationCoords | null): UseCurrentZoneResult {
  const [currentZone, setCurrentZone] = useState<Zone | null>(null);
  const [nearbyZones, setNearbyZones] = useState<Zone[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchZones = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    const { zones } = await zonesService.getNearbyZones(location.latitude, location.longitude);
    const list = zones || [];
    setNearbyZones(list);

    // Find the zone the user is currently inside (distance ≤ zone radius).
    // If multiple match, pick the nearest centre. If none match, pick the closest overall.
    const inside = list.filter((z) => {
      const dist = calculateDistance(
        location.latitude,
        location.longitude,
        z.center.latitude,
        z.center.longitude,
      );
      return dist <= z.radius;
    });

    const candidates = inside.length > 0 ? inside : list;
    const nearest =
      candidates.length > 0
        ? candidates.reduce((best, z) => {
            const dBest = calculateDistance(
              location.latitude,
              location.longitude,
              best.center.latitude,
              best.center.longitude,
            );
            const dZ = calculateDistance(
              location.latitude,
              location.longitude,
              z.center.latitude,
              z.center.longitude,
            );
            return dZ < dBest ? z : best;
          })
        : null;

    setCurrentZone(nearest);
    setLoading(false);
  }, [location]);

  useEffect(() => {
    fetchZones();
  }, [fetchZones]);

  return { currentZone, nearbyZones, loading };
}
