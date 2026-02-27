/**
 * Biometric authentication utilities for iOS (Face ID / Touch ID) and Android.
 *
 * SOLID Architecture:
 * - Single Responsibility: Each class has one clear purpose
 * - Open/Closed: Extensible via interfaces, closed for modification
 * - Liskov Substitution: Implementations are substitutable
 * - Interface Segregation: Focused, minimal interfaces
 * - Dependency Inversion: Depends on abstractions, not concretions
 */
import { Platform } from 'react-native';
import { NativeModulesProxy } from 'expo-modules-core';

// ============================================================================
// INTERFACES (Dependency Inversion Principle)
// ============================================================================

/**
 * Interface for biometric authentication operations.
 * Allows different biometric implementations to be swapped.
 */
interface IBiometricAuthenticator {
    isAvailable(): Promise<boolean>;
    authenticate(prompt: string): Promise<boolean>;
}

/**
 * Interface for secure storage operations.
 * Allows different storage backends to be used.
 */
interface ISecureStorage {
    setItem(key: string, value: string): Promise<void>;
    getItem(key: string): Promise<string | null>;
    deleteItem(key: string): Promise<void>;
}

// ============================================================================
// STORAGE ADAPTERS (Single Responsibility + Open/Closed)
// ============================================================================

/**
 * Adapter for expo-secure-store on native platforms.
 * Single Responsibility: Handle native secure storage only.
 */
class NativeSecureStorageAdapter implements ISecureStorage {
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
class WebStorageAdapter implements ISecureStorage {
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
class NullStorageAdapter implements ISecureStorage {
    async setItem(_key: string, _value: string): Promise<void> {}
    async getItem(_key: string): Promise<string | null> { return null; }
    async deleteItem(_key: string): Promise<void> {}
}

// ============================================================================
// BIOMETRIC AUTHENTICATOR (Single Responsibility + Open/Closed)
// ============================================================================

/**
 * Implementation for expo-local-authentication on native platforms.
 * Single Responsibility: Handle biometric authentication only.
 */
class NativeBiometricAuthenticator implements IBiometricAuthenticator {
    private localAuth: any;

    constructor() {
        this.localAuth = this.loadLocalAuth();
    }

    private loadLocalAuth(): any | null {
        if (Platform.OS === 'web') return null;
        try {
            return require('expo-local-authentication');
        } catch {
            return null;
        }
    }

    async isAvailable(): Promise<boolean> {
        if (!this.localAuth) return false;
        try {
            const hasHardware = await this.localAuth.hasHardwareAsync();
            if (!hasHardware) return false;
            const isEnrolled = await this.localAuth.isEnrolledAsync();
            return !!isEnrolled; // Coerce to boolean
        } catch {
            return false;
        }
    }

    async authenticate(prompt: string): Promise<boolean> {
        if (!this.localAuth) return false;
        try {
            const result = await this.localAuth.authenticateAsync({
                promptMessage: prompt,
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });
            return result?.success === true;
        } catch {
            return false;
        }
    }
}

/**
 * Null Object Pattern for web platform (no biometric hardware).
 * Single Responsibility: Provide safe no-op biometric operations.
 */
class NullBiometricAuthenticator implements IBiometricAuthenticator {
    async isAvailable(): Promise<boolean> { return false; }
    async authenticate(_prompt: string): Promise<boolean> { return false; }
}

// ============================================================================
// BIOMETRIC SERVICE (Facade Pattern + Dependency Inversion)
// ============================================================================

/**
 * High-level service that coordinates biometric authentication and storage.
 * Depends on abstractions (interfaces), not concrete implementations.
 * Single Responsibility: Orchestrate biometric operations.
 */
class BiometricService {
    private static readonly ENABLED_KEY = 'biometric_enabled';
    private static readonly EMAIL_KEY = 'biometric_email';

    constructor(
        private authenticator: IBiometricAuthenticator,
        private storage: ISecureStorage
    ) {}

    /**
     * Checks if biometric authentication is available on this device.
     */
    async isAvailable(): Promise<boolean> {
        return this.authenticator.isAvailable();
    }

    /**
     * Triggers the native biometric prompt.
     */
    async authenticate(prompt: string = 'Authenticate to sign in'): Promise<boolean> {
        return this.authenticator.authenticate(prompt);
    }

    /**
     * Saves the user's biometric preference.
     */
    async savePreference(enabled: boolean): Promise<void> {
        await this.storage.setItem(
            BiometricService.ENABLED_KEY,
            JSON.stringify(enabled)
        );
    }

