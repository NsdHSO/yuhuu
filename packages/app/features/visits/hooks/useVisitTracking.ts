import {useEffect, useState} from 'react';
import type {VisitAssignment, GeoCoordinates} from '@yuhuu/types';
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
 * @param visit - Visit assignment to track
 * @returns Tracking state and control functions
 */
export function useVisitTracking(visit: VisitAssignment) {
  const [isTracking, setIsTracking] = useState(false);
  const [hasArrived, setHasArrived] = useState(visit.status === 'in_progress');
  const [remainingMs, setRemainingMs] = useState(0);
  const [canComplete, setCanComplete] = useState(false);

  const markArrivedMutation = useMarkArrivedMutation();
  const markCompletedMutation = useMarkCompletedMutation();

  // Target coordinates (family address)
  const targetLocation: GeoCoordinates = {
    latitude: 0, // TODO: Get from family data via visit.family_id
    longitude: 0,
  };

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
    if (!canComplete) return;

    await markCompletedMutation.mutateAsync(visit.id);
    await clearTimerState();
    setCanComplete(false);
    setHasArrived(false);
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
