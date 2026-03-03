import {NullStorageAdapter} from '../../biometric/storage-adapters';
import {Platform} from 'react-native';
import {NativeModulesProxy} from 'expo-modules-core';
import * as SecureStore from 'expo-secure-store';

describe('NullStorageAdapter', () => {
    let adapter: NullStorageAdapter;

    beforeEach(() => {
        adapter = new NullStorageAdapter();
    });

    it('setItem does nothing', async () => {
        await expect(adapter.setItem('key', 'value')).resolves.toBeUndefined();
    });

    it('getItem returns null', async () => {
        const result = await adapter.getItem('key');
        expect(result).toBeNull();
    });

    it('deleteItem does nothing', async () => {
        await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
    });
});

describe('NativeSecureStorageAdapter', () => {
    const originalOS = Platform.OS;

    afterEach(() => {
        Platform.OS = originalOS as any;
        (NativeModulesProxy as any).ExpoSecureStore = undefined;
        jest.clearAllMocks();
    });

    describe('when Platform.OS is web', () => {
        it('loadSecureStore returns null, so setItem is a no-op', async () => {
            // Default jest.setup.js sets Platform.OS = 'web'
            const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new NativeSecureStorageAdapter();

            await expect(adapter.setItem('key', 'value')).resolves.toBeUndefined();
            expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
        });

        it('getItem returns null when secureStore not loaded', async () => {
            const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new NativeSecureStorageAdapter();

            const result = await adapter.getItem('key');
            expect(result).toBeNull();
            expect(SecureStore.getItemAsync).not.toHaveBeenCalled();
        });

        it('deleteItem is a no-op when secureStore not loaded', async () => {
            const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new NativeSecureStorageAdapter();

            await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
            expect(SecureStore.deleteItemAsync).not.toHaveBeenCalled();
        });
    });

    describe('when ExpoSecureStore is not in NativeModulesProxy', () => {
        it('loadSecureStore returns null', async () => {
            Platform.OS = 'ios' as any;
            (NativeModulesProxy as any).ExpoSecureStore = undefined;

            // Must re-require to get a fresh constructor call
            jest.isolateModules(() => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                // secureStore is null, so getItem returns null
                expect(adapter.getItem('key')).resolves.toBeNull();
            });
        });
    });

    describe('when native secure store is available', () => {
        beforeEach(() => {
            Platform.OS = 'ios' as any;
            (NativeModulesProxy as any).ExpoSecureStore = {};
            jest.clearAllMocks();
        });

        it('setItem calls setItemAsync with correct Keychain options', async () => {
            jest.isolateModules(async () => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                await adapter.setItem('biometric-pref', 'true');

                expect(SecureStore.setItemAsync).toHaveBeenCalledWith(
                    'biometric-pref',
                    'true',
                    {
                        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
                        requireAuthentication: false,
                    }
                );
            });
        });

        it('setItem handles thrown error gracefully', async () => {
            (SecureStore.setItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Storage full'));

            jest.isolateModules(async () => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                await expect(adapter.setItem('key', 'val')).resolves.toBeUndefined();
            });
        });

        it('getItem returns value from getItemAsync', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockResolvedValueOnce('stored-value');

            jest.isolateModules(async () => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                const result = await adapter.getItem('my-key');
                expect(result).toBe('stored-value');
                expect(SecureStore.getItemAsync).toHaveBeenCalledWith('my-key');
            });
        });

        it('getItem returns null on error', async () => {
            (SecureStore.getItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Read error'));

            jest.isolateModules(async () => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                const result = await adapter.getItem('key');
                expect(result).toBeNull();
            });
        });

        it('deleteItem calls deleteItemAsync', async () => {
            jest.isolateModules(async () => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                await adapter.deleteItem('key-to-delete');
                expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('key-to-delete');
            });
        });

        it('deleteItem handles error gracefully', async () => {
            (SecureStore.deleteItemAsync as jest.Mock).mockRejectedValueOnce(new Error('Delete error'));

            jest.isolateModules(async () => {
                const {NativeSecureStorageAdapter} = require('../../biometric/storage-adapters');
                const adapter = new NativeSecureStorageAdapter();

                await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
            });
        });
    });
});

describe('WebStorageAdapter', () => {
    let originalWindow: typeof globalThis.window;

    beforeEach(() => {
        originalWindow = globalThis.window;
    });

    afterEach(() => {
        if (originalWindow === undefined) {
            // @ts-ignore
            delete globalThis.window;
        } else {
            globalThis.window = originalWindow;
        }
    });

    describe('when window is defined', () => {
        let mockLocalStorage: {
            setItem: jest.Mock;
            getItem: jest.Mock;
            removeItem: jest.Mock;
        };

        beforeEach(() => {
            mockLocalStorage = {
                setItem: jest.fn(),
                getItem: jest.fn(),
                removeItem: jest.fn(),
            };

            // @ts-ignore
            globalThis.window = {
                localStorage: mockLocalStorage,
            };
        });

        it('setItem calls window.localStorage.setItem', async () => {
            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            await adapter.setItem('web-key', 'web-value');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('web-key', 'web-value');
        });

        it('setItem handles localStorage error gracefully', async () => {
            mockLocalStorage.setItem.mockImplementation(() => {
                throw new Error('QuotaExceededError');
            });

            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            await expect(adapter.setItem('key', 'val')).resolves.toBeUndefined();
        });

        it('getItem returns value from window.localStorage.getItem', async () => {
            mockLocalStorage.getItem.mockReturnValue('found-value');

            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            const result = await adapter.getItem('my-key');
            expect(result).toBe('found-value');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('my-key');
        });

        it('getItem returns null on localStorage error', async () => {
            mockLocalStorage.getItem.mockImplementation(() => {
                throw new Error('SecurityError');
            });

            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            const result = await adapter.getItem('key');
            expect(result).toBeNull();
        });

        it('deleteItem calls window.localStorage.removeItem', async () => {
            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            await adapter.deleteItem('key-to-remove');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('key-to-remove');
        });

        it('deleteItem handles localStorage error gracefully', async () => {
            mockLocalStorage.removeItem.mockImplementation(() => {
                throw new Error('SecurityError');
            });

            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
        });
    });

    describe('when window is undefined (SSR)', () => {
        beforeEach(() => {
            // @ts-ignore
            delete globalThis.window;
        });

        it('setItem is a no-op', async () => {
            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            await expect(adapter.setItem('key', 'value')).resolves.toBeUndefined();
        });

        it('getItem returns null', async () => {
            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            const result = await adapter.getItem('key');
            expect(result).toBeNull();
        });

        it('deleteItem is a no-op', async () => {
            const {WebStorageAdapter} = require('../../biometric/storage-adapters');
            const adapter = new WebStorageAdapter();

            await expect(adapter.deleteItem('key')).resolves.toBeUndefined();
        });
    });
});
