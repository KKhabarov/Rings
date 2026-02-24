import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { colors } from '../constants/theme';
import { useLocation } from '../hooks/useLocation';
import { useNearbyUsers } from '../hooks/useNearbyUsers';
import { useCurrentZone } from '../hooks/useCurrentZone';
import RingsMap from '../components/Map/RingsMap';
import NearbyCounter from '../components/Map/NearbyCounter';
import ZoneInfo from '../components/Map/ZoneInfo';
import LocationPermission from '../components/Map/LocationPermission';
import { Zone } from '../types';

export default function MapScreen() {
  const { location, loading, permissionGranted, refreshLocation } = useLocation();
  const { count } = useNearbyUsers(location);
  const { currentZone, nearbyZones } = useCurrentZone(location);

  if (!permissionGranted && !loading) {
    return <LocationPermission onRequestPermission={refreshLocation} />;
  }

  if (loading || !location) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleZonePress = (_zone: Zone) => {
    // Zone press handler — chat integration will come in PR #4
  };

  return (
    <View style={styles.container}>
      <RingsMap
        location={location}
        nearbyUsersCount={count}
        currentZone={currentZone}
        nearbyZones={nearbyZones}
        onZonePress={handleZonePress}
      />
      <NearbyCounter count={count} />
      <ZoneInfo zone={currentZone} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
