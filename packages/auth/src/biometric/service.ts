/**
 * Biometric service - coordinates biometric authentication and storage.
 *
 * SOLID: Facade Pattern + Dependency Inversion.
 * SOLID: Single Responsibility - orchestrate biometric operations.
 */
import type {IBiometricAuthenticator, ISecureStorage} from './types';

/**
 * High-level service that coordinates biometric authentication and storage.
 * Depends on abstractions (interfaces), not concrete implementations.
 */
export class BiometricService {
    private static readonly ENABLED_KEY = 'biometric_enabled';
    private static readonly EMAIL_KEY = 'biometric_email';

    constructor(
        private authenticator: IBiometricAuthenticator,
        private storage: ISecureStorage
    ) {
    }

    async isAvailable(): Promise<boolean> {
        return this.authenticator.isAvailable();
    }

    async authenticate(prompt: string = 'Authenticate to sign in'): Promise<boolean> {
        return this.authenticator.authenticate(prompt);
    }

    async savePreference(enabled: boolean): Promise<void> {
        await this.storage.setItem(
            BiometricService.ENABLED_KEY,
            JSON.stringify(enabled)
        );
    }

    async getPreference(): Promise<boolean> {
        const value = await this.storage.getItem(BiometricService.ENABLED_KEY);
        return value === 'true';
    }

    async saveEmail(email: string): Promise<void> {
        await this.storage.setItem(BiometricService.EMAIL_KEY, email);
    }

    async getEmail(): Promise<string | null> {
        return this.storage.getItem(BiometricService.EMAIL_KEY);
    }

    async clearEmail(): Promise<void> {
        await this.storage.deleteItem(BiometricService.EMAIL_KEY);
    }

    async clearData(): Promise<void> {
        await this.storage.deleteItem(BiometricService.ENABLED_KEY);
        await this.storage.deleteItem(BiometricService.EMAIL_KEY);
    }
}
