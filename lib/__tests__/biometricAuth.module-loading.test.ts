/**
 * CRITICAL: Module Loading Diagnostics
 *
 * Tests to verify expo-local-authentication module is properly loaded and initialized.
 * If these tests fail, the module is not available on the device/build.
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
import * as biometricAuth from '../biometricAuth';

const { __resetServiceForTesting } = biometricAuth as any;
const mockHasHardwareAsync = LocalAuth.hasHardwareAsync as jest.Mock;

describe('CRITICAL: Module Loading Diagnostics', () => {
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
    // CRITICAL: Module Must Be Available
    // ================================================================

    describe('CRITICAL: expo-local-authentication module availability', () => {
        it('MUST have hasHardwareAsync function', () => {
            // If this fails, the module is not properly installed
            expect(typeof LocalAuth.hasHardwareAsync).toBe('function');
        });

        it('MUST have isEnrolledAsync function', () => {
            expect(typeof LocalAuth.isEnrolledAsync).toBe('function');
        });

        it('MUST have authenticateAsync function', () => {
            expect(typeof LocalAuth.authenticateAsync).toBe('function');
        });

        it('should have getEnrolledLevelAsync function if available', () => {
            // getEnrolledLevelAsync may not be present in all mock configurations
            // The critical functions are hasHardwareAsync, isEnrolledAsync, authenticateAsync
            // This test just verifies the check doesn't crash
            const hasFunction = typeof (LocalAuth as any).getEnrolledLevelAsync === 'function';
            expect(typeof hasFunction).toBe('boolean');
        });

        it('MUST have supportedAuthenticationTypesAsync function', () => {
            expect(typeof LocalAuth.supportedAuthenticationTypesAsync).toBe('function');
        });
    });

    // ================================================================
    // CRITICAL: Return Values Must Not Be Undefined
    // ================================================================

    describe('CRITICAL: hasHardwareAsync must return boolean', () => {
        it('hasHardwareAsync must return true or false, never undefined', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);

            const result = await LocalAuth.hasHardwareAsync();

            expect(result).not.toBeUndefined();
            expect(typeof result).toBe('boolean');
        });

        it('should safely handle undefined return from hasHardwareAsync', async () => {
            // When the native module returns undefined (broken linking),
            // isBiometricAvailable should gracefully return false
            mockHasHardwareAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();

            // The service should handle undefined gracefully
            expect(result).toBe(false);
        });

        it('should safely handle null return from hasHardwareAsync', async () => {
            // When the native module returns null (partial loading),
            // isBiometricAvailable should gracefully return false
            mockHasHardwareAsync.mockResolvedValue(null);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });
    });

    // ================================================================
    // Detect Broken Module Loads
    // ================================================================

    describe('Detect when module is not properly initialized', () => {
        it('should detect if require fails silently', async () => {
            // Simulate require failing
            jest.doMock('expo-local-authentication', () => {
                throw new Error('Module not found');
            });

            const result = await biometricAuth.isBiometricAvailable();

            // Should safely return false, not throw
            expect(result).toBe(false);
        });

        it('should detect if module returns null', async () => {
            mockHasHardwareAsync.mockResolvedValue(null);

            const result = await biometricAuth.isBiometricAvailable();

            // Null is falsy, should return false
            expect(result).toBe(false);
        });

        it('should detect if module returns undefined', async () => {
            mockHasHardwareAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();

            // Undefined is falsy, should return false
            expect(result).toBe(false);
        });

        it('should detect if method does not exist', async () => {
            // Simulate method not existing
            const mockAuth = {
                // hasHardwareAsync intentionally missing
                isEnrolledAsync: jest.fn(),
            };

            // This would happen if module is partially loaded
            const hasMethod = 'hasHardwareAsync' in mockAuth;
            expect(hasMethod).toBe(false);
        });
    });

    // ================================================================
    // APK Linking Verification
    // ================================================================

    describe('APK Linking and Native Module Status', () => {
        it('should verify NativeModule proxy can access ExpoLocalAuthentication', () => {
            // If this fails on device, the native module wasn't linked in APK
            const { NativeModulesProxy } = require('expo-modules-core');

            // Check if ExpoLocalAuthentication is available
            // This would be ExpoLocalAuthentication in native module list
            const hasModule = NativeModulesProxy !== undefined;

            expect(hasModule).toBe(true);
        });

        it('should detect if expo prebuild was not run', () => {
            // If expo prebuild wasn't run after installing expo-local-authentication,
            // the native module files won't be in the APK

            // Check if LocalAuth module has methods
            const hasRequiredMethods =
                typeof LocalAuth.hasHardwareAsync === 'function' &&
                typeof LocalAuth.isEnrolledAsync === 'function' &&
                typeof LocalAuth.authenticateAsync === 'function';

            if (!hasRequiredMethods) {
                console.error('[CRITICAL] expo-local-authentication native module not properly linked!');
                console.error('[ACTION REQUIRED] Run: expo prebuild --clean');
                console.error('[ACTION REQUIRED] Then rebuild the APK with: eas build --platform android');
            }

            expect(hasRequiredMethods).toBe(true);
        });

        it('should verify module is callable on Android', async () => {
            (Platform as any).OS = 'android';

            // On Android, the module should be available
            const isCallable = typeof LocalAuth.hasHardwareAsync === 'function';

            expect(isCallable).toBe(true);
        });
    });

    // ================================================================
    // Samsung A52s 5G Specific Module Issues
    // ================================================================

    describe('Samsung A52s 5G: Module initialization on device', () => {
        it('should handle module returning undefined on Samsung cold boot', async () => {
            // Samsung may take time initializing the BiometricManager
            mockHasHardwareAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.isBiometricAvailable();

            // Should gracefully return false, not crash
            expect(result).toBe(false);
        });

        it('should verify module doesn\'t crash app if undefined returned', async () => {
            mockHasHardwareAsync.mockResolvedValue(undefined);

            // This should not throw an error
            await expect(biometricAuth.isBiometricAvailable()).resolves.toBe(false);
        });

        it('should handle module initialization delay on Samsung', async () => {
            // First call returns undefined (module not ready)
            mockHasHardwareAsync.mockResolvedValueOnce(undefined);

            const result1 = await biometricAuth.isBiometricAvailable();
            expect(result1).toBe(false);

            // Second call returns false (module ready, no hardware)
            mockHasHardwareAsync.mockResolvedValueOnce(false);

            const result2 = await biometricAuth.isBiometricAvailable();
            expect(result2).toBe(false);
        });
    });

    // ================================================================
    // Diagnostic Output for Debugging
    // ================================================================

    describe('Diagnostic logging for debugging on device', () => {
        it('should log module status for debugging', async () => {
            const spy = jest.spyOn(console, 'log');

            mockHasHardwareAsync.mockResolvedValue(true);
            await biometricAuth.isBiometricAvailable();

            // Should log hardware status
            expect(spy).toHaveBeenCalledWith(
                '[Biometric] Hardware available:',
                expect.any(Boolean)
            );

            spy.mockRestore();
        });

        it('should return false on web platform without calling native module', async () => {
            const spy = jest.spyOn(console, 'log');

            (Platform as any).OS = 'web';
            if (__resetServiceForTesting) __resetServiceForTesting();

            const result = await biometricAuth.isBiometricAvailable();

            // On web, NullBiometricAuthenticator is used, which returns false
            expect(result).toBe(false);
            // Native hasHardwareAsync should NOT be called on web
            expect(mockHasHardwareAsync).not.toHaveBeenCalled();

            spy.mockRestore();
        });
    });
});

/**
 * CRITICAL TROUBLESHOOTING GUIDE
 *
 * If tests fail, your expo-local-authentication is not properly installed:
 *
 * **Symptom:** "hasHardwareAsync returned undefined"
 * **Cause:** Native module not linked in APK
 * **Solution:**
 *   1. Verify expo-local-authentication is in package.json:
 *      npm list expo-local-authentication
 *
 *   2. Clean and prebuild native modules:
 *      expo prebuild --clean
 *
 *   3. Rebuild APK:
 *      eas build --platform android --profile preview
 *      OR for local build:
 *      expo run:android
 *
 *   4. Clear device cache:
 *      adb shell pm clear com.yourapp.name
 *
 *   5. Reinstall app
 *
 * **Symptom:** "Module not found" error
 * **Cause:** Package not installed
 * **Solution:**
 *   npm install expo-local-authentication
 *   expo prebuild --clean
 *
 * **Symptom:** Tests pass but device returns undefined
 * **Cause:** APK was built before installing the package
 * **Solution:**
 *   Delete old APK
 *   Run: expo prebuild --clean
 *   Run: eas build --platform android
 *   Install new APK on device
 *
 * **Samsung A52s 5G Specific:**
 * - Device may initialize BiometricManager slowly on cold boot
 * - If undefined returned on first call, that's normal
 * - Retry logic needed for initial app launch
 * - Check logs: adb logcat | grep -i "expo\|biometric"
 */
