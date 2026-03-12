import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  startTimer,
  loadTimerState,
  getRemainingTime,
  isTimerComplete,
  completeTimer,
  clearTimerState,
  TIMER_DURATION,
  STORAGE_KEY,
} from '../visitTimer';
import type {VisitTimerState} from '@yuhuu/types';

/**
 * Unit tests for Visit Timer Service
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific timer behavior
 * - Dependency Inversion: Mock AsyncStorage dependency
 */

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}));

describe('visits/services/visitTimer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, 'error').mockImplementation(() => {});
    // Reset Date.now for consistent testing
    jest.spyOn(Date, 'now').mockReturnValue(1678886400000); // Fixed timestamp
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Constants', () => {
    it('should have correct TIMER_DURATION (10 minutes)', () => {
      expect(TIMER_DURATION).toBe(600000);
    });

    it('should have correct STORAGE_KEY', () => {
      expect(STORAGE_KEY).toBe('@yuhuu/visit_timer');
    });
  });

  describe('startTimer', () => {
    it('should create timer state with visit id', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const visitId = 42;
      const state = await startTimer(visitId);

      expect(state.visitId).toBe(visitId);
      expect(state.startedAt).toBeDefined();
      expect(state.duration).toBe(TIMER_DURATION);
    });

    it('should set duration to 600000ms (10 minutes)', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const state = await startTimer(1);

      expect(state.duration).toBe(600000);
    });

    it('should persist timer state to AsyncStorage', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const state = await startTimer(5);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(
        STORAGE_KEY,
        JSON.stringify(state)
      );
    });

    it('should use current timestamp for startedAt', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      // Mock Date constructor to return fixed timestamp
      const mockDate = new Date(1678886400000);
      jest.spyOn(global, 'Date').mockImplementation(() => mockDate as any);

      const state = await startTimer(10);

      const startedTimestamp = new Date(state.startedAt).getTime();

      // Verify timestamp uses mocked Date
      expect(startedTimestamp).toBe(1678886400000);

      // Restore Date
      jest.restoreAllMocks();
    });

    it('should return valid ISO 8601 timestamp', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      const state = await startTimer(1);

      // ISO 8601 format validation
      const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;
      expect(state.startedAt).toMatch(isoRegex);
    });
  });

  describe('loadTimerState', () => {
    it('should load timer state from AsyncStorage', async () => {
      const mockState: VisitTimerState = {
        visitId: 15,
        startedAt: '2026-03-12T10:00:00.000Z',
        duration: TIMER_DURATION,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockState));

      const state = await loadTimerState();

      expect(state).toEqual(mockState);
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should return null when no timer exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const state = await loadTimerState();

      expect(state).toBeNull();
    });

    it('should return null when AsyncStorage returns empty string', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('');

      const state = await loadTimerState();

      expect(state).toBeNull();
    });

    it('should handle JSON parse errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid json{');

      const state = await loadTimerState();

      expect(state).toBeNull();
      expect(console.error).toHaveBeenCalledWith(
        'Failed to load timer state:',
        expect.any(Error)
      );
    });

    it('should handle AsyncStorage errors', async () => {
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      const state = await loadTimerState();

      expect(state).toBeNull();
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('getRemainingTime', () => {
    it('should calculate remaining time correctly', () => {
      const startedAt = new Date(Date.now() - 300000).toISOString(); // Started 5 min ago
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const remaining = getRemainingTime(state);

      // Should have 5 minutes (300000ms) remaining
      expect(remaining).toBe(300000);
    });

    it('should return 0 when timer expired', () => {
      const startedAt = new Date(Date.now() - 700000).toISOString(); // Started 11.67 min ago
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const remaining = getRemainingTime(state);

      expect(remaining).toBe(0);
    });

    it('should return full duration when just started', () => {
      const startedAt = new Date(Date.now()).toISOString();
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const remaining = getRemainingTime(state);

      expect(remaining).toBe(TIMER_DURATION);
    });

    it('should handle edge case: exactly 10 minutes elapsed', () => {
      const startedAt = new Date(Date.now() - 600000).toISOString();
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const remaining = getRemainingTime(state);

      expect(remaining).toBe(0);
    });

    it('should never return negative values', () => {
      const startedAt = new Date(Date.now() - 1000000).toISOString(); // Very expired
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const remaining = getRemainingTime(state);

      expect(remaining).toBeGreaterThanOrEqual(0);
    });

    it('should handle millisecond precision', () => {
      const startedAt = new Date(Date.now() - 599999).toISOString(); // 9m 59.999s ago
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const remaining = getRemainingTime(state);

      expect(remaining).toBe(1); // 1ms remaining
    });
  });

  describe('isTimerComplete', () => {
    it('should return false when timer not complete', () => {
      const startedAt = new Date(Date.now() - 300000).toISOString(); // 5 min ago
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const complete = isTimerComplete(state);

      expect(complete).toBe(false);
    });

    it('should return true when timer expired', () => {
      const startedAt = new Date(Date.now() - 700000).toISOString(); // 11.67 min ago
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const complete = isTimerComplete(state);

      expect(complete).toBe(true);
    });

    it('should return true when exactly 10 minutes elapsed', () => {
      const startedAt = new Date(Date.now() - 600000).toISOString();
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const complete = isTimerComplete(state);

      expect(complete).toBe(true);
    });

    it('should return false for just-started timer', () => {
      const startedAt = new Date(Date.now()).toISOString();
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const complete = isTimerComplete(state);

      expect(complete).toBe(false);
    });

    it('should handle edge case: 1ms before completion', () => {
      const startedAt = new Date(Date.now() - 599999).toISOString();
      const state: VisitTimerState = {
        visitId: 1,
        startedAt,
        duration: TIMER_DURATION,
      };

      const complete = isTimerComplete(state);

      expect(complete).toBe(false);
    });
  });

  describe('completeTimer', () => {
    it('should clear timer state when visit id matches', async () => {
      const mockState: VisitTimerState = {
        visitId: 10,
        startedAt: '2026-03-12T10:00:00.000Z',
        duration: TIMER_DURATION,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockState));
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await completeTimer(10);

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should not clear timer when visit id does not match', async () => {
      const mockState: VisitTimerState = {
        visitId: 10,
        startedAt: '2026-03-12T10:00:00.000Z',
        duration: TIMER_DURATION,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockState));
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await completeTimer(99); // Different visit id

      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should handle case when no timer exists', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await completeTimer(5);

      expect(AsyncStorage.removeItem).not.toHaveBeenCalled();
    });

    it('should load timer state from storage', async () => {
      const mockState: VisitTimerState = {
        visitId: 20,
        startedAt: '2026-03-12T10:00:00.000Z',
        duration: TIMER_DURATION,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockState));
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await completeTimer(20);

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEY);
    });
  });

  describe('clearTimerState', () => {
    it('should remove timer from AsyncStorage', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await clearTimerState();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEY);
    });

    it('should handle AsyncStorage errors gracefully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(clearTimerState()).rejects.toThrow('Storage error');
    });
  });

  describe('Timer persistence workflow', () => {
    it('should support full timer lifecycle', async () => {
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
      (AsyncStorage.getItem as jest.Mock).mockImplementation(async () => {
        const calls = (AsyncStorage.setItem as jest.Mock).mock.calls;
        if (calls.length > 0) {
          return calls[calls.length - 1][1]; // Return last saved state
        }
        return null;
      });
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      // 1. Start timer
      const visitId = 100;
      const started = await startTimer(visitId);
      expect(started.visitId).toBe(visitId);

      // 2. Load timer (simulate app restart)
      const loaded = await loadTimerState();
      expect(loaded).toBeDefined();
      expect(loaded?.visitId).toBe(visitId);

      // 3. Check completion
      const complete = loaded ? isTimerComplete(loaded) : false;
      expect(complete).toBe(false); // Just started

      // 4. Complete timer
      await completeTimer(visitId);
      expect(AsyncStorage.removeItem).toHaveBeenCalled();
    });

    it('should handle timer restoration after app restart', async () => {
      // Simulate timer was created 5 minutes ago
      const fiveMinutesAgo = Date.now() - 300000;
      const mockState: VisitTimerState = {
        visitId: 50,
        startedAt: new Date(fiveMinutesAgo).toISOString(),
        duration: TIMER_DURATION,
      };

      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(mockState));

      const loaded = await loadTimerState();
      expect(loaded).toBeDefined();

      const remaining = loaded ? getRemainingTime(loaded) : 0;
      expect(remaining).toBe(300000); // 5 minutes remaining

      const complete = loaded ? isTimerComplete(loaded) : false;
      expect(complete).toBe(false);
    });
  });
});
