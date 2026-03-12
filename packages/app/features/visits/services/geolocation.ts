// Make expo-location optional for Expo Go compatibility
let Location: any = null;
try {
  Location = require('expo-location');
} catch (e) {
  console.warn('expo-location not available - GPS features disabled');
}

import type {GeoCoordinates} from '@yuhuu/types';

/**
 * Geofence radius in meters
 * User must be within this distance to mark arrival
 */
export const GEOFENCE_RADIUS = 100;

/**
 * Location update interval in milliseconds
 * How frequently to check GPS position
 */
export const LOCATION_UPDATE_INTERVAL = 10000;

/**
 * Request GPS permissions (foreground + background)
 * Required before any location operations
 *
 * @returns true if both permissions granted, false otherwise
 */
export async function requestLocationPermissions(): Promise<boolean> {
  if (!Location) {
    console.warn('Location services not available');
    return false;
  }

  const foreground = await Location.requestForegroundPermissionsAsync();
  if (foreground.status !== 'granted') {
    return false;
  }

  const background = await Location.requestBackgroundPermissionsAsync();
  return background.status === 'granted';
}

/**
 * Get current GPS coordinates
 *
 * @returns Current position or null if unavailable
 */
export async function getCurrentLocation(): Promise<GeoCoordinates | null> {
  if (!Location) {
    console.warn('Location services not available');
    return null;
  }

  try {
    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    };
  } catch (error) {
    console.error('Failed to get current location:', error);
    return null;
  }
}

/**
 * Calculate distance between two GPS points using Haversine formula
 *
 * @param point1 - First coordinate
 * @param point2 - Second coordinate
 * @returns Distance in meters
 */
export function calculateDistance(point1: GeoCoordinates, point2: GeoCoordinates): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (point1.latitude * Math.PI) / 180;
  const φ2 = (point2.latitude * Math.PI) / 180;
  const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
  const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check if current location is within geofence of target
 *
 * @param current - Current GPS position
 * @param target - Target GPS position
 * @returns true if within GEOFENCE_RADIUS, false otherwise
 */
export function isWithinGeofence(current: GeoCoordinates, target: GeoCoordinates): boolean {
  const distance = calculateDistance(current, target);
  return distance <= GEOFENCE_RADIUS;
}

/**
 * Subscribe to location updates
 *
 * @param callback - Called every LOCATION_UPDATE_INTERVAL with new position
 * @returns Subscription object with remove() method
 */
export async function watchLocation(
  callback: (location: GeoCoordinates) => void
): Promise<any> {
  if (!Location) {
    console.warn('Location services not available');
    return {remove: () => {}};
  }

  return await Location.watchPositionAsync(
    {
      accuracy: Location.Accuracy.High,
      timeInterval: LOCATION_UPDATE_INTERVAL,
      distanceInterval: 10, // Update if user moves 10m
    },
    (location) => {
      callback({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
  );
}
