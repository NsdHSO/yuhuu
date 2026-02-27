// The jest.setup.js already mocks expo-local-authentication and react-native.
// We need to additionally mock expo-modules-core for canUseSecureStore().
jest.mock('expo-modules-core', () => ({
    NativeModulesProxy: { ExpoSecureStore: {} },
}));

// expo-secure-store is NOT mocked globally in jest.setup.js, so mock it here.
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

// Import testing utility
const { __resetServiceForTesting } = biometricAuth as any;

// Get typed references to the mock functions.
// expo-local-authentication is mocked in jest.setup.js with jest.fn().
// expo-secure-store is mocked above with jest.fn().
const mockHasHardwareAsync = LocalAuth.hasHardwareAsync as jest.Mock;
const mockIsEnrolledAsync = LocalAuth.isEnrolledAsync as jest.Mock;
const mockAuthenticateAsync = LocalAuth.authenticateAsync as jest.Mock;
const mockSetItemAsync = SecureStore.setItemAsync as jest.Mock;
const mockGetItemAsync = SecureStore.getItemAsync as jest.Mock;
const mockDeleteItemAsync = SecureStore.deleteItemAsync as jest.Mock;

describe('biometricAuth', () => {
    const originalPlatformOS = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        (Platform as any).OS = 'ios';
        // Reset singleton to pick up new Platform.OS
        if (__resetServiceForTesting) __resetServiceForTesting();
    });

    afterAll(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    // ----------------------------------------------------------------
    // isBiometricAvailable
    // ----------------------------------------------------------------
    describe('isBiometricAvailable', () => {
        it('should return true when hardware exists and is enrolled', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(true);
            expect(mockHasHardwareAsync).toHaveBeenCalledTimes(1);
            expect(mockIsEnrolledAsync).toHaveBeenCalledTimes(1);
        });

        it('should return false when no hardware', async () => {
            mockHasHardwareAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
            expect(mockIsEnrolledAsync).not.toHaveBeenCalled();
        });

        it('should return false when hardware exists but not enrolled', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(false);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when hasHardwareAsync throws', async () => {
            mockHasHardwareAsync.mockRejectedValue(new Error('Hardware check failed'));

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false when isEnrolledAsync throws', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockRejectedValue(new Error('Enrollment check failed'));

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false on web platform', async () => {
            (Platform as any).OS = 'web';

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
            expect(mockHasHardwareAsync).not.toHaveBeenCalled();
        });

        it('should work on android platform', async () => {
            (Platform as any).OS = 'android';
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(true);
        });

        it('should call hasHardwareAsync before isEnrolledAsync', async () => {
            const callOrder: string[] = [];
            mockHasHardwareAsync.mockImplementation(() => {
                callOrder.push('hasHardware');
                return Promise.resolve(true);
            });
            mockIsEnrolledAsync.mockImplementation(() => {
                callOrder.push('isEnrolled');
                return Promise.resolve(true);
            });

            await biometricAuth.isBiometricAvailable();

            expect(callOrder).toEqual(['hasHardware', 'isEnrolled']);
        });
    });

    // ----------------------------------------------------------------
    // authenticateWithBiometrics
    // ----------------------------------------------------------------
    describe('authenticateWithBiometrics', () => {
        it('should return true on successful authentication', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(true);
            expect(mockAuthenticateAsync).toHaveBeenCalledWith({
                promptMessage: 'Authenticate to sign in',
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });
        });

        it('should use custom prompt message', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            await biometricAuth.authenticateWithBiometrics('Custom prompt');

            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ promptMessage: 'Custom prompt' })
            );
        });

        it('should use default prompt when none provided', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            await biometricAuth.authenticateWithBiometrics();

            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ promptMessage: 'Authenticate to sign in' })
            );
        });

        it('should return false on failed authentication', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: false });

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });

        it('should return false on user cancellation', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'user_cancel',
            });

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });

        it('should return false when authenticateAsync throws', async () => {
            mockAuthenticateAsync.mockRejectedValue(new Error('Auth error'));

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });

        it('should return false on lockout error', async () => {
            mockAuthenticateAsync.mockResolvedValue({
                success: false,
                error: 'lockout',
            });

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });

        it('should pass empty string prompt without error', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            const result = await biometricAuth.authenticateWithBiometrics('');

            expect(result).toBe(true);
            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ promptMessage: '' })
            );
        });

        it('should return false on web platform', async () => {
            (Platform as any).OS = 'web';

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
            expect(mockAuthenticateAsync).not.toHaveBeenCalled();
        });

        it('should work on android platform with custom prompt', async () => {
            (Platform as any).OS = 'android';
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            const result = await biometricAuth.authenticateWithBiometrics('Fingerprint required');

            expect(result).toBe(true);
            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ promptMessage: 'Fingerprint required' })
            );
        });

        it('should pass disableDeviceFallback as false', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            await biometricAuth.authenticateWithBiometrics();

            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ disableDeviceFallback: false })
            );
        });

        it('should pass cancelLabel as Cancel', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            await biometricAuth.authenticateWithBiometrics();

            expect(mockAuthenticateAsync).toHaveBeenCalledWith(
                expect.objectContaining({ cancelLabel: 'Cancel' })
            );
        });
    });

    // ----------------------------------------------------------------
    // saveBiometricPreference
    // ----------------------------------------------------------------
    describe('saveBiometricPreference', () => {
        it('should save preference as true', async () => {
            await biometricAuth.saveBiometricPreference(true);

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_enabled',
                'true',
                expect.objectContaining({
                    requireAuthentication: false,
                })
            );
        });

        it('should save preference as false', async () => {
            await biometricAuth.saveBiometricPreference(false);

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_enabled',
                'false',
                expect.any(Object)
            );
        });

        it('should not throw when setItemAsync fails', async () => {
            mockSetItemAsync.mockRejectedValue(new Error('Storage write error'));

            await expect(biometricAuth.saveBiometricPreference(true)).resolves.not.toThrow();
        });

        it('should use WHEN_UNLOCKED_THIS_DEVICE_ONLY accessibility', async () => {
            await biometricAuth.saveBiometricPreference(true);

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_enabled',
                'true',
                expect.objectContaining({
                    keychainAccessible: 1,
                })
            );
        });
    });

    // ----------------------------------------------------------------
    // getBiometricPreference
    // ----------------------------------------------------------------
    describe('getBiometricPreference', () => {
        it('should return true when preference is stored as true', async () => {
            mockGetItemAsync.mockResolvedValue('true');

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(true);
            expect(mockGetItemAsync).toHaveBeenCalledWith('biometric_enabled');
        });

        it('should return false when preference is stored as false', async () => {
            mockGetItemAsync.mockResolvedValue('false');

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(false);
        });

        it('should return false when no preference is stored', async () => {
            mockGetItemAsync.mockResolvedValue(null);

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(false);
        });

        it('should return false when getItemAsync throws', async () => {
            mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(false);
        });

        it('should return false for unexpected stored values', async () => {
            mockGetItemAsync.mockResolvedValue('yes');

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(false);
        });

        it('should return false for empty string', async () => {
            mockGetItemAsync.mockResolvedValue('');

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(false);
        });

        it('should return false when getItemAsync returns undefined', async () => {
            mockGetItemAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.getBiometricPreference();

            expect(result).toBe(false);
        });
    });

    // ----------------------------------------------------------------
    // saveBiometricEmail
    // ----------------------------------------------------------------
    describe('saveBiometricEmail', () => {
        it('should save email to secure store', async () => {
            await biometricAuth.saveBiometricEmail('test@example.com');

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_email',
                'test@example.com',
                expect.objectContaining({
                    requireAuthentication: false,
                })
            );
        });

        it('should handle empty email string', async () => {
            await biometricAuth.saveBiometricEmail('');

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_email',
                '',
                expect.any(Object)
            );
        });

        it('should save and handle email with special characters', async () => {
            await biometricAuth.saveBiometricEmail('user+tag@sub.example.com');

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_email',
                'user+tag@sub.example.com',
                expect.any(Object)
            );
        });

        it('should not throw when secure store write fails', async () => {
            mockSetItemAsync.mockRejectedValue(new Error('Write failed'));

            await expect(
                biometricAuth.saveBiometricEmail('user@example.com')
            ).resolves.not.toThrow();
        });

        it('should use WHEN_UNLOCKED_THIS_DEVICE_ONLY for email storage', async () => {
            await biometricAuth.saveBiometricEmail('user@test.com');

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_email',
                'user@test.com',
                expect.objectContaining({
                    keychainAccessible: 1,
                    requireAuthentication: false,
                })
            );
        });

        it('should handle email with unicode characters', async () => {
            await biometricAuth.saveBiometricEmail('user@exampl\u00e9.com');

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_email',
                'user@exampl\u00e9.com',
                expect.any(Object)
            );
        });

        it('should handle very long email address', async () => {
            const longEmail = 'a'.repeat(200) + '@example.com';
            await biometricAuth.saveBiometricEmail(longEmail);

            expect(mockSetItemAsync).toHaveBeenCalledWith(
                'biometric_email',
                longEmail,
                expect.any(Object)
            );
        });
    });

    // ----------------------------------------------------------------
    // getBiometricEmail
    // ----------------------------------------------------------------
    describe('getBiometricEmail', () => {
        it('should retrieve saved email', async () => {
            mockGetItemAsync.mockResolvedValue('test@example.com');

            const result = await biometricAuth.getBiometricEmail();

            expect(result).toBe('test@example.com');
            expect(mockGetItemAsync).toHaveBeenCalledWith('biometric_email');
        });

        it('should return null when no email is stored', async () => {
            mockGetItemAsync.mockResolvedValue(null);

            const result = await biometricAuth.getBiometricEmail();

            expect(result).toBeNull();
        });

        it('should return null when getItemAsync throws', async () => {
            mockGetItemAsync.mockRejectedValue(new Error('Storage error'));

            const result = await biometricAuth.getBiometricEmail();

            expect(result).toBeNull();
        });

        it('should return empty string when empty string is stored', async () => {
            mockGetItemAsync.mockResolvedValue('');

            const result = await biometricAuth.getBiometricEmail();

            expect(result).toBe('');
        });

        it('should return null when getItemAsync returns undefined', async () => {
            mockGetItemAsync.mockResolvedValue(undefined);

            const result = await biometricAuth.getBiometricEmail();

            expect(result).toBeNull();
        });
    });

    // ----------------------------------------------------------------
    // clearBiometricData
    // ----------------------------------------------------------------
    describe('clearBiometricData', () => {
        it('should delete both biometric keys from secure store', async () => {
            await biometricAuth.clearBiometricData();

            expect(mockDeleteItemAsync).toHaveBeenCalledWith('biometric_enabled');
            expect(mockDeleteItemAsync).toHaveBeenCalledWith('biometric_email');
            expect(mockDeleteItemAsync).toHaveBeenCalledTimes(2);
        });

        it('should handle deleteItemAsync error gracefully', async () => {
            mockDeleteItemAsync.mockRejectedValue(new Error('Delete error'));

            await expect(biometricAuth.clearBiometricData()).resolves.not.toThrow();
        });

        it('should continue deleting email even when preference delete fails', async () => {
            mockDeleteItemAsync
                .mockRejectedValueOnce(new Error('Delete error'))
                .mockResolvedValueOnce(undefined);

            await biometricAuth.clearBiometricData();

            expect(mockDeleteItemAsync).toHaveBeenCalledTimes(2);
            expect(mockDeleteItemAsync).toHaveBeenCalledWith('biometric_enabled');
            expect(mockDeleteItemAsync).toHaveBeenCalledWith('biometric_email');
        });

        it('should not throw when email delete fails', async () => {
            mockDeleteItemAsync
                .mockResolvedValueOnce(undefined)
                .mockRejectedValueOnce(new Error('Delete error'));

            await expect(biometricAuth.clearBiometricData()).resolves.not.toThrow();
            expect(mockDeleteItemAsync).toHaveBeenCalledTimes(2);
        });

        it('should not throw when both deletions fail', async () => {
            mockDeleteItemAsync.mockRejectedValue(new Error('Delete error'));

            await expect(biometricAuth.clearBiometricData()).resolves.not.toThrow();
        });
    });

    // ----------------------------------------------------------------
    // Web platform behavior
    // ----------------------------------------------------------------
    describe('web platform behavior', () => {
        beforeEach(() => {
            (Platform as any).OS = 'web';
        });

        it('should return false for isBiometricAvailable on web', async () => {
            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(false);
        });

        it('should return false for authenticateWithBiometrics on web', async () => {
            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });

        it('should not call any local authentication APIs on web', async () => {
            await biometricAuth.isBiometricAvailable();
            await biometricAuth.authenticateWithBiometrics();

            expect(mockHasHardwareAsync).not.toHaveBeenCalled();
            expect(mockIsEnrolledAsync).not.toHaveBeenCalled();
            expect(mockAuthenticateAsync).not.toHaveBeenCalled();
        });
    });

    // ----------------------------------------------------------------
    // Android platform behavior
    // ----------------------------------------------------------------
    describe('android platform behavior', () => {
        beforeEach(() => {
            (Platform as any).OS = 'android';
        });

        it('should check biometric availability on Android', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);

            const result = await biometricAuth.isBiometricAvailable();

            expect(result).toBe(true);
        });

        it('should authenticate on Android', async () => {
            mockAuthenticateAsync.mockResolvedValue({ success: true });

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(true);
        });

        it('should save and get preference on Android', async () => {
            mockSetItemAsync.mockResolvedValue(undefined);
            mockGetItemAsync.mockResolvedValue('true');

            await biometricAuth.saveBiometricPreference(true);
            const pref = await biometricAuth.getBiometricPreference();

            expect(pref).toBe(true);
        });
    });

    // ----------------------------------------------------------------
    // Return value coercion edge cases
    // ----------------------------------------------------------------
    describe('return value coercion edge cases', () => {
        it('should return false when authenticateAsync result has no success field', async () => {
            mockAuthenticateAsync.mockResolvedValue({});

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });

        it('should return false when authenticateAsync returns null', async () => {
            mockAuthenticateAsync.mockResolvedValue(null);

            const result = await biometricAuth.authenticateWithBiometrics();

            expect(result).toBe(false);
        });
    });

    // ----------------------------------------------------------------
    // Overwrite behavior
    // ----------------------------------------------------------------
    describe('overwrite behavior', () => {
        it('should overwrite previous preference when saving again', async () => {
            mockSetItemAsync.mockResolvedValue(undefined);

            await biometricAuth.saveBiometricPreference(true);
            await biometricAuth.saveBiometricPreference(false);

            expect(mockSetItemAsync).toHaveBeenCalledTimes(2);
            expect(mockSetItemAsync).toHaveBeenLastCalledWith(
                'biometric_enabled',
                'false',
                expect.any(Object)
            );
        });

        it('should overwrite previous email when saving again', async () => {
            mockSetItemAsync.mockResolvedValue(undefined);

            await biometricAuth.saveBiometricEmail('first@test.com');
            await biometricAuth.saveBiometricEmail('second@test.com');

            expect(mockSetItemAsync).toHaveBeenCalledTimes(2);
            expect(mockSetItemAsync).toHaveBeenLastCalledWith(
                'biometric_email',
                'second@test.com',
                expect.any(Object)
            );
        });
    });

    // ----------------------------------------------------------------
    // Integration scenarios
    // ----------------------------------------------------------------
    describe('integration scenarios', () => {
        it('should save and retrieve biometric preference round-trip', async () => {
            let stored: string | null = null;
            mockSetItemAsync.mockImplementation((_key: string, value: string) => {
                stored = value;
                return Promise.resolve();
            });
            mockGetItemAsync.mockImplementation(() => Promise.resolve(stored));

            await biometricAuth.saveBiometricPreference(true);
            const pref = await biometricAuth.getBiometricPreference();

            expect(pref).toBe(true);
        });

        it('should save and retrieve email round-trip', async () => {
            let stored: string | null = null;
            mockSetItemAsync.mockImplementation((_key: string, value: string) => {
                stored = value;
                return Promise.resolve();
            });
            mockGetItemAsync.mockImplementation(() => Promise.resolve(stored));

            await biometricAuth.saveBiometricEmail('test@example.com');
            const email = await biometricAuth.getBiometricEmail();

            expect(email).toBe('test@example.com');
        });

        it('should clear data and return defaults afterwards', async () => {
            mockDeleteItemAsync.mockResolvedValue(undefined);
            mockGetItemAsync.mockResolvedValue(null);

            await biometricAuth.clearBiometricData();
            const pref = await biometricAuth.getBiometricPreference();
            const email = await biometricAuth.getBiometricEmail();

            expect(pref).toBe(false);
            expect(email).toBeNull();
        });

        it('should handle full flow: check, authenticate, save', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);
            mockAuthenticateAsync.mockResolvedValue({ success: true });
            mockSetItemAsync.mockResolvedValue(undefined);

            const available = await biometricAuth.isBiometricAvailable();
            expect(available).toBe(true);

            const authenticated = await biometricAuth.authenticateWithBiometrics();
            expect(authenticated).toBe(true);

            await biometricAuth.saveBiometricPreference(true);
            await biometricAuth.saveBiometricEmail('user@example.com');

            expect(mockSetItemAsync).toHaveBeenCalledTimes(2);
        });

        it('should abort flow when availability check fails', async () => {
            mockHasHardwareAsync.mockResolvedValue(false);

            const available = await biometricAuth.isBiometricAvailable();

            expect(available).toBe(false);
            expect(mockAuthenticateAsync).not.toHaveBeenCalled();
        });

        it('should abort flow when authentication fails', async () => {
            mockHasHardwareAsync.mockResolvedValue(true);
            mockIsEnrolledAsync.mockResolvedValue(true);
            mockAuthenticateAsync.mockResolvedValue({ success: false, error: 'user_cancel' });

            const available = await biometricAuth.isBiometricAvailable();
            expect(available).toBe(true);

            const authenticated = await biometricAuth.authenticateWithBiometrics();
            expect(authenticated).toBe(false);

            expect(mockSetItemAsync).not.toHaveBeenCalled();
        });

        it('should toggle preference off after previously enabling it', async () => {
            let stored: string | null = null;
            mockSetItemAsync.mockImplementation((_key: string, value: string) => {
                stored = value;
                return Promise.resolve();
            });
            mockGetItemAsync.mockImplementation(() => Promise.resolve(stored));

            await biometricAuth.saveBiometricPreference(true);
            expect(await biometricAuth.getBiometricPreference()).toBe(true);

            await biometricAuth.saveBiometricPreference(false);
            expect(await biometricAuth.getBiometricPreference()).toBe(false);
        });
    });
});