    /**
     * Retrieves the user's biometric preference.
     */
    async getPreference(): Promise<boolean> {
        const value = await this.storage.getItem(BiometricService.ENABLED_KEY);
        return value === 'true';
    }

    /**
     * Saves the user's email for biometric re-authentication.
     */
    async saveEmail(email: string): Promise<void> {
        await this.storage.setItem(BiometricService.EMAIL_KEY, email);
    }

    /**
     * Retrieves the stored biometric email.
     */
    async getEmail(): Promise<string | null> {
        return this.storage.getItem(BiometricService.EMAIL_KEY);
    }

    /**
     * Removes all biometric-related data.
     */
    async clearData(): Promise<void> {
        await this.storage.deleteItem(BiometricService.ENABLED_KEY);
        await this.storage.deleteItem(BiometricService.EMAIL_KEY);
    }
}

// ============================================================================
// FACTORY (Dependency Injection + Open/Closed)
// ============================================================================

/**
 * Factory for creating the appropriate BiometricService based on platform.
 * Open/Closed: Can add new platforms without modifying existing code.
 */
class BiometricServiceFactory {
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

        // Check if SecureStore is available on native
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

// ============================================================================
// PUBLIC API (Backward Compatibility)
// ============================================================================

/**
 * Singleton instance of BiometricService.
 * Lazy initialization ensures platform detection happens at runtime.
 */
let serviceInstance: BiometricService | null = null;

function getService(): BiometricService {
    if (!serviceInstance) {
        serviceInstance = BiometricServiceFactory.create();
    }
    return serviceInstance;
}

/**
 * Checks whether the device has biometric hardware and at least one
 * enrolled biometric (fingerprint, face, etc.).
 *
 * @returns true if biometrics can be used for authentication.
 */
export async function isBiometricAvailable(): Promise<boolean> {
    return getService().isAvailable();
}

/**
 * Triggers the native biometric prompt (Face ID, Touch ID, or fingerprint).
 * Falls back to device passcode when disableDeviceFallback is false.
 *
 * @param prompt - Message displayed on the biometric dialog.
 * @returns true if the user authenticated successfully.
 */
export async function authenticateWithBiometrics(
    prompt: string = 'Authenticate to sign in'
): Promise<boolean> {
    return getService().authenticate(prompt);
}

/**
 * Persists the user's biometric-login preference.
 * Uses SecureStore on native, localStorage on web.
 *
 * @param enabled - Whether the user wants biometric login active.
 */
export async function saveBiometricPreference(enabled: boolean): Promise<void> {
    return getService().savePreference(enabled);
}

/**
 * Reads the stored biometric-login preference.
 *
 * @returns true if the user previously opted in to biometric login.
 */
export async function getBiometricPreference(): Promise<boolean> {
    return getService().getPreference();
}

/**
 * Stores the user's email for biometric re-authentication.
 * The email is needed to identify which account to refresh tokens for
 * when the user signs in via biometrics instead of typing credentials.
 *
 * @param email - The authenticated user's email address.
 */
export async function saveBiometricEmail(email: string): Promise<void> {
    return getService().saveEmail(email);
}

/**
 * Retrieves the previously stored biometric email.
 *
 * @returns The email string, or null if none is stored.
 */
export async function getBiometricEmail(): Promise<string | null> {
    return getService().getEmail();
}

/**
 * Removes all biometric-related data (preference flag and stored email).
 * Called during sign-out to ensure the next user starts clean.
 */
export async function clearBiometricData(): Promise<void> {
    return getService().clearData();
}

// ============================================================================
// TESTING EXPORTS (Dependency Injection for Tests)
// ============================================================================

/**
 * For testing: allows injection of custom implementations.
 * This enables mocking without jest.mock() complexity.
 */
export function __setServiceForTesting(service: BiometricService | null): void {
    serviceInstance = service;
}

/**
 * For testing: resets the singleton instance.
 * Call this when Platform.OS changes during tests.
 */
export function __resetServiceForTesting(): void {
    serviceInstance = null;
}

/**
 * Export classes for testing purposes.
 */
export const __testing = {
    BiometricService,
    NativeBiometricAuthenticator,
    NullBiometricAuthenticator,
    NativeSecureStorageAdapter,
    WebStorageAdapter,
    NullStorageAdapter,
    BiometricServiceFactory,
};
