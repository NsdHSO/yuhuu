/**
 * TDD Tests for useVisitTracking Hook
 *
 * RED Phase: These tests should FAIL initially because:
 * 1. useVisitTracking currently accepts VisitAssignment (no family data)
 * 2. targetLocation is hardcoded to (0, 0)
 * 3. No error handling in completeVisit
 *
 * After fixes (GREEN Phase):
 * 1. Hook accepts VisitAssignmentWithFamily
 * 2. targetLocation uses visit.family?.latitude/longitude
 * 3. Fallback to (0, 0) when family missing
 * 4. completeVisit has try/catch error handling
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {useVisitTracking} from '../useVisitTracking';
import type {VisitAssignmentWithFamily, VisitableFamily} from '@yuhuu/types';
import * as geolocation from '../../services/geolocation';
import * as visitTimer from '../../services/visitTimer';
import {useMarkArrivedMutation, useMarkCompletedMutation} from '../../hooks';

// Mock dependencies
jest.mock('../../services/geolocation');
jest.mock('../../services/visitTimer');
jest.mock('../../hooks', () => ({
  useMarkArrivedMutation: jest.fn(),
  useMarkCompletedMutation: jest.fn(),
}));

describe('useVisitTracking', () => {
  const mockFamily: VisitableFamily = {
    id: 1,
    family_name: 'Test Family',
    address_street: '123 Main St',
    address_city: 'Test City',
    address_postal: '12345',
    latitude: 45.5231,
    longitude: -122.6765,
    phone: '555-1234',
    notes: 'Test notes',
  };

  const mockVisitWithFamily: VisitAssignmentWithFamily = {
    id: 1,
    family_id: 1,
    assigned_to_user_id: 1,
    scheduled_date: '2026-03-21',
    status: 'pending',
    family: mockFamily, // Contains GPS coordinates
  };

  const mockVisitWithoutFamily: VisitAssignmentWithFamily = {
    id: 2,
    family_id: 2,
    assigned_to_user_id: 1,
    scheduled_date: '2026-03-21',
    status: 'pending',
    // family is undefined - should fallback to (0, 0)
  };

  const mockMarkArrivedMutateAsync = jest.fn();
  const mockMarkCompletedMutateAsync = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock mutation hooks
    (useMarkArrivedMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMarkArrivedMutateAsync,
    });
    (useMarkCompletedMutation as jest.Mock).mockReturnValue({
      mutateAsync: mockMarkCompletedMutateAsync,
    });

    // Mock geolocation services
    (geolocation.watchLocation as jest.Mock).mockResolvedValue({
      remove: jest.fn(),
    });
    (geolocation.getCurrentLocation as jest.Mock).mockResolvedValue({
      latitude: 45.5231,
      longitude: -122.6765,
    });
    (geolocation.isWithinGeofence as jest.Mock).mockReturnValue(false);

    // Mock timer services
    (visitTimer.startTimer as jest.Mock).mockResolvedValue(undefined);
    (visitTimer.loadTimerState as jest.Mock).mockResolvedValue(null);
    (visitTimer.getRemainingTime as jest.Mock).mockReturnValue(0);
    (visitTimer.isTimerComplete as jest.Mock).mockReturnValue(false);
    (visitTimer.clearTimerState as jest.Mock).mockResolvedValue(undefined);
  });

  describe('GPS Coordinates - Real Family Data', () => {
    it('should use real GPS coordinates from visit.family when available', async () => {
      const {result} = renderHook(() => useVisitTracking(mockVisitWithFamily));

      // Wait for initial render
      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      // Simulate location watch callback with real family coordinates
      const watchLocationCallback = (geolocation.watchLocation as jest.Mock).mock
        .calls[0]?.[0];

      if (watchLocationCallback) {
        // User location matches family coordinates (within geofence)
        (geolocation.isWithinGeofence as jest.Mock).mockReturnValue(true);

        await watchLocationCallback({
          latitude: 45.5231,
          longitude: -122.6765,
        });

        // Verify geofence check was called with REAL coordinates (not 0, 0)
        await waitFor(() => {
          const geofenceCall = (geolocation.isWithinGeofence as jest.Mock).mock.calls[0];
          expect(geofenceCall).toBeDefined();
          expect(geofenceCall[1]).toEqual({
            latitude: 45.5231, // From mockFamily
            longitude: -122.6765, // From mockFamily
          });
        });
      }
    });

    it('should fallback to (0, 0) when visit.family is missing', async () => {
      // Mock console.warn to verify defensive logging
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const {result} = renderHook(() => useVisitTracking(mockVisitWithoutFamily));

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      // Verify warning logged when GPS missing
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Family GPS coordinates missing')
      );

      // Simulate location watch callback
      const watchLocationCallback = (geolocation.watchLocation as jest.Mock).mock
        .calls[0]?.[0];

      if (watchLocationCallback) {
        (geolocation.isWithinGeofence as jest.Mock).mockReturnValue(false);

        await watchLocationCallback({
          latitude: 45.5231,
          longitude: -122.6765,
        });

        // Verify geofence check uses fallback (0, 0)
        await waitFor(() => {
          const geofenceCall = (geolocation.isWithinGeofence as jest.Mock).mock.calls[0];
          expect(geofenceCall).toBeDefined();
          expect(geofenceCall[1]).toEqual({
            latitude: 0,
            longitude: 0,
          });
        });
      }

      consoleWarnSpy.mockRestore();
    });

    it('should trigger geofence detection when user enters 100m radius', async () => {
      const {result} = renderHook(() => useVisitTracking(mockVisitWithFamily));

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      const watchLocationCallback = (geolocation.watchLocation as jest.Mock).mock
        .calls[0]?.[0];

      if (watchLocationCallback) {
        // User enters geofence
        (geolocation.isWithinGeofence as jest.Mock).mockReturnValue(true);

        await watchLocationCallback({
          latitude: 45.5231,
          longitude: -122.6765,
        });

        // Verify arrived mutation called
        await waitFor(() => {
          expect(mockMarkArrivedMutateAsync).toHaveBeenCalledWith({
            id: 1,
            latitude: 45.5231,
            longitude: -122.6765,
          });
        });

        // Verify timer started
        expect(visitTimer.startTimer).toHaveBeenCalledWith(1);
      }
    });
  });

  describe('Error Handling - Complete Visit', () => {
    it('should handle errors gracefully when completing visit fails', async () => {
      // Mock console.error to verify error logging
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

      // Setup: Visit is ready to complete (timer finished)
      (visitTimer.loadTimerState as jest.Mock).mockResolvedValue({
        visitId: 1,
        startedAt: new Date(Date.now() - 11 * 60 * 1000).toISOString(), // 11 min ago
        duration: 10 * 60 * 1000, // 10 minutes
      });
      (visitTimer.isTimerComplete as jest.Mock).mockReturnValue(true);

      const mockVisitInProgress: VisitAssignmentWithFamily = {
        ...mockVisitWithFamily,
        status: 'in_progress',
      };

      const {result} = renderHook(() => useVisitTracking(mockVisitInProgress));

      // Wait for canComplete to become true
      await waitFor(() => {
        expect(result.current.canComplete).toBe(true);
      });

      // Simulate API error
      const apiError = new Error('Network error');
      mockMarkCompletedMutateAsync.mockRejectedValueOnce(apiError);

      // Attempt to complete visit
      await result.current.completeVisit();

      // Verify error was logged
      await waitFor(() => {
        expect(consoleErrorSpy).toHaveBeenCalledWith(
          'Failed to complete visit:',
          apiError
        );
      });

      // Verify state NOT cleared (allows retry)
      expect(result.current.canComplete).toBe(true);
      expect(result.current.hasArrived).toBe(true);

      // Verify clearTimerState NOT called on error
      expect(visitTimer.clearTimerState).not.toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not call API when canComplete is false', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const {result} = renderHook(() => useVisitTracking(mockVisitWithFamily));

      await waitFor(() => {
        expect(result.current).toBeDefined();
      });

      // canComplete should be false (timer not finished)
      expect(result.current.canComplete).toBe(false);

      // Attempt to complete visit
      await result.current.completeVisit();

      // Verify warning logged
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Cannot complete visit: timer not finished'
      );

      // Verify API NOT called
      expect(mockMarkCompletedMutateAsync).not.toHaveBeenCalled();

      consoleWarnSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('should handle family with partial GPS data (latitude but no longitude)', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const partialGpsVisit: VisitAssignmentWithFamily = {
        ...mockVisitWithFamily,
        family: {
          ...mockFamily,
          latitude: 45.5231,
          longitude: 0, // Missing longitude
        },
      };

      renderHook(() => useVisitTracking(partialGpsVisit));

      // Should warn about missing GPS data
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Family GPS coordinates missing')
      );

      consoleWarnSpy.mockRestore();
    });

    it('should handle BriefFamilyData (no GPS coordinates)', async () => {
      const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

      const briefFamilyVisit: VisitAssignmentWithFamily = {
        ...mockVisitWithFamily,
        family: {
          id: 1,
          family_name: 'Brief Family',
          address_street: '123 Main St',
          address_city: 'Test City',
          address_postal: '12345',
        },
      };

      renderHook(() => useVisitTracking(briefFamilyVisit));

      // Should warn and fallback to (0, 0)
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Family GPS coordinates missing')
      );

      consoleWarnSpy.mockRestore();
    });
  });
});
