import { useState, useEffect, useCallback } from 'react';
import { zonesService } from '../services/zones';
import { LocationCoords, NearbyUser } from '../types';

const UPDATE_INTERVAL_MS = 30_000;

interface UseNearbyUsersResult {
  count: number;
  users: NearbyUser[];
  loading: boolean;
}

export function useNearbyUsers(location: LocationCoords | null): UseNearbyUsersResult {
  const [count, setCount] = useState(0);
  const [users, setUsers] = useState<NearbyUser[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = useCallback(async () => {
    if (!location) return;
    setLoading(true);
    const { users: data, count: c } = await zonesService.getNearbyUsersCount(
      location.latitude,
      location.longitude,
    );
    setUsers((data as NearbyUser[]) || []);
    setCount(c);
    setLoading(false);
  }, [location]);

  useEffect(() => {
    fetchUsers();
    const id = setInterval(fetchUsers, UPDATE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [fetchUsers]);

  return { count, users, loading };
}
