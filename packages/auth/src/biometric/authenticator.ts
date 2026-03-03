/**
 * Biometric authenticator implementations.
 *
 * SOLID: Single Responsibility - each class handles one authentication strategy.
 * SOLID: Open/Closed - new platforms can be added without modifying existing code.
 * SOLID: Liskov Substitution - all implementations are interchangeable.
 */
import {Platform} from 'react-native';
import type {IBiometricAuthenticator} from './types';

/**
 * Implementation for expo-local-authentication on native platforms.
 * Single Responsibility: Handle biometric authentication only.
 */
export class NativeBiometricAuthenticator implements IBiometricAuthenticator {
    private localAuth: any;

    constructor() {
        this.localAuth = this.loadLocalAuth();
    }

    private loadLocalAuth(): any | null {
        if (Platform.OS === 'web') {
            console.log('[Biometric] Platform is web - LocalAuth not available');
            return null;
        }
        try {
            const module = require('expo-local-authentication');
            console.log('[Biometric] LocalAuth module loaded successfully');
            return module;
        } catch (error) {
            console.error('[Biometric] CRITICAL: Failed to load expo-local-authentication native module');
            console.error('[Biometric] Error:', error instanceof Error ? error.message : String(error));
            console.error('[Biometric] This means the native module is not properly linked in the APK');
            console.error('[Biometric] FIX: Run: npx expo prebuild --clean --platform android');
            return null;
        }
    }

    async isAvailable(): Promise<boolean> {
        if (!this.localAuth) {
            console.log('[Biometric] LocalAuth module not available');
            return false;
        }
        try {
            const hasHardware = await this.localAuth.hasHardwareAsync();
            console.log('[Biometric] Hardware available:', hasHardware);
            if (!hasHardware) return false;

            const isEnrolled = await this.localAuth.isEnrolledAsync();
            console.log('[Biometric] Biometrics enrolled:', isEnrolled);
            return !!isEnrolled;
        } catch (error) {
            console.error('[Biometric] Error checking availability:', error);
            return false;
        }
    }

    async authenticate(prompt: string): Promise<boolean> {
        if (!this.localAuth) {
            console.log('[Biometric] LocalAuth module not available for authentication');
            return false;
        }
        try {
            console.log('[Biometric] Starting authentication with prompt:', prompt);
            const result = await this.localAuth.authenticateAsync({
                promptMessage: prompt,
                cancelLabel: 'Cancel',
                disableDeviceFallback: false,
            });
            console.log('[Biometric] Authentication result:', result);
            return result?.success === true;
        } catch (error) {
            console.error('[Biometric] Authentication error:', error);
            return false;
        }
    }
}

/**
 * Null Object Pattern for web platform (no biometric hardware).
 * Single Responsibility: Provide safe no-op biometric operations.
 */
export class NullBiometricAuthenticator implements IBiometricAuthenticator {
    async isAvailable(): Promise<boolean> {
        return false;
    }

    async authenticate(_prompt: string): Promise<boolean> {
        return false;
    }
}
