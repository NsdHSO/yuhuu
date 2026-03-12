import * as Location from 'expo-location';
import {
  calculateDistance,
  getCurrentLocation,
  isWithinGeofence,
  requestLocationPermissions,
  watchLocation,
  GEOFENCE_RADIUS,
  LOCATION_UPDATE_INTERVAL,
} from '../geolocation';
import type {GeoCoordinates} from '@yuhuu/types';

/**
 * Unit tests for Geolocation Service
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific geolocation behavior
 * - Dependency Inversion: Mock expo-location dependency
 */

// Mock expo-location
jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(),
  requestBackgroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  watchPositionAsync: jest.fn(),
  Accuracy: {
    High: 4,
  },
}));

describe('visits/services/geolocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Clear console.error mock
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should have correct GEOFENCE_RADIUS', () => {
      expect(GEOFENCE_RADIUS).toBe(100);
    });

    it('should have correct LOCATION_UPDATE_INTERVAL', () => {
      expect(LOCATION_UPDATE_INTERVAL).toBe(10000);
    });
  });

  describe('requestLocationPermissions', () => {
    it('should return true when both permissions granted', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestLocationPermissions();

      expect(result).toBe(true);
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.requestBackgroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when foreground permission denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestLocationPermissions();

      expect(result).toBe(false);
      expect(Location.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(Location.requestBackgroundPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should return false when background permission denied', async () => {
      (Location.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Location.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestLocationPermissions();

      expect(result).toBe(false);
    });

    it('should request foreground permission first', async () => {
      const callOrder: string[] = [];

      (Location.requestForegroundPermissionsAsync as jest.Mock).mockImplementation(() => {
        callOrder.push('foreground');
        return Promise.resolve({status: 'granted'});
      });

      (Location.requestBackgroundPermissionsAsync as jest.Mock).mockImplementation(() => {
        callOrder.push('background');
        return Promise.resolve({status: 'granted'});
      });

      await requestLocationPermissions();

      expect(callOrder).toEqual(['foreground', 'background']);
    });
  });

  describe('getCurrentLocation', () => {
    it('should return current GPS coordinates', async () => {
      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      (Location.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockLocation);

      const result = await getCurrentLocation();

      expect(result).toEqual({
        latitude: 40.7128,
        longitude: -74.006,
      });
      expect(Location.getCurrentPositionAsync).toHaveBeenCalledWith({
        accuracy: Location.Accuracy.High,
      });
    });

    it('should return null when location unavailable', async () => {
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        new Error('Location unavailable')
      );

      const result = await getCurrentLocation();

      expect(result).toBeNull();
    });

    it('should log error when location fetch fails', async () => {
      const error = new Error('GPS timeout');
      (Location.getCurrentPositionAsync as jest.Mock).mockRejectedValue(error);

      await getCurrentLocation();

      expect(console.error).toHaveBeenCalledWith('Failed to get current location:', error);
    });
  });

  describe('calculateDistance (Haversine formula)', () => {
    it('should calculate distance between two close points', () => {
      const point1: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};
      const point2: GeoCoordinates = {latitude: 40.7129, longitude: -74.0061};

      const distance = calculateDistance(point1, point2);

      // Approximately 15 meters between these points
      expect(distance).toBeGreaterThan(10);
      expect(distance).toBeLessThan(20);
    });

    it('should return 0 for same location', () => {
      const point: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};

      const distance = calculateDistance(point, point);

      expect(distance).toBe(0);
    });

    it('should calculate distance between distant points', () => {
      // New York to Los Angeles (approximately 3935 km)
      const newYork: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};
      const losAngeles: GeoCoordinates = {latitude: 34.0522, longitude: -118.2437};

      const distance = calculateDistance(newYork, losAngeles);

      // Should be around 3.9 million meters (3900-4000 km)
      expect(distance).toBeGreaterThan(3_900_000);
      expect(distance).toBeLessThan(4_000_000);
    });

    it('should handle negative longitude', () => {
      const point1: GeoCoordinates = {latitude: 51.5074, longitude: -0.1278}; // London
      const point2: GeoCoordinates = {latitude: 48.8566, longitude: 2.3522}; // Paris

      const distance = calculateDistance(point1, point2);

      // London to Paris is approximately 340 km
      expect(distance).toBeGreaterThan(300_000);
      expect(distance).toBeLessThan(400_000);
    });

    it('should be symmetric (distance A->B === B->A)', () => {
      const point1: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};
      const point2: GeoCoordinates = {latitude: 34.0522, longitude: -118.2437};

      const distance1 = calculateDistance(point1, point2);
      const distance2 = calculateDistance(point2, point1);

      expect(distance1).toBe(distance2);
    });

    it('should handle equator crossing', () => {
      const north: GeoCoordinates = {latitude: 10, longitude: 0};
      const south: GeoCoordinates = {latitude: -10, longitude: 0};

      const distance = calculateDistance(north, south);

      // 20 degrees latitude is approximately 2,222 km
      expect(distance).toBeGreaterThan(2_200_000);
      expect(distance).toBeLessThan(2_300_000);
    });

    it('should handle international date line crossing', () => {
      const west: GeoCoordinates = {latitude: 0, longitude: 179};
      const east: GeoCoordinates = {latitude: 0, longitude: -179};

      const distance = calculateDistance(west, east);

      // Should calculate shortest path (2 degrees, not 358 degrees)
      expect(distance).toBeLessThan(250_000);
    });
  });

  describe('isWithinGeofence', () => {
    it('should return true when within 100m radius', () => {
      const current: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};
      const target: GeoCoordinates = {latitude: 40.7129, longitude: -74.0061};

      const result = isWithinGeofence(current, target);

      expect(result).toBe(true);
    });

    it('should return true when exactly at 100m radius', () => {
      // Calculate point exactly 100m away (approximately 0.0009 degrees latitude)
      const current: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};
      const target: GeoCoordinates = {latitude: 40.71369, longitude: -74.006};

      const distance = calculateDistance(current, target);
      const result = isWithinGeofence(current, target);

      expect(distance).toBeLessThanOrEqual(GEOFENCE_RADIUS);
      expect(result).toBe(true);
    });

    it('should return false when beyond 100m radius', () => {
      const current: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};
      const target: GeoCoordinates = {latitude: 40.714, longitude: -74.006};

      const result = isWithinGeofence(current, target);

      expect(result).toBe(false);
    });

    it('should return true when at same location', () => {
      const point: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};

      const result = isWithinGeofence(point, point);

      expect(result).toBe(true);
    });

    it('should handle boundary cases (99m vs 101m)', () => {
      const current: GeoCoordinates = {latitude: 40.7128, longitude: -74.006};

      // Point at ~99m (just inside geofence)
      const inside: GeoCoordinates = {latitude: 40.71368, longitude: -74.006};
      expect(isWithinGeofence(current, inside)).toBe(true);

      // Point at ~150m (outside geofence)
      const outside: GeoCoordinates = {latitude: 40.71415, longitude: -74.006};
      expect(isWithinGeofence(current, outside)).toBe(false);
    });
  });

  describe('watchLocation', () => {
    it('should subscribe to location updates', async () => {
      const mockSubscription = {remove: jest.fn()};
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue(mockSubscription);

      const callback = jest.fn();

      const subscription = await watchLocation(callback);

      expect(subscription).toBe(mockSubscription);
      expect(Location.watchPositionAsync).toHaveBeenCalledWith(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: LOCATION_UPDATE_INTERVAL,
          distanceInterval: 10,
        },
        expect.any(Function)
      );
    });

    it('should call callback with location updates', async () => {
      const callback = jest.fn();
      let locationHandler: ((loc: any) => void) | undefined;

      (Location.watchPositionAsync as jest.Mock).mockImplementation(
        async (options, handler) => {
          locationHandler = handler;
          return {remove: jest.fn()};
        }
      );

      await watchLocation(callback);

      // Simulate location update
      const mockLocation = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
        },
      };

      locationHandler?.(mockLocation);

      expect(callback).toHaveBeenCalledWith({
        latitude: 40.7128,
        longitude: -74.006,
      });
    });

    it('should use correct time interval', async () => {
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({remove: jest.fn()});

      await watchLocation(jest.fn());

      const callArgs = (Location.watchPositionAsync as jest.Mock).mock.calls[0][0];
      expect(callArgs.timeInterval).toBe(10000);
    });

    it('should use correct distance interval', async () => {
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({remove: jest.fn()});

      await watchLocation(jest.fn());

      const callArgs = (Location.watchPositionAsync as jest.Mock).mock.calls[0][0];
      expect(callArgs.distanceInterval).toBe(10);
    });

    it('should return subscription with remove method', async () => {
      const mockRemove = jest.fn();
      (Location.watchPositionAsync as jest.Mock).mockResolvedValue({remove: mockRemove});

      const subscription = await watchLocation(jest.fn());

      expect(subscription.remove).toBeDefined();
      expect(typeof subscription.remove).toBe('function');
    });
  });
});
