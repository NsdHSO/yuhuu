import {getItem, setItem, removeItem} from '@yuhuu/storage';
import type {VisitTimerState} from '@yuhuu/types';

/**
 * Timer duration in milliseconds (10 minutes)
 */
export const TIMER_DURATION = 600000;

/**
 * Storage key for timer persistence
 * Must follow format: alphanumeric, ".", "-", "_" only
 */
export const STORAGE_KEY = 'yuhuu.visit-timer';

/**
 * Start a new timer for a visit
 * Persists state to AsyncStorage for app restart survival
 *
 * @param visitId - ID of the visit assignment
 * @returns Timer state
 */
export async function startTimer(visitId: number): Promise<VisitTimerState> {
  const state: VisitTimerState = {
    visitId,
    startedAt: new Date().toISOString(),
    duration: TIMER_DURATION,
  };

  await setItem(STORAGE_KEY, JSON.stringify(state));
  return state;
}

/**
 * Load timer state from AsyncStorage
 * Used to restore timer after app restart
 *
 * @returns Timer state or null if no active timer
 */
export async function loadTimerState(): Promise<VisitTimerState | null> {
  try {
    const json = await getItem(STORAGE_KEY);
    if (!json) return null;

    const state = JSON.parse(json) as VisitTimerState;
    return state;
  } catch (error) {
    console.error('Failed to load timer state:', error);
    return null;
  }
}

/**
 * Calculate remaining time for a timer
 *
 * @param state - Timer state
 * @returns Remaining milliseconds (0 if complete)
 */
export function getRemainingTime(state: VisitTimerState): number {
  const elapsed = Date.now() - new Date(state.startedAt).getTime();
  const remaining = state.duration - elapsed;
  return Math.max(0, remaining);
}

/**
 * Check if timer has completed
 *
 * @param state - Timer state
 * @returns true if 10 minutes elapsed, false otherwise
 */
export function isTimerComplete(state: VisitTimerState): boolean {
  return getRemainingTime(state) === 0;
}

/**
 * Mark timer as complete and clear storage
 *
 * @param visitId - ID of the visit (for validation)
 */
export async function completeTimer(visitId: number): Promise<void> {
  const state = await loadTimerState();
  if (state?.visitId === visitId) {
    await clearTimerState();
  }
}

/**
 * Clear timer state from AsyncStorage
 * Called after visit completion or cancellation
 */
export async function clearTimerState(): Promise<void> {
  await removeItem(STORAGE_KEY);
}
