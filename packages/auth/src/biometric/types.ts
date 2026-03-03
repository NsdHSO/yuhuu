/**
 * Biometric module type definitions.
 *
 * SOLID: Interface Segregation - focused, minimal interfaces.
 * SOLID: Dependency Inversion - depend on abstractions, not concretions.
 */

/**
 * Interface for biometric authentication operations.
 * Allows different biometric implementations to be swapped.
 */
export interface IBiometricAuthenticator {
    isAvailable(): Promise<boolean>;

    authenticate(prompt: string): Promise<boolean>;
}

/**
 * Interface for secure storage operations used by biometric service.
 * Allows different storage backends to be used.
 */
export interface ISecureStorage {
    setItem(key: string, value: string): Promise<void>;

    getItem(key: string): Promise<string | null>;

    deleteItem(key: string): Promise<void>;
}
