import {useEffect, useState} from 'react';
import type {VisitAssignmentWithFamily, GeoCoordinates, VisitableFamily} from '@yuhuu/types';
import {
  watchLocation,
  getCurrentLocation,
  isWithinGeofence,
} from '../services/geolocation';
import {
  startTimer,
  loadTimerState,
  getRemainingTime,
  isTimerComplete,
  clearTimerState,
} from '../services/visitTimer';
import {useMarkArrivedMutation, useMarkCompletedMutation} from '../hooks';

/**
 * Orchestration hook for visit tracking
 * Combines GPS monitoring, timer management, and API mutations
 *
 * Logic Flow:
 * 1. Watch GPS location on mount
 * 2. Check if user enters geofence (100m radius)
 * 3. Auto-mark arrived + start 10-minute timer
 * 4. Update countdown every second
 * 5. Enable completion button after timer expires
 * 6. Mark completed + clear timer state
 *
 * @param visit - Visit assignment to track (with family data for GPS)
 * @returns Tracking state and control functions
 */
export function useVisitTracking(visit: VisitAssignmentWithFamily) {
  const [isTracking, setIsTracking] = useState(false);
  const [hasArrived, setHasArrived] = useState(visit.status === 'in_progress');
  const [remainingMs, setRemainingMs] = useState(0);
  const [canComplete, setCanComplete] = useState(false);

  const markArrivedMutation = useMarkArrivedMutation();
  const markCompletedMutation = useMarkCompletedMutation();

  // Target coordinates from family data
  // Defensive coding: Use family GPS if available, fallback to (0, 0)
  // BriefFamilyData doesn't have GPS coordinates, only full VisitableFamily does

  // Type guard to check if family has GPS coordinates
  const isFullFamilyData = (family: typeof visit.family): family is VisitableFamily => {
    return family !== undefined && 'latitude' in family && 'longitude' in family;
  };

  let latitude = 0;
  let longitude = 0;
  if (isFullFamilyData(visit.family)) {
    latitude = visit.family.latitude;
    longitude = visit.family.longitude;
  }

  const targetLocation: GeoCoordinates = { latitude, longitude };

  // Warn developer if GPS data is missing (helps debugging)
  if (!isFullFamilyData(visit.family) || !latitude || !longitude) {
    console.warn(`Visit ${visit.id}: Family GPS coordinates missing, geofencing disabled`);
  }

  // Start location tracking
  useEffect(() => {
    if (visit.status !== 'in_progress' && visit.status !== 'pending') {
      return;
    }

    let subscription: any;
    setIsTracking(true);

    const startWatching = async () => {
      subscription = await watchLocation(async (currentLocation) => {
        if (!hasArrived && isWithinGeofence(currentLocation, targetLocation)) {
          // User entered geofence - mark arrived
          const {latitude, longitude} = currentLocation;
          await markArrivedMutation.mutateAsync({
            id: visit.id,
            latitude,
            longitude,
          });

          setHasArrived(true);
          await startTimer(visit.id);
        }
      });
    };

    startWatching();

    return () => {
      subscription?.remove();
      setIsTracking(false);
    };
  }, [visit.id, visit.status, hasArrived]);

  // Timer countdown
  useEffect(() => {
    if (!hasArrived) return;

    const loadAndUpdateTimer = async () => {
      const state = await loadTimerState();
      if (!state || state.visitId !== visit.id) return;

      const remaining = getRemainingTime(state);
      setRemainingMs(remaining);
      setCanComplete(isTimerComplete(state));
    };

    loadAndUpdateTimer();

    const interval = setInterval(loadAndUpdateTimer, 1000);
    return () => clearInterval(interval);
  }, [hasArrived, visit.id]);

  // Complete visit
  const completeVisit = async () => {
    if (!canComplete) {
      console.warn('Cannot complete visit: timer not finished');
      return;
    }

    try {
      await markCompletedMutation.mutateAsync(visit.id);
      await clearTimerState();
      setCanComplete(false);
      setHasArrived(false);
    } catch (error) {
      console.error('Failed to complete visit:', error);
      // Don't clear state on error - allows retry
    }
  };

  return {
    isTracking,
    hasArrived,
    remainingMs,
    canComplete,
    startTracking: () => setIsTracking(true),
    completeVisit,
  };
}
