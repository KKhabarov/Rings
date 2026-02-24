import React from 'react';
import MapView, { Circle, Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { Zone, LocationCoords } from '../../types';
import { colors } from '../../constants/theme';
import { useAuthContext } from '../../store/AuthContext';
import { RingLevel } from '../../types';

interface RingsMapProps {
  location: LocationCoords;
  /** Number of nearby users — used by parent for NearbyCounter, passed here for future map adjustments */
  nearbyUsersCount: number;
  currentZone: Zone | null;
  nearbyZones: Zone[];
  onZonePress: (zone: Zone) => void;
}

function ringColor(ring: RingLevel): string {
  switch (ring) {
    case RingLevel.Local:
      return colors.rings.local;
    case RingLevel.Resident:
      return colors.rings.resident;
    case RingLevel.OldTimer:
      return colors.rings.oldTimer;
    case RingLevel.Guardian:
      return colors.rings.guardian;
    default:
      return colors.rings.guest;
  }
}

function heatColor(usersCount: number): string {
  if (usersCount >= 200) return 'rgba(239,68,68,0.25)';
  if (usersCount >= 50) return 'rgba(245,158,11,0.25)';
  if (usersCount >= 10) return 'rgba(16,185,129,0.25)';
  if (usersCount >= 1) return 'rgba(59,130,246,0.25)';
  return 'rgba(156,163,175,0.2)';
}

export default function RingsMap({
  location,
  nearbyUsersCount: _nearbyUsersCount, // reserved for future adaptive zoom
  currentZone,
  nearbyZones,
  onZonePress,
}: RingsMapProps) {
  const { profile } = useAuthContext();
  const markerColor = profile ? ringColor(profile.ring) : colors.rings.guest;

  return (
    <MapView
      style={styles.map}
      provider={PROVIDER_DEFAULT}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
      showsUserLocation={false}
    >
      {/* Current user marker */}
      <Marker
        coordinate={location}
        pinColor={markerColor}
      />

      {/* Nearby zones as heat circles */}
      {nearbyZones.map((zone) => (
        <React.Fragment key={zone.id}>
          <Circle
            center={zone.center}
            radius={zone.radius}
            fillColor={heatColor(zone.active_users_count)}
            strokeColor={
              currentZone?.id === zone.id ? markerColor : 'rgba(0,0,0,0.1)'
            }
            strokeWidth={currentZone?.id === zone.id ? 2 : 1}
          />
          <Marker
            coordinate={zone.center}
            opacity={0}
            onPress={() => onZonePress(zone)}
          />
        </React.Fragment>
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});
