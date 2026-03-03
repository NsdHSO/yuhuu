/**
 * Storage adapters for biometric service.
 *
 * SOLID: Single Responsibility - each adapter handles one storage strategy.
 * SOLID: Open/Closed - new storage backends can be added without modifying existing code.
 */
import {Platform} from 'react-native';
import {NativeModulesProxy} from 'expo-modules-core';
import type {ISecureStorage} from './types';

/**
 * Adapter for expo-secure-store on native platforms.
 * Single Responsibility: Handle native secure storage only.
 */
export class NativeSecureStorageAdapter implements ISecureStorage {
    private secureStore: any;

    constructor() {
        this.secureStore = this.loadSecureStore();
    }

    private loadSecureStore(): any | null {
        if (Platform.OS === 'web') return null;
        try {
            if (!(NativeModulesProxy as any)?.ExpoSecureStore) return null;
            return require('expo-secure-store');
        } catch {
            return null;
        }
    }

    async setItem(key: string, value: string): Promise<void> {
        if (!this.secureStore?.setItemAsync) return;
        try {
            await this.secureStore.setItemAsync(key, value, {
                keychainAccessible: this.secureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
                requireAuthentication: false,
            });
        } catch {
            // Graceful degradation
        }
    }

    async getItem(key: string): Promise<string | null> {
        if (!this.secureStore?.getItemAsync) return null;
        try {
            return (await this.secureStore.getItemAsync(key)) ?? null;
        } catch {
            return null;
        }
    }

    async deleteItem(key: string): Promise<void> {
        if (!this.secureStore?.deleteItemAsync) return;
        try {
            await this.secureStore.deleteItemAsync(key);
        } catch {
            // Graceful degradation
        }
    }
}

/**
 * Adapter for localStorage on web platform.
 * Single Responsibility: Handle web storage only.
 */
export class WebStorageAdapter implements ISecureStorage {
    async setItem(key: string, value: string): Promise<void> {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.setItem(key, value);
        } catch {
            // Graceful degradation
        }
    }

    async getItem(key: string): Promise<string | null> {
        if (typeof window === 'undefined') return null;
        try {
            return window.localStorage.getItem(key);
        } catch {
            return null;
        }
    }

    async deleteItem(key: string): Promise<void> {
        if (typeof window === 'undefined') return;
        try {
            window.localStorage.removeItem(key);
        } catch {
            // Graceful degradation
        }
    }
}

/**
 * Null Object Pattern for unsupported platforms.
 * Single Responsibility: Provide safe no-op storage.
 */
export class NullStorageAdapter implements ISecureStorage {
    async setItem(_key: string, _value: string): Promise<void> {
    }

    async getItem(_key: string): Promise<string | null> {
        return null;
    }

    async deleteItem(_key: string): Promise<void> {
    }
}
