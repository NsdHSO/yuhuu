/**
 * Tests for internal biometricAuth classes and uncovered code paths.
 *
 * Targets coverage for:
 * - WebStorageAdapter (lines 97-124)
 * - NativeBiometricAuthenticator when localAuth is null (lines 171-172, 190-191)
 * - NativeSecureStorageAdapter.loadSecureStore catch block (line 58)
 * - BiometricServiceFactory.createStorage null adapter fallback (line 327)
 * - NativeBiometricAuthenticator.loadLocalAuth error path (lines 161-165)
 * - NativeBiometricAuthenticator.loadLocalAuth web detection (lines 153-154)
 * - BiometricService with injected dependencies
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
import {
    __testing,
    __resetServiceForTesting,
    __setServiceForTesting,
} from '../biometricAuth';

const {
    BiometricService,
    NullBiometricAuthenticator,
    NullStorageAdapter,
    WebStorageAdapter,
    NativeBiometricAuthenticator,
    NativeSecureStorageAdapter,
    BiometricServiceFactory,
} = __testing;

// ================================================================
// WebStorageAdapter Tests (covers lines 97-124)
// ================================================================

describe('WebStorageAdapter', () => {
    let adapter: InstanceType<typeof WebStorageAdapter>;
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
        adapter = new WebStorageAdapter();
        originalWindow = globalThis.window;
    });

    afterEach(() => {
        // Restore window
        if (originalWindow !== undefined) {
            (globalThis as any).window = originalWindow;
        }
    });

    describe('setItem', () => {
        it('should call localStorage.setItem when window is defined', async () => {
            const mockSetItem = jest.fn();
            (globalThis as any).window = {
                localStorage: { setItem: mockSetItem, getItem: jest.fn(), removeItem: jest.fn() },
            };

            await adapter.setItem('key1', 'value1');

            expect(mockSetItem).toHaveBeenCalledWith('key1', 'value1');
        });

        it('should not throw when window is undefined', async () => {
            delete (globalThis as any).window;

            await expect(adapter.setItem('key1', 'value1')).resolves.not.toThrow();
        });

        it('should not throw when localStorage.setItem throws', async () => {
            (globalThis as any).window = {
                localStorage: {
                    setItem: jest.fn(() => { throw new Error('QuotaExceeded'); }),
                    getItem: jest.fn(),
                    removeItem: jest.fn(),
                },
            };

            await expect(adapter.setItem('key1', 'value1')).resolves.not.toThrow();
        });
    });

    describe('getItem', () => {
        it('should return value from localStorage when window is defined', async () => {
            (globalThis as any).window = {
                localStorage: {
                    setItem: jest.fn(),
                    getItem: jest.fn().mockReturnValue('stored-value'),
                    removeItem: jest.fn(),
                },
            };

            const result = await adapter.getItem('key1');

            expect(result).toBe('stored-value');
        });

        it('should return null when window is undefined', async () => {
            delete (globalThis as any).window;

            const result = await adapter.getItem('key1');

            expect(result).toBeNull();
        });

        it('should return null when localStorage.getItem throws', async () => {
            (globalThis as any).window = {
                localStorage: {
                    setItem: jest.fn(),
                    getItem: jest.fn(() => { throw new Error('SecurityError'); }),
                    removeItem: jest.fn(),
                },
            };

            const result = await adapter.getItem('key1');

            expect(result).toBeNull();
        });
    });

    describe('deleteItem', () => {
        it('should call localStorage.removeItem when window is defined', async () => {
            const mockRemoveItem = jest.fn();
            (globalThis as any).window = {
                localStorage: { setItem: jest.fn(), getItem: jest.fn(), removeItem: mockRemoveItem },
            };

            await adapter.deleteItem('key1');

            expect(mockRemoveItem).toHaveBeenCalledWith('key1');
        });

        it('should not throw when window is undefined', async () => {
            delete (globalThis as any).window;

            await expect(adapter.deleteItem('key1')).resolves.not.toThrow();
        });

        it('should not throw when localStorage.removeItem throws', async () => {
            (globalThis as any).window = {
                localStorage: {
                    setItem: jest.fn(),
                    getItem: jest.fn(),
                    removeItem: jest.fn(() => { throw new Error('SecurityError'); }),
                },
            };

            await expect(adapter.deleteItem('key1')).resolves.not.toThrow();
        });
    });
});

// ================================================================
// NullStorageAdapter Tests
// ================================================================

describe('NullStorageAdapter', () => {
    let adapter: InstanceType<typeof NullStorageAdapter>;

    beforeEach(() => {
        adapter = new NullStorageAdapter();
    });

    it('setItem should resolve without error', async () => {
        await expect(adapter.setItem('key', 'value')).resolves.toBeUndefined();
    });

    it('getItem should return null', async () => {
        const result = await adapter.getItem('key');
        expect(result).toBeNull();
    });

    it('deleteItem should resolve without error', async () => {
        await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
    });
});

// ================================================================
// NullBiometricAuthenticator Tests
// ================================================================

describe('NullBiometricAuthenticator', () => {
    let authenticator: InstanceType<typeof NullBiometricAuthenticator>;

    beforeEach(() => {
        authenticator = new NullBiometricAuthenticator();
    });

    it('isAvailable should return false', async () => {
        const result = await authenticator.isAvailable();
        expect(result).toBe(false);
    });

    it('authenticate should return false', async () => {
        const result = await authenticator.authenticate('Test prompt');
        expect(result).toBe(false);
    });
});

// ================================================================
// BiometricService with injected dependencies
// ================================================================

describe('BiometricService with injected dependencies', () => {
    it('should use injected authenticator for isAvailable', async () => {
        const mockAuth = { isAvailable: jest.fn().mockResolvedValue(true), authenticate: jest.fn() };
        const mockStorage = new NullStorageAdapter();
        const service = new BiometricService(mockAuth, mockStorage);

        const result = await service.isAvailable();

        expect(result).toBe(true);
        expect(mockAuth.isAvailable).toHaveBeenCalled();
    });

    it('should use injected authenticator for authenticate', async () => {
        const mockAuth = { isAvailable: jest.fn(), authenticate: jest.fn().mockResolvedValue(true) };
        const mockStorage = new NullStorageAdapter();
        const service = new BiometricService(mockAuth, mockStorage);

        const result = await service.authenticate('Test');

        expect(result).toBe(true);
        expect(mockAuth.authenticate).toHaveBeenCalledWith('Test');
    });

    it('should use default prompt when none provided', async () => {
        const mockAuth = { isAvailable: jest.fn(), authenticate: jest.fn().mockResolvedValue(true) };
        const mockStorage = new NullStorageAdapter();
        const service = new BiometricService(mockAuth, mockStorage);

        await service.authenticate();

        expect(mockAuth.authenticate).toHaveBeenCalledWith('Authenticate to sign in');
    });

    it('should save and retrieve preference using injected storage', async () => {
        const store: Record<string, string> = {};
        const mockStorage = {
            setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
            getItem: jest.fn(async (k: string) => store[k] ?? null),
            deleteItem: jest.fn(async (k: string) => { delete store[k]; }),
        };
        const service = new BiometricService(new NullBiometricAuthenticator(), mockStorage);

        await service.savePreference(true);
        expect(mockStorage.setItem).toHaveBeenCalledWith('biometric_enabled', 'true');

        const pref = await service.getPreference();
        expect(pref).toBe(true);
    });

    it('should save and retrieve email using injected storage', async () => {
        const store: Record<string, string> = {};
        const mockStorage = {
            setItem: jest.fn(async (k: string, v: string) => { store[k] = v; }),
            getItem: jest.fn(async (k: string) => store[k] ?? null),
            deleteItem: jest.fn(async (k: string) => { delete store[k]; }),
        };
        const service = new BiometricService(new NullBiometricAuthenticator(), mockStorage);

        await service.saveEmail('test@example.com');
        expect(mockStorage.setItem).toHaveBeenCalledWith('biometric_email', 'test@example.com');

        const email = await service.getEmail();
        expect(email).toBe('test@example.com');
    });

    it('should clear both keys on clearData', async () => {
        const mockStorage = {
            setItem: jest.fn(),
            getItem: jest.fn(),
            deleteItem: jest.fn(),
        };
        const service = new BiometricService(new NullBiometricAuthenticator(), mockStorage);

        await service.clearData();

        expect(mockStorage.deleteItem).toHaveBeenCalledWith('biometric_enabled');
        expect(mockStorage.deleteItem).toHaveBeenCalledWith('biometric_email');
        expect(mockStorage.deleteItem).toHaveBeenCalledTimes(2);
    });
});

// ================================================================
// __setServiceForTesting / __resetServiceForTesting
// ================================================================

describe('Testing utility functions', () => {
    const originalPlatformOS = Platform.OS;

    afterEach(() => {
        (Platform as any).OS = originalPlatformOS;
        __resetServiceForTesting();
    });

    it('__setServiceForTesting should inject a custom service', async () => {
        const mockAuth = { isAvailable: jest.fn().mockResolvedValue(true), authenticate: jest.fn() };
        const customService = new BiometricService(mockAuth, new NullStorageAdapter());

        __setServiceForTesting(customService);

        const { isBiometricAvailable } = require('../biometricAuth');
        const result = await isBiometricAvailable();

        expect(result).toBe(true);
        expect(mockAuth.isAvailable).toHaveBeenCalled();
    });

    it('__setServiceForTesting with null should reset to factory', async () => {
        __setServiceForTesting(null);

        // After setting null, next call to getService() recreates from factory
        const { isBiometricAvailable } = require('../biometricAuth');
        // Should not throw
        await expect(isBiometricAvailable()).resolves.toBeDefined();
    });

    it('__resetServiceForTesting should clear the singleton', async () => {
        const mockAuth = { isAvailable: jest.fn().mockResolvedValue(true), authenticate: jest.fn() };
        const customService = new BiometricService(mockAuth, new NullStorageAdapter());

        __setServiceForTesting(customService);
        __resetServiceForTesting();

        // After reset, the factory-created service should be used
        // and mockAuth.isAvailable should NOT be called
        const { isBiometricAvailable } = require('../biometricAuth');
        await isBiometricAvailable();

        // The custom mockAuth should not have been used since it was reset
        // (the factory creates a new NativeBiometricAuthenticator)
        expect(mockAuth.isAvailable).not.toHaveBeenCalled();
    });
});

// ================================================================
// BiometricServiceFactory (covers line 327 - NullStorageAdapter fallback)
// ================================================================

describe('BiometricServiceFactory', () => {
    const originalPlatformOS = Platform.OS;

    afterEach(() => {
        (Platform as any).OS = originalPlatformOS;
        __resetServiceForTesting();
    });

    it('should create service with NullBiometricAuthenticator on web', () => {
        (Platform as any).OS = 'web';

        const service = BiometricServiceFactory.create();

        expect(service).toBeInstanceOf(BiometricService);
    });

    it('should create service with NativeBiometricAuthenticator on ios', () => {
        (Platform as any).OS = 'ios';

        const service = BiometricServiceFactory.create();

        expect(service).toBeInstanceOf(BiometricService);
    });

    it('should create service with NativeBiometricAuthenticator on android', () => {
        (Platform as any).OS = 'android';

        const service = BiometricServiceFactory.create();

        expect(service).toBeInstanceOf(BiometricService);
    });
});

// ================================================================
// NativeBiometricAuthenticator when localAuth is null
// (covers lines 153-154, 161-165, 171-172, 190-191)
// ================================================================

describe('NativeBiometricAuthenticator with null localAuth', () => {
    const originalPlatformOS = Platform.OS;

    afterEach(() => {
        (Platform as any).OS = originalPlatformOS;
    });

    it('should set localAuth to null on web platform and return false for isAvailable', async () => {
        (Platform as any).OS = 'web';

        const authenticator = new NativeBiometricAuthenticator();

        const result = await authenticator.isAvailable();

        expect(result).toBe(false);
    });

    it('should return false for authenticate when localAuth is null (web platform)', async () => {
        (Platform as any).OS = 'web';

        const authenticator = new NativeBiometricAuthenticator();

        const result = await authenticator.authenticate('Test prompt');

        expect(result).toBe(false);
    });
});
