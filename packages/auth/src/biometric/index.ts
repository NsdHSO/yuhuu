/**
 * Biometric authentication public API.
 *
 * Provides backward-compatible function exports while internally using
 * SOLID architecture with dependency injection.
 */
export type {IBiometricAuthenticator, ISecureStorage} from './types';
export {BiometricService} from './service';
export {NativeBiometricAuthenticator, NullBiometricAuthenticator} from './authenticator';
export {NativeSecureStorageAdapter, WebStorageAdapter, NullStorageAdapter} from './storage-adapters';
export {BiometricServiceFactory} from './factory';

import {BiometricService} from './service';
import {BiometricServiceFactory} from './factory';

// Singleton instance (lazy initialization)
let serviceInstance: BiometricService | null = null;

function getService(): BiometricService {
    if (!serviceInstance) {
        serviceInstance = BiometricServiceFactory.create();
    }
    return serviceInstance;
}

export async function isBiometricAvailable(): Promise<boolean> {
    return getService().isAvailable();
}

export async function authenticateWithBiometrics(
    prompt: string = 'Authenticate to sign in'
): Promise<boolean> {
    return getService().authenticate(prompt);
}

export async function saveBiometricPreference(enabled: boolean): Promise<void> {
    return getService().savePreference(enabled);
}

export async function getBiometricPreference(): Promise<boolean> {
    return getService().getPreference();
}

export async function saveBiometricEmail(email: string): Promise<void> {
    return getService().saveEmail(email);
}

export async function getBiometricEmail(): Promise<string | null> {
    return getService().getEmail();
}

export async function clearBiometricEmail(): Promise<void> {
    return getService().clearEmail();
}

export async function clearBiometricData(): Promise<void> {
    return getService().clearData();
}

// Testing exports
export function __setServiceForTesting(service: BiometricService | null): void {
    serviceInstance = service;
}

export function __resetServiceForTesting(): void {
    serviceInstance = null;
}
