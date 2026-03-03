/**
 * Factory for creating BiometricService with platform-appropriate dependencies.
 *
 * SOLID: Dependency Injection + Open/Closed.
 * Can add new platforms without modifying existing code.
 */
import {Platform} from 'react-native';
import {NativeModulesProxy} from 'expo-modules-core';
import type {IBiometricAuthenticator, ISecureStorage} from './types';
import {NativeBiometricAuthenticator, NullBiometricAuthenticator} from './authenticator';
import {NativeSecureStorageAdapter, NullStorageAdapter, WebStorageAdapter} from './storage-adapters';
import {BiometricService} from './service';

export class BiometricServiceFactory {
    static create(): BiometricService {
        const authenticator = this.createAuthenticator();
        const storage = this.createStorage();
        return new BiometricService(authenticator, storage);
    }

    private static createAuthenticator(): IBiometricAuthenticator {
        if (Platform.OS === 'web') {
            return new NullBiometricAuthenticator();
        }
        return new NativeBiometricAuthenticator();
    }

    private static createStorage(): ISecureStorage {
        if (Platform.OS === 'web') {
            return new WebStorageAdapter();
        }

        try {
            if ((NativeModulesProxy as any)?.ExpoSecureStore) {
                return new NativeSecureStorageAdapter();
            }
        } catch {
            // Fall through to null adapter
        }

        return new NullStorageAdapter();
    }
}
