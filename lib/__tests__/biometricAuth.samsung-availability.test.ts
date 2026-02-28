/**
 * Samsung A52s 5G Specific Biometric Availability Tests
 *
 * Tests for scenarios where isBiometricAvailable() might incorrectly return true
 * when biometrics are actually unavailable on Samsung devices.
 *
 * CRITICAL: These tests verify the Security section visibility in Profile screen.
 * If these tests fail, the Security section will show when it shouldn't.
 */

jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: { ExpoSecureStore: {} },
}));

jest.mock('expo-secure-store', () => ({
    setItemAsync: jest.fn(),
    getItemAsync: jest.fn(),
    deleteItemAsync: jest.fn(),
    WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
}));

import { Platform } from 'react-native';
import * as LocalAuth from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import * as biometricAuth from '../biometricAuth';

const { __resetServiceForTesting } = biometricAuth as any;
const mockHasHardwareAsync = LocalAuth.hasHardwareAsync as jest.Mock;
const mockIsEnrolledAsync = LocalAuth.isEnrolledAsync as jest.Mock;

describe('Samsung A52s 5G Biometric Availability - CRITICAL', () => {
    const originalPlatformOS = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = 'android';
        if (__resetServiceForTesting) __resetServiceForTesting();
    });

    afterAll(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    // ================================================================
    // CRITICAL: False Positive Detection
    // ================================================================
    // These tests ensure isBiometricAvailable() returns FALSE
    // when biometrics are actually unavailable.
    // If ANY of these fail, the Security section WILL SHOW incorrectly.

    describe('CRITICAL: Must return false - No Hardware', () => {
        it('must return false when hasHardwareAsync returns false', async () => {
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(true);  // Even if enrolled

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('must return false even if isEnrolledAsync would return true', async () => {
            mockHasHardwareAsync.mockResolvedValue(false);
            // Simulate a case where enrolled is called anyway (shouldn't happen)
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
            // Should not even call isEnrolledAsync if hardware is false
            expect(mockIsEnrolledAsync).not.toHaveBeenCalled();
        });

        it('must return false when hardware check throws', async () => {
            mockHasHardwareAsync.mockRejectedValue(new Error('Hardware check failed'));

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    describe('CRITICAL: Must return false - Not Enrolled', () => {
        it('must return false when isEnrolledAsync returns false', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('must return false when enrolled check throws', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockRejectedValue(new Error('Enrollment check failed'));

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    // ================================================================
    // Samsung-Specific Scenarios
    // ================================================================

    describe('Samsung A52s 5G: Post-Boot Face Recognition Framework Delay', () => {
        it('should return false when face recognition framework not yet initialized', async () => {
            // Scenario: Device just booted, face recognition driver not loaded
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(true);  // Enrolled in Settings

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false during Samsung OneUI startup delays', async () => {
            // Scenario: BiometricManager reports unavailable while OneUI initializes
            mockHasHardwareAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should handle Samsung pass manager initialization pending', async () => {
            // Scenario: Face recognition available but pass manager not ready
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    describe('Samsung A52s 5G: Fingerprint Sensor Initialization', () => {
        it('should return false when fingerprint sensor driver not loaded', async () => {
            // Scenario: Device has fingerprint hardware but driver not initialized
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(true);  // Enrolled but driver not ready

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when side-mounted fingerprint sensor not detected', async () => {
            // A52s has side-mounted fingerprint sensor that sometimes isn't detected
            mockHasHardwareAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false after Samsung software update', async () => {
            // Scenario: Post-OTA update, fingerprint transient failure
            mockHasHardwareAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    describe('Samsung A52s 5G: Multiple Biometric Types', () => {
        it('should return false when both fingerprint and face are unavailable', async () => {
            // A52s has both, but if both fail, should return false
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return true when at least one biometric type is available and enrolled', async () => {
            // If fingerprint is unavailable but face works (or vice versa)
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(true);
        });
    });

    describe('Samsung A52s 5G: Device Credential vs Biometric Confusion', () => {
        it('should return false when device has PIN but no biometrics', async () => {
            // CRITICAL: KeyguardManager.isDeviceSecure() returns true for PIN
            // But biometric checks should still return false if no biometric
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should distinguish between device credential and biometric', async () => {
            // User might have PIN but no fingerprint enrolled
            mockHasHardwareAsync.mockResolvedValue(false);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    // ================================================================
    // Module Loading Failures
    // ================================================================

    describe('Module Loading Failures (Critical for Android)', () => {
        it('should return false when LocalAuth module fails to load', async () => {
            // Simulate module loading failure
            // The NativeBiometricAuthenticator would return false from isAvailable()
            mockHasHardwareAsync.mockRejectedValue(new Error('Module not found'));

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync is undefined', async () => {
            // Protect against missing method
            mockHasHardwareAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync returns null', async () => {
            mockHasHardwareAsync.mockResolvedValue(null);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    // ================================================================
    // Edge Cases That Could Cause False Positives
    // ================================================================

    describe('Edge Cases - Prevention of False Positives', () => {
        it('should return false when both async calls throw', async () => {
            mockHasHardwareAsync.mockRejectedValue(new Error('Hardware error'));
            mockIsEnrolledAsync.mockRejectedValue(new Error('Enrollment error'));

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync returns empty string', async () => {
            // Falsy but not exactly false
            mockHasHardwareAsync.mockResolvedValue('');

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync returns 0', async () => {
            // Falsy but not exactly false
            mockHasHardwareAsync.mockResolvedValue(0);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when isEnrolledAsync returns empty string', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue('');

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when isEnrolledAsync returns 0', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(0);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    // ================================================================
    // State Consistency Tests
    // ================================================================

    describe('State Consistency - Multiple Calls', () => {
        it('should return consistent result for multiple calls', async () => {
            mockHasHardwareAsync.mockResolvedValue(false);

            const result1 = await biometricAuth.isBiometricAvailable();
            const result2 = await biometricAuth.isBiometricAvailable();
            const result3 = await biometricAuth.isBiometricAvailable();

            expect(result1).toBe(false);
            expect(result2).toBe(false);
            expect(result3).toBe(false);
        });

        it('should detect state change when hardware becomes unavailable', async () => {
            // First call: available
            mockHasHardwareAsync.mockResolvedValueOnce(true);
            mockIsEnrolledAsync.mockResolvedValueOnce(true);

            const result1 = await biometricAuth.isBiometricAvailable();
            expect(result1).toBe(true);

            // Second call: no longer available (e.g., after disable)
            mockHasHardwareAsync.mockResolvedValueOnce(false);

            const result2 = await biometricAuth.isBiometricAvailable();
            expect(result2).toBe(false);
        });
    });

    // ================================================================
    // Integration: Verify Profile Screen Would Hide Security Section
    // ================================================================

    describe('Integration: Security Section Visibility', () => {
        it('should have isBiometricAvailable=false so Profile hides Security section', async () => {
            // This mimics what ProfileScreen does
            mockHasHardwareAsync.mockResolvedValue(false);

            const biometricAvailable = await biometricAuth.isBiometricAvailable();

            // This is what controls Security section visibility in Profile screen
            const shouldShowSecuritySection = biometricAvailable;

            expect(shouldShowSecuritySection).toBe(false);
        });

        it('should show Security section only when biometrics truly available', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const biometricAvailable = await biometricAuth.isBiometricAvailable();
            const shouldShowSecuritySection = biometricAvailable;

            expect(shouldShowSecuritySection).toBe(true);
        });

        it('should hide Security section when hardware missing', async () => {
            // Samsung A52s scenario: face framework not initialized
            mockHasHardwareAsync.mockResolvedValue(false);

            const biometricAvailable = await biometricAuth.isBiometricAvailable();

            expect(biometricAvailable).toBe(false);
        });

        it('should hide Security section when nothing enrolled', async () => {
            // Device has hardware but user hasn't enrolled anything
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const biometricAvailable = await biometricAuth.isBiometricAvailable();

            expect(biometricAvailable).toBe(false);
        });
    });

    // ================================================================
    // Root Cause Analysis: Why Availability Might Be Wrong
    // ================================================================

    describe('Root Cause Analysis: Availability Check Failures', () => {
        it('detects when hasHardwareAsync silently returns undefined', async () => {
            // Potential issue: missing error handling for undefined return
            mockHasHardwareAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
            console.log('Root cause: hasHardwareAsync returned undefined');
        });

        it('detects when isEnrolledAsync is never called', async () => {
            // Potential issue: early return logic
            mockHasHardwareAsync.mockResolvedValue(false);

            await biometricAuth.isBiometricAvailable();

            // If hardware is false, isEnrolledAsync should not be called
            expect(mockIsEnrolledAsync).not.toHaveBeenCalled();
        });

        it('detects when biometric check timeout is exceeded', async () => {
            // Samsung A52s can have slow hardware checks
            const slowPromise = new Promise<boolean>(resolve => {
                setTimeout(() => resolve(false), 2000);
            });
            mockHasHardwareAsync.mockReturnValue(slowPromise);

            // Should handle slow responses
            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should handle race condition between multiple availability checks', async () => {
            // Multiple calls at once (Profile component useEffect + login screen)
            mockHasHardwareAsync.mockResolvedValue(false);

            const results = await Promise.all([
                biometricAuth.isBiometricAvailable(),
                biometricAuth.isBiometricAvailable(),
                biometricAuth.isBiometricAvailable(),
            ]);

            expect(results).toEqual([false, false, false]);
        });
    });

    // ================================================================
    // Android-Specific Biometric States
    // ================================================================

    describe('Android Biometric States (BiometricManager)', () => {
        it('should map BIOMETRIC_ERROR_NO_HARDWARE to false', async () => {
            // BiometricManager.canAuthenticate() returns BIOMETRIC_ERROR_NO_HARDWARE
            mockHasHardwareAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should map BIOMETRIC_ERROR_NONE_ENROLLED to false', async () => {
            // BiometricManager.canAuthenticate() returns BIOMETRIC_ERROR_NONE_ENROLLED
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should map BIOMETRIC_SUCCESS to true (with enrollment)', async () => {
            // BiometricManager.canAuthenticate() returns BIOMETRIC_SUCCESS
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(true);
        });
    });
});

// ================================================================
// Samsung A52s 5G: Authenticate Error Scenarios
// ================================================================

describe('Samsung A52s 5G Authenticate Error Scenarios', () => {
    const originalPlatformOS = Platform.OS;
    const mockAuthenticateAsync = LocalAuth.authenticateAsync as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = 'android';
        if (__resetServiceForTesting) __resetServiceForTesting();
    });

    afterAll(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    it('should return false when Samsung BiometricPrompt returns timeout (dialog covers sensor)', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'timeout',
            warning: 'Biometric operation timed out',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false when Samsung returns not_available due to sensor busy', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'not_available',
            warning: 'BiometricPrompt: ERROR_HW_UNAVAILABLE',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false when Samsung returns unable_to_process (smudged sensor)', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'unable_to_process',
            warning: 'Unable to process fingerprint',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false when Samsung BiometricPrompt throws NullPointerException', async () => {
        mockAuthenticateAsync.mockRejectedValue(
            new Error('Canceled authentication due to an internal error')
        );

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false on lockout after too many failed attempts', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'lockout',
            warning: 'Too many failed attempts. Try again later.',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false when KeyguardManager.isDeviceSecure() returned false', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'not_enrolled',
            warning: 'KeyguardManager#isDeviceSecure() returned false',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false on app_cancel from concurrent auth attempts', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'app_cancel',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false on user_cancel from Device Credentials fallback', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'user_cancel',
            warning: 'Device Credentials canceled',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });

    it('should return false for unknown error codes', async () => {
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'unknown',
        });

        const result = await biometricAuth.authenticateWithBiometrics();
        expect(result).toBe(false);
    });
});

// ================================================================
// Samsung A52s 5G: Login Screen Combined Gate
// (isBiometricAvailable + getBiometricPreference via Promise.all)
// ================================================================

describe('Samsung A52s 5G Login Screen Combined Gate', () => {
    const originalPlatformOS = Platform.OS;
    const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = 'android';
        if (__resetServiceForTesting) __resetServiceForTesting();
    });

    afterAll(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    it('should show biometric button only when BOTH available and preference enabled', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockResolvedValue(true);
        mockGetItemAsync.mockResolvedValue('true');

        // Mirrors login.tsx useEffect pattern
        const [available, enabled] = await Promise.all([
            biometricAuth.isBiometricAvailable(),
            biometricAuth.getBiometricPreference(),
        ]);
        const showButton = available && enabled;

        expect(showButton).toBe(true);
    });

    it('should hide biometric button when available but preference disabled', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockResolvedValue(true);
        mockGetItemAsync.mockResolvedValue('false');

        const [available, enabled] = await Promise.all([
            biometricAuth.isBiometricAvailable(),
            biometricAuth.getBiometricPreference(),
        ]);

        expect(available).toBe(true);
        expect(enabled).toBe(false);
        expect(available && enabled).toBe(false);
    });

    it('should hide biometric button when preference enabled but hardware unavailable', async () => {
        mockHasHardwareAsync.mockResolvedValue(false);
        mockGetItemAsync.mockResolvedValue('true');

        const [available, enabled] = await Promise.all([
            biometricAuth.isBiometricAvailable(),
            biometricAuth.getBiometricPreference(),
        ]);

        expect(available).toBe(false);
        expect(enabled).toBe(true);
        expect(available && enabled).toBe(false);
    });

    it('should handle availability check failure in Promise.all gracefully', async () => {
        mockHasHardwareAsync.mockRejectedValue(new Error('Framework not ready'));
        mockGetItemAsync.mockResolvedValue('true');

        // isBiometricAvailable catches internally and returns false
        const [available, enabled] = await Promise.all([
            biometricAuth.isBiometricAvailable(),
            biometricAuth.getBiometricPreference(),
        ]);

        expect(available).toBe(false);
        expect(enabled).toBe(true);
        expect(available && enabled).toBe(false);
    });

    it('should handle preference check failure in Promise.all gracefully', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockResolvedValue(true);
        mockGetItemAsync.mockRejectedValue(new Error('SecureStore unavailable'));

        const [available, enabled] = await Promise.all([
            biometricAuth.isBiometricAvailable(),
            biometricAuth.getBiometricPreference(),
        ]);

        expect(available).toBe(true);
        expect(enabled).toBe(false);
        expect(available && enabled).toBe(false);
    });

    it('should handle both checks failing simultaneously', async () => {
        mockHasHardwareAsync.mockRejectedValue(new Error('Hardware error'));
        mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

        const [available, enabled] = await Promise.all([
            biometricAuth.isBiometricAvailable(),
            biometricAuth.getBiometricPreference(),
        ]);

        expect(available).toBe(false);
        expect(enabled).toBe(false);
        expect(available && enabled).toBe(false);
    });
});

// ================================================================
// Samsung A52s 5G: Full End-to-End Flow Simulation
// ================================================================

describe('Samsung A52s 5G Full Biometric Flow Simulation', () => {
    const originalPlatformOS = Platform.OS;
    const mockAuthenticateAsync = LocalAuth.authenticateAsync as jest.Mock;
    const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
    const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = 'android';
        if (__resetServiceForTesting) __resetServiceForTesting();
    });

    afterAll(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    it('should succeed end-to-end when Samsung sensor works correctly', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockResolvedValue(true);
        mockSetItemAsync.mockResolvedValue(undefined);
        mockGetItemAsync.mockResolvedValue('true');
        mockAuthenticateAsync.mockResolvedValue({ success: true });

        // Step 1: Check availability
        const available = await biometricAuth.isBiometricAvailable();
        expect(available).toBe(true);

        // Step 2: Check preference
        const preference = await biometricAuth.getBiometricPreference();
        expect(preference).toBe(true);

        // Step 3: Authenticate
        const authenticated = await biometricAuth.authenticateWithBiometrics(
            'Authenticate to sign in'
        );
        expect(authenticated).toBe(true);
    });

    it('should fail at availability when Samsung sensor is unresponsive after boot', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockRejectedValue(
            new Error('Timed out waiting for biometric enrollment status')
        );

        const available = await biometricAuth.isBiometricAvailable();
        expect(available).toBe(false);

        // Should not proceed to authenticate
        expect(mockAuthenticateAsync).not.toHaveBeenCalled();
    });

    it('should fail at authenticate when BiometricPrompt dialog covers in-display sensor', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockResolvedValue(true);
        mockGetItemAsync.mockResolvedValue('true');
        mockAuthenticateAsync.mockResolvedValue({
            success: false,
            error: 'timeout',
        });

        const available = await biometricAuth.isBiometricAvailable();
        expect(available).toBe(true);

        const preference = await biometricAuth.getBiometricPreference();
        expect(preference).toBe(true);

        const authenticated = await biometricAuth.authenticateWithBiometrics(
            'Authenticate to sign in'
        );
        expect(authenticated).toBe(false);
    });

    it('should fail at preference check when SecureStore is unavailable', async () => {
        mockHasHardwareAsync.mockResolvedValue(true);
        mockIsEnrolledAsync.mockResolvedValue(true);
        mockGetItemAsync.mockRejectedValue(new Error('SecureStore unavailable'));

        const available = await biometricAuth.isBiometricAvailable();
        expect(available).toBe(true);

        // Preference returns false due to SecureStore error
        const preference = await biometricAuth.getBiometricPreference();
        expect(preference).toBe(false);

        // Login screen would NOT show biometric button
        expect(available && preference).toBe(false);
    });
});

/**
 * SECURITY SECTION VISIBILITY AUDIT
 *
 * The Security section in Profile screen is conditionally rendered:
 *
 *     {biometricAvailable && (
 *         <View testID="biometric-section">
 *             <ThemedText>Security</ThemedText>
 *             ...
 *         </View>
 *     )}
 *
 * If isBiometricAvailable() returns true incorrectly on Samsung A52s,
 * the Security section will SHOW when it shouldn't.
 *
 * These tests MUST all pass to ensure:
 * - Security section hidden when NO hardware
 * - Security section hidden when nothing enrolled
 * - Security section shown when hardware AND enrolled
 * - No false positives on Samsung-specific scenarios
 */
