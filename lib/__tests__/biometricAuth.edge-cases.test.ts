import * as biometricAuth from '../biometricAuth';

/**
 * Edge Case Tests for Biometric Authentication Flow
 *
 * These tests cover boundary conditions and unusual inputs not addressed
 * by the standard unit tests:
 * - Unexpected return types from native APIs
 * - Storage corruption / unexpected values
 * - Error propagation and graceful degradation
 * - Various biometric error codes
 * - Slow async operations
 *
 * NOTE: biometricAuth.ts uses dynamic imports (await import(...)) which
 * interact with jest module mocking in specific ways. Tests here are
 * designed to work with that caching behavior. Tests that use
 * getLocalAuth/getSecureStore rely on the mock being resolved correctly
 * via the jest module registry.
 */

// Mock dependencies
jest.mock('react-native', () => ({
    Platform: { OS: 'ios' },
}));

jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: { ExpoSecureStore: {} },
}));

const mockHasHardwareAsync = jest.fn();
const mockIsEnrolledAsync = jest.fn();
const mockAuthenticateAsync = jest.fn();

jest.mock('expo-local-authentication', () => ({
    hasHardwareAsync: (...args: any[]) => mockHasHardwareAsync(...args),
    isEnrolledAsync: (...args: any[]) => mockIsEnrolledAsync(...args),
    authenticateAsync: (...args: any[]) => mockAuthenticateAsync(...args),
}));

const mockSetItemAsync = jest.fn();
const mockGetItemAsync = jest.fn();
const mockDeleteItemAsync = jest.fn();

