import { useState, useEffect, useCallback, useRef } from 'react';
import * as ExpoLocation from 'expo-location';
import { profileService } from '../services/profile';
import { useAuthContext } from '../store/AuthContext';
import { calculateDistance } from '../utils/adaptive-radius';
import { LocationCoords } from '../types';

const UPDATE_INTERVAL_MS = 30_000;
const MIN_MOVE_METRES = 50;

interface UseLocationResult {
  location: LocationCoords | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  refreshLocation: () => Promise<void>;
}

export function useLocation(): UseLocationResult {
  const { user } = useAuthContext();
  const [location, setLocation] = useState<LocationCoords | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const lastSentRef = useRef<LocationCoords | null>(null);

  const sendToSupabase = useCallback(
    async (coords: LocationCoords) => {
      if (!user) return;
      const prev = lastSentRef.current;
      if (
        prev &&
        calculateDistance(prev.latitude, prev.longitude, coords.latitude, coords.longitude) <
          MIN_MOVE_METRES
      ) {
        return;
      }
      lastSentRef.current = coords;
      await profileService.updateLocation(user.id, coords.latitude, coords.longitude);
    },
    [user],
  );

  const fetchLocation = useCallback(async () => {
    try {
      const pos = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });
      const coords: LocationCoords = {
        latitude: pos.coords.latitude,
        longitude: pos.coords.longitude,
      };
      setLocation(coords);
      setError(null);
      await sendToSupabase(coords);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Location error');
    }
  }, [sendToSupabase]);

  const refreshLocation = useCallback(async () => {
    setLoading(true);
    await fetchLocation();
    setLoading(false);
  }, [fetchLocation]);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;

    (async () => {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      const granted = status === 'granted';
      setPermissionGranted(granted);

      if (granted) {
        await fetchLocation();
      }
      setLoading(false);

      if (granted) {
        intervalId = setInterval(fetchLocation, UPDATE_INTERVAL_MS);
      }
    })();

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchLocation]);

  return { location, loading, error, permissionGranted, refreshLocation };
}
