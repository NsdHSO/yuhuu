/**
 * Tests for constructor-level code paths in biometricAuth.ts
 *
 * These tests use jest.isolateModules to test code paths that run
 * during module loading / constructor initialization:
 * - NativeSecureStorageAdapter.loadSecureStore catch block (line 58)
 * - NativeBiometricAuthenticator.loadLocalAuth error path (lines 161-165)
 * - BiometricServiceFactory.createStorage NullStorageAdapter fallback (line 327)
 */

describe('NativeSecureStorageAdapter - loadSecureStore catch block', () => {
    it('should return null when require(expo-secure-store) throws', () => {
        jest.isolateModules(() => {
            // Mock expo-modules-core to have ExpoSecureStore present
            jest.mock('expo-modules-core', () => ({
                NativeModulesProxy: { ExpoSecureStore: {} },
            }));

            // Mock expo-secure-store to throw on require
            jest.mock('expo-secure-store', () => {
                throw new Error('Module not found');
            });

            // Mock Platform as non-web so the native path is taken
            jest.mock('react-native', () => ({
                Platform: { OS: 'ios' },
            }));

            // Mock expo-local-authentication
            jest.mock('expo-local-authentication', () => ({
                hasHardwareAsync: jest.fn().mockResolvedValue(false),
                isEnrolledAsync: jest.fn(),
                authenticateAsync: jest.fn(),
            }));

            const { __testing: t } = require('../biometricAuth');
            const adapter = new t.NativeSecureStorageAdapter();

            // The adapter should still be created, just with secureStore = null
            // which means operations are no-ops
            return adapter.getItem('test').then((result: string | null) => {
                expect(result).toBeNull();
            });
        });
    });
});

describe('NativeBiometricAuthenticator - loadLocalAuth error path', () => {
    it('should return null when require(expo-local-authentication) throws', () => {
        jest.isolateModules(() => {
            jest.mock('expo-modules-core', () => ({
                NativeModulesProxy: { ExpoSecureStore: {} },
            }));

            jest.mock('expo-secure-store', () => ({
                setItemAsync: jest.fn(),
                getItemAsync: jest.fn(),
                deleteItemAsync: jest.fn(),
                WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
            }));

            // Mock expo-local-authentication to throw
            jest.mock('expo-local-authentication', () => {
                throw new Error('Native module not linked');
            });

            jest.mock('react-native', () => ({
                Platform: { OS: 'android' },
            }));

            const { __testing: t } = require('../biometricAuth');
            const authenticator = new t.NativeBiometricAuthenticator();

            // With localAuth = null, isAvailable should return false
            return authenticator.isAvailable().then((result: boolean) => {
                expect(result).toBe(false);
            });
        });
    });

    it('should return false for authenticate when module failed to load', () => {
        jest.isolateModules(() => {
            jest.mock('expo-modules-core', () => ({
                NativeModulesProxy: { ExpoSecureStore: {} },
            }));

            jest.mock('expo-secure-store', () => ({
                setItemAsync: jest.fn(),
                getItemAsync: jest.fn(),
                deleteItemAsync: jest.fn(),
                WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
            }));

            jest.mock('expo-local-authentication', () => {
                throw new Error('Native module not linked');
            });

            jest.mock('react-native', () => ({
                Platform: { OS: 'android' },
            }));

            const { __testing: t } = require('../biometricAuth');
            const authenticator = new t.NativeBiometricAuthenticator();

            return authenticator.authenticate('Test').then((result: boolean) => {
                expect(result).toBe(false);
            });
        });
    });
});

describe('BiometricServiceFactory - NullStorageAdapter fallback', () => {
    it('should use NullStorageAdapter when NativeModulesProxy has no ExpoSecureStore', () => {
        jest.isolateModules(() => {
            // Mock expo-modules-core WITHOUT ExpoSecureStore
            jest.mock('expo-modules-core', () => ({
                NativeModulesProxy: {},
            }));

            jest.mock('expo-secure-store', () => ({
                setItemAsync: jest.fn(),
                getItemAsync: jest.fn(),
                deleteItemAsync: jest.fn(),
                WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
            }));

            jest.mock('expo-local-authentication', () => ({
                hasHardwareAsync: jest.fn().mockResolvedValue(false),
                isEnrolledAsync: jest.fn(),
                authenticateAsync: jest.fn(),
            }));

            jest.mock('react-native', () => ({
                Platform: { OS: 'android' },
            }));

            const { __testing: t } = require('../biometricAuth');
            const service = t.BiometricServiceFactory.create();

            // Service should work with NullStorageAdapter (no-op storage)
            return service.getPreference().then((result: boolean) => {
                expect(result).toBe(false);
            });
        });
    });

    it('should use NullStorageAdapter when NativeModulesProxy check throws', () => {
        jest.isolateModules(() => {
            // Mock expo-modules-core to throw when accessing NativeModulesProxy
            jest.mock('expo-modules-core', () => ({
                get NativeModulesProxy() {
                    throw new Error('Module core error');
                },
            }));

            jest.mock('expo-secure-store', () => ({
                setItemAsync: jest.fn(),
                getItemAsync: jest.fn(),
                deleteItemAsync: jest.fn(),
                WHEN_UNLOCKED_THIS_DEVICE_ONLY: 1,
            }));

            jest.mock('expo-local-authentication', () => ({
                hasHardwareAsync: jest.fn().mockResolvedValue(false),
                isEnrolledAsync: jest.fn(),
                authenticateAsync: jest.fn(),
            }));

            jest.mock('react-native', () => ({
                Platform: { OS: 'android' },
            }));

            const { __testing: t } = require('../biometricAuth');
            const service = t.BiometricServiceFactory.create();

            return service.getPreference().then((result: boolean) => {
                expect(result).toBe(false);
            });
        });
    });
});
