/**
 * Token module type definitions.
 *
 * SOLID: Interface Segregation - focused, minimal interfaces.
 * SOLID: Dependency Inversion - depend on abstractions, not concretions.
 */

export type Jwt = { exp?: number; [k: string]: unknown };

export interface TokenPair {
    accessToken: string;
    refreshToken?: string;
}

export interface RefreshResponse {
    accessToken?: string;
    access_token?: string;
    token?: string;
    refreshToken?: string;
    refresh_token?: string;
    message?: {
        access_token?: string;
        refresh_token?: string;
    };
}

/**
 * Interface for JWT token validation operations.
 * Allows different JWT libraries or validation strategies.
 */
export interface IJwtValidator {
    getExpirationTime(token: string): number | null;

    isValid(token: string, bufferMs: number): boolean;
}

/**
 * Interface for token storage operations.
 * Allows different storage backends (SecureStore, AsyncStorage, etc.)
 */
export interface ITokenStorage {
    saveAccessToken(token: string): Promise<void>;

    loadAccessToken(): Promise<string | null>;

    clearAccessToken(): Promise<void>;

    saveRefreshToken(token: string): Promise<void>;

    loadRefreshToken(): Promise<string | null>;

    clearRefreshToken(): Promise<void>;
}

/**
 * Interface for token refresh HTTP operations.
 * Allows different HTTP clients or API endpoints.
 */
export interface ITokenRefreshClient {
    refresh(refreshToken: string | null): Promise<TokenPair | null>;
}

/**
 * Interface for navigation operations.
 * Allows different navigation implementations.
 */
export interface INavigator {
    isAuthPath(): boolean;

    redirectToLogin(): void;
}