jest.mock('expo-secure-store', () => ({
    setItemAsync: (...args: any[]) => mockSetItemAsync(...args),
    getItemAsync: (...args: any[]) => mockGetItemAsync(...args),
    deleteItemAsync: (...args: any[]) => mockDeleteItemAsync(...args),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));

describe('biometricAuth - Edge Cases', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('isBiometricAvailable - Falsy return edge cases', () => {
        it('should return false when isEnrolledAsync throws after hardware check passes', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockRejectedValue(new Error('Enrollment check failed'));

            const result = await biometricAuth.isBiometricAvailable();
            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync returns undefined', async () => {
            mockHasHardwareAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();
            // undefined is falsy -> early return false
            expect(result).toBe(false);
            expect(mockIsEnrolledAsync).not.toHaveBeenCalled();
        });

        it('should return false when hasHardwareAsync returns null', async () => {
            mockHasHardwareAsync.mockResolvedValue(null);

            const result = await biometricAuth.isBiometricAvailable();
            expect(result).toBe(false);
        });

        it('should return false when isEnrolledAsync returns undefined (FIXED: now coerces to boolean)', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();
            // FIXED: isBiometricAvailable now uses `return !!isEnrolled` to coerce
            // undefined to false, ensuring the Promise<boolean> contract is honored.
            expect(result).toBe(false);
            expect(result).toBeFalsy();
        });

        it('should return false when hasHardwareAsync returns empty string (falsy)', async () => {
            mockHasHardwareAsync.mockResolvedValue('');

            const result = await biometricAuth.isBiometricAvailable();
            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync returns 0 (falsy)', async () => {
            mockHasHardwareAsync.mockResolvedValue(0);

            const result = await biometricAuth.isBiometricAvailable();
            expect(result).toBe(false);
        });

        it('should return false when both hardware and enrollment checks throw', async () => {
            mockHasHardwareAsync.mockRejectedValue(new Error('Hardware error'));

            const result = await biometricAuth.isBiometricAvailable();
            expect(result).toBe(false);
            // isEnrolledAsync should not be called since hardware threw
            expect(mockIsEnrolledAsync).not.toHaveBeenCalled();
        });
    });

    describe('authenticateWithBiometrics - Error and null result edge cases', () => {
        it('should return false when authenticateAsync returns object without success property', async () => {
            mockAuthenticateAsync.mockResolvedValue({});

            const result = await biometricAuth.authenticateWithBiometrics();
            // result.success will be undefined -> falsy
            expect(result).toBeFalsy();
        });

        it('should return false when authenticateAsync returns null (TypeError caught)', async () => {
            mockAuthenticateAsync.mockResolvedValue(null);

            const result = await biometricAuth.authenticateWithBiometrics();
            // Accessing .success on null throws TypeError, caught by try/catch
            expect(result).toBe(false);
        });

        it('should return false when authenticateAsync returns undefined', async () => {
            mockAuthenticateAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should return false for system_cancel error', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'system_cancel',
            });

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should return false for lockout error', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'lockout',
            });

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should return false for not_enrolled error', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'not_enrolled',
            });

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should return false for passcode_not_set error', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'passcode_not_set',
            });

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should return false for authentication_failed error with warning', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'authentication_failed',
                warning: 'Too many failed attempts',
            });

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should handle authenticateAsync returning a string (non-object)', async () => {
            mockAuthenticateAsync.mockResolvedValue('not-an-object');

            const result = await biometricAuth.authenticateWithBiometrics();
            // 'not-an-object'.success is undefined -> falsy
            expect(result).toBeFalsy();
        });

        it('should return false when authenticateAsync rejects with TypeError', async () => {
            mockAuthenticateAsync.mockRejectedValue(new TypeError('Cannot read properties'));

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });

        it('should return false when authenticateAsync rejects with RangeError', async () => {
            mockAuthenticateAsync.mockRejectedValue(new RangeError('Maximum call stack'));

            const result = await biometricAuth.authenticateWithBiometrics();
            expect(result).toBe(false);
        });
    });

    describe('getBiometricPreference - Storage value edge cases', () => {
        it('should return false when getItemAsync returns empty string', async () => {
            mockGetItemAsync.mockResolvedValue('');

            const result = await biometricAuth.getBiometricPreference();
            // '' === 'true' is false
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns unexpected string "yes"', async () => {
            mockGetItemAsync.mockResolvedValue('yes');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns "TRUE" (case sensitive)', async () => {
            mockGetItemAsync.mockResolvedValue('TRUE');

            const result = await biometricAuth.getBiometricPreference();
            // Case sensitive: 'TRUE' !== 'true'
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns "1"', async () => {
            mockGetItemAsync.mockResolvedValue('1');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns undefined', async () => {
            mockGetItemAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns a number (type mismatch)', async () => {
            mockGetItemAsync.mockResolvedValue(0 as any);

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns boolean true (type mismatch)', async () => {
            mockGetItemAsync.mockResolvedValue(true as any);

            const result = await biometricAuth.getBiometricPreference();
            // true === 'true' is false (boolean !== string)
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns "false"', async () => {
            mockGetItemAsync.mockResolvedValue('false');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns corrupted JSON', async () => {
            mockGetItemAsync.mockResolvedValue('{invalid json}');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns "null" string', async () => {
            mockGetItemAsync.mockResolvedValue('null');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns "undefined" string', async () => {
            mockGetItemAsync.mockResolvedValue('undefined');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync throws Error', async () => {
            mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });

        it('should return false when getItemAsync throws non-Error', async () => {
            mockGetItemAsync.mockRejectedValue('string error');

            const result = await biometricAuth.getBiometricPreference();
            expect(result).toBe(false);
        });
    });

    describe('saveBiometricPreference - Error handling edge cases', () => {
        it('should not throw when setItemAsync rejects with disk full error', async () => {
            mockSetItemAsync.mockRejectedValue(new Error('Disk full'));

            await expect(
                biometricAuth.saveBiometricPreference(true)
            ).resolves.not.toThrow();
        });

        it('should not throw when setItemAsync rejects with permission error', async () => {
            mockSetItemAsync.mockRejectedValue(new Error('Permission denied'));

            await expect(
                biometricAuth.saveBiometricPreference(false)
            ).resolves.not.toThrow();
        });

        it('should not throw when setItemAsync rejects with non-Error', async () => {
            mockSetItemAsync.mockRejectedValue('non-error rejection');

            await expect(
                biometricAuth.saveBiometricPreference(true)
            ).resolves.not.toThrow();
        });
    });

    describe('getBiometricEmail - Null/undefined edge cases', () => {
        it('should return null when getItemAsync returns undefined', async () => {
            mockGetItemAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.getBiometricEmail();
            // undefined ?? null => null (nullish coalescing)
            expect(result).toBeNull();
        });

        it('should return null when getItemAsync returns null', async () => {
            mockGetItemAsync.mockResolvedValue(null);

            const result = await biometricAuth.getBiometricEmail();
            expect(result).toBeNull();
        });

        it('should return null when getItemAsync throws with Error', async () => {
            mockGetItemAsync.mockRejectedValue(new Error('Keychain corrupted'));

            const result = await biometricAuth.getBiometricEmail();
            expect(result).toBeNull();
        });

        it('should return null when getItemAsync throws with non-Error', async () => {
            mockGetItemAsync.mockRejectedValue({ code: 'EKEYCHAIN' });

            const result = await biometricAuth.getBiometricEmail();
            expect(result).toBeNull();
        });
    });

    describe('saveBiometricEmail - Error handling edge cases', () => {
        it('should handle save email when setItemAsync is slow', async () => {
            let resolveSetItem: any;
            mockSetItemAsync.mockReturnValue(new Promise(r => { resolveSetItem = r; }));

            const savePromise = biometricAuth.saveBiometricEmail('test@example.com');

            resolveSetItem(undefined);

            await expect(savePromise).resolves.not.toThrow();
        });

        it('should not throw when setItemAsync rejects for email save', async () => {
            mockSetItemAsync.mockRejectedValue(new Error('Write error'));

            await expect(
                biometricAuth.saveBiometricEmail('test@example.com')
            ).resolves.not.toThrow();
        });
    });

    describe('clearBiometricData - Error handling edge cases', () => {
        it('should not throw when both deletes reject', async () => {
            mockDeleteItemAsync.mockRejectedValue(new Error('Storage unavailable'));

            await expect(biometricAuth.clearBiometricData()).resolves.not.toThrow();
        });

        it('should handle deleteItemAsync with slow response', async () => {
            let resolveFirst: any;
            let resolveSecond: any;

            mockDeleteItemAsync
                .mockReturnValueOnce(new Promise(r => { resolveFirst = r; }))
                .mockReturnValueOnce(new Promise(r => { resolveSecond = r; }));

            const clearPromise = biometricAuth.clearBiometricData();

            resolveFirst(undefined);
            resolveSecond(undefined);

            await expect(clearPromise).resolves.not.toThrow();
        });

        it('should not throw when deleteItemAsync rejects with non-Error', async () => {
            mockDeleteItemAsync.mockRejectedValue('string rejection');

            await expect(biometricAuth.clearBiometricData()).resolves.not.toThrow();
        });
    });

    describe('Cross-function edge cases', () => {
        it('should handle clear then immediate preference read returning false', async () => {
            mockDeleteItemAsync.mockResolvedValue(undefined);
            mockGetItemAsync.mockResolvedValue(null);

            await biometricAuth.clearBiometricData();
            const pref = await biometricAuth.getBiometricPreference();

            expect(pref).toBe(false);
        });

        it('should handle clear then immediate email read returning null', async () => {
            mockDeleteItemAsync.mockResolvedValue(undefined);
            mockGetItemAsync.mockResolvedValue(null);

            await biometricAuth.clearBiometricData();
            const email = await biometricAuth.getBiometricEmail();

            expect(email).toBeNull();
        });

        it('should handle getItemAsync returning whitespace-only string for preference', async () => {
            mockGetItemAsync.mockResolvedValue('   ');

            const result = await biometricAuth.getBiometricPreference();
            // '   ' === 'true' is false
            expect(result).toBe(false);
        });

        it('should return null for email when no store is available and platform is ios', async () => {
            // Even with errors, the function should safely return null
            mockGetItemAsync.mockRejectedValue(new Error('No store'));

            const result = await biometricAuth.getBiometricEmail();
            expect(result).toBeNull();
        });
    });
});
