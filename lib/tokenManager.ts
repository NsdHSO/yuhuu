/**
 * Token Manager - SOLID Architecture
 *
 * Responsibilities:
 * - Manage JWT access/refresh tokens
 * - Handle token validation and expiration
 * - Coordinate token refresh with deduplication
 * - Persist tokens securely
 *
 * SOLID Principles Applied:
 * - Single Responsibility: Each class has one clear purpose
 * - Open/Closed: Extensible via interfaces
 * - Liskov Substitution: Implementations are interchangeable
 * - Interface Segregation: Minimal, focused interfaces
 * - Dependency Inversion: Depends on abstractions
 */
import axios, { AxiosInstance } from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
    clearStoredAccessToken,
    clearStoredRefreshToken,
    loadAccessToken,
    loadRefreshToken,
    saveAccessToken,
    saveRefreshToken,
} from './secureStore';
import { isAuthPath, redirectToLogin } from './nav';
import { AUTH_BASE } from './http/url';
import { applyEnvelopeUnwrapper } from './http/envelope';

// ============================================================================
// TYPES
// ============================================================================

type Jwt = { exp?: number; [k: string]: unknown };

interface TokenPair {
    accessToken: string;
    refreshToken?: string;
}

interface RefreshResponse {
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

// ============================================================================
// INTERFACES (Dependency Inversion Principle)
// ============================================================================

/**
 * Interface for JWT token validation operations.
 * Allows different JWT libraries or validation strategies.
 */
interface IJwtValidator {
    getExpirationTime(token: string): number | null;
    isValid(token: string, bufferMs: number): boolean;
}

/**
 * Interface for token storage operations.
 * Allows different storage backends (SecureStore, AsyncStorage, etc.)
 */
interface ITokenStorage {
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
interface ITokenRefreshClient {
    refresh(refreshToken: string | null): Promise<TokenPair | null>;
}

/**
 * Interface for navigation operations.
 * Allows different navigation implementations.
 */
interface INavigator {
    isAuthPath(): boolean;
    redirectToLogin(): void;
}

// ============================================================================
// JWT VALIDATOR (Single Responsibility)
// ============================================================================

/**
 * Validates JWT tokens and checks expiration.
 * Single Responsibility: JWT operations only.
 */
class JwtTokenValidator implements IJwtValidator {
    getExpirationTime(token: string): number | null {
        try {
            const { exp } = jwtDecode<Jwt>(token);
            return exp ? exp * 1000 : null;
        } catch {
            return null;
        }
    }

    isValid(token: string, bufferMs: number = 30_000): boolean {
        if (!token) return false;
        const expMs = this.getExpirationTime(token);
        if (!expMs) return true; // No expiration = always valid
        return Date.now() + bufferMs < expMs;
    }
}

// ============================================================================
// STORAGE ADAPTER (Single Responsibility)
// ============================================================================

/**
 * Adapter for secure token storage.
 * Single Responsibility: Storage operations only.
 */
class SecureTokenStorage implements ITokenStorage {
    async saveAccessToken(token: string): Promise<void> {
        await saveAccessToken(token);
    }

    async loadAccessToken(): Promise<string | null> {
        return loadAccessToken();
    }

    async clearAccessToken(): Promise<void> {
        await clearStoredAccessToken();
    }

    async saveRefreshToken(token: string): Promise<void> {
        await saveRefreshToken(token);
    }

    async loadRefreshToken(): Promise<string | null> {
        return loadRefreshToken();
    }

    async clearRefreshToken(): Promise<void> {
        await clearStoredRefreshToken();
    }
}

// ============================================================================
// HTTP CLIENT (Single Responsibility)
// ============================================================================

/**
 * HTTP client for token refresh operations.
 * Single Responsibility: API communication only.
 */
class TokenRefreshClient implements ITokenRefreshClient {
    private readonly httpClient: AxiosInstance;

    constructor(httpClient?: AxiosInstance) {
        if (httpClient) {
            this.httpClient = httpClient;
        } else {
            // Create a properly configured axios instance matching authApi
            this.httpClient = axios.create({
                baseURL: AUTH_BASE,
                timeout: 15_000,
                withCredentials: true,
            });
            // Apply envelope unwrapping to match authApi behavior
            try {
                applyEnvelopeUnwrapper(this.httpClient);
            } catch {
                // In test environment, interceptors might not be available
            }
        }
    }

    async refresh(refreshToken: string | null): Promise<TokenPair | null> {
        try {
            const { data } = await this.httpClient.post<RefreshResponse>(
                '/auth/refresh',
                refreshToken ? { refreshToken } : {}
            );

            const accessToken = this.extractAccessToken(data);
            const newRefreshToken = this.extractRefreshToken(data);

            if (!accessToken) return null;

            return {
                accessToken,
                refreshToken: newRefreshToken,
            };
        } catch (error) {
            throw error;
        }
    }

    private extractAccessToken(data: RefreshResponse): string | undefined {
        return data.accessToken ??
               data.access_token ??
               data.token ??
               data.message?.access_token;
    }

    private extractRefreshToken(data: RefreshResponse): string | undefined {
        return data.refreshToken ??
               data.refresh_token ??
               data.message?.refresh_token;
    }
}

// ============================================================================
// NAVIGATOR (Single Responsibility)
// ============================================================================

/**
 * Navigator for authentication-related routing.
 * Single Responsibility: Navigation operations only.
 */
class AuthNavigator implements INavigator {
    isAuthPath(): boolean {
        return isAuthPath();
    }

    redirectToLogin(): void {
        try {
            redirectToLogin();
        } catch {
            // Graceful degradation
        }
    }
}

// ============================================================================
// REFRESH COORDINATOR (Single Responsibility)
// ============================================================================

/**
 * Coordinates token refresh requests with deduplication.
 * Single Responsibility: Request deduplication only.
 */
class TokenRefreshCoordinator {
    private inflightRefresh: Promise<string | null> | null = null;

    /**
     * Executes refresh with deduplication.
     * Multiple concurrent calls return the same promise.
     */
    async execute(refreshFn: () => Promise<string | null>): Promise<string | null> {
        if (!this.inflightRefresh) {
            this.inflightRefresh = (async () => {
                try {
                    return await refreshFn();
                } finally {
                    this.inflightRefresh = null;
                }
            })();
        }
        return this.inflightRefresh;
    }

    /**
     * Checks if a refresh is currently in progress.
     */
    isRefreshing(): boolean {
        return this.inflightRefresh !== null;
    }
}

// ============================================================================
// TOKEN MANAGER (Facade + Coordinator)
// ============================================================================

/**
 * Main token manager that coordinates all token operations.
 * Facade Pattern: Provides simple interface to complex subsystem.
 * Single Responsibility: Orchestrate token lifecycle.
 */
class TokenManager {
    private accessToken: string | null = null;
    private accessExpMs: number | null = null;
    private readonly coordinator = new TokenRefreshCoordinator();

    constructor(
        private readonly validator: IJwtValidator,
        private readonly storage: ITokenStorage,
        private readonly refreshClient: ITokenRefreshClient,
        private readonly navigator: INavigator
    ) {}

    /**
     * Sets tokens after successful login.
     */
    async setTokensFromLogin(accessToken: string, refreshToken?: string): Promise<void> {
        this.setAccessTokenInMemory(accessToken);
        await this.storage.saveAccessToken(accessToken);
        if (refreshToken) {
            await this.storage.saveRefreshToken(refreshToken);
        }
    }

    /**
     * Clears all tokens from memory and storage.
     */
    async clearTokens(): Promise<void> {
        this.accessToken = null;
        this.accessExpMs = null;
        await Promise.all([
            this.storage.clearRefreshToken(),
            this.storage.clearAccessToken(),
        ]);
    }

    /**
     * Gets the current access token synchronously (from memory).
     */
    getAccessTokenSync(): string | null {
        return this.accessToken;
    }

    /**
     * Gets a valid access token, refreshing if necessary.
     */
    async getValidAccessToken(): Promise<string | null> {
        // Fast path: token in memory and valid
        if (this.isAccessTokenValid()) {
            return this.accessToken;
        }

        // Try loading from storage
        await this.maybeLoadPersistedAccessToken();
        if (this.isAccessTokenValid()) {
            return this.accessToken;
        }

        // Don't auto-refresh on auth routes
        if (this.navigator.isAuthPath()) {
            return null;
        }

        // Refresh with deduplication
        return this.coordinator.execute(() => this.performRefresh());
    }

    /**
     * Refreshes the access token using the refresh token.
     */
    async refreshAccessToken(): Promise<string | null> {
        return this.coordinator.execute(() => this.performRefresh());
    }

    private async performRefresh(): Promise<string | null> {
        const refreshToken = await this.storage.loadRefreshToken();

        try {
            const tokens = await this.refreshClient.refresh(refreshToken);

            if (!tokens?.accessToken) {
                await this.handleRefreshFailure();
                return null;
            }

            this.setAccessTokenInMemory(tokens.accessToken);
            await this.storage.saveAccessToken(tokens.accessToken);

            if (tokens.refreshToken) {
                await this.storage.saveRefreshToken(tokens.refreshToken);
            }

            return this.accessToken;
        } catch (error) {
            // Handle refresh failure (401, network error, etc.)
            // Return null instead of throwing to match function signature
            await this.handleRefreshFailure();
            return null;
        }
    }

    private async handleRefreshFailure(): Promise<void> {
        try {
            await this.clearTokens();
        } catch {
            // Ignore cleanup errors
        }
        this.navigator.redirectToLogin();
    }

    private setAccessTokenInMemory(token: string): void {
        this.accessToken = token;
        this.accessExpMs = this.validator.getExpirationTime(token);
    }

    private isAccessTokenValid(): boolean {
        if (!this.accessToken) return false;
        // Use cached expiration time to avoid re-decoding JWT
        if (!this.accessExpMs) return true; // No expiration = always valid
        return Date.now() + 30_000 < this.accessExpMs;
    }

    private async maybeLoadPersistedAccessToken(): Promise<void> {
        if (this.accessToken) return;
        const saved = await this.storage.loadAccessToken();
        if (saved) {
            this.setAccessTokenInMemory(saved);
        }
    }
}

// ============================================================================
// FACTORY (Dependency Injection)
// ============================================================================

/**
 * Factory for creating TokenManager with dependencies.
 * Dependency Injection: Wires up all dependencies.
 */
class TokenManagerFactory {
    static create(
        validator?: IJwtValidator,
        storage?: ITokenStorage,
        refreshClient?: ITokenRefreshClient,
        navigator?: INavigator
    ): TokenManager {
        return new TokenManager(
            validator || new JwtTokenValidator(),
            storage || new SecureTokenStorage(),
            refreshClient || new TokenRefreshClient(),
            navigator || new AuthNavigator()
        );
    }
}

// ============================================================================
// SINGLETON INSTANCE (Backward Compatibility)
// ============================================================================

let managerInstance: TokenManager | null = null;

function getManager(): TokenManager {
    if (!managerInstance) {
        managerInstance = TokenManagerFactory.create();
    }
    return managerInstance;
}

// ============================================================================
// PUBLIC API (Backward Compatible)
// ============================================================================

/**
 * Sets tokens after successful login.
 */
export async function setTokensFromLogin(at: string, rt?: string): Promise<void> {
    return getManager().setTokensFromLogin(at, rt);
}

/**
 * Clears all tokens from memory and storage.
 */
export async function clearTokens(): Promise<void> {
    return getManager().clearTokens();
}

/**
 * Gets the current access token synchronously.
 */
export function getAccessTokenSync(): string | null {
    return getManager().getAccessTokenSync();
}

/**
 * Gets a valid access token, refreshing if necessary.
 */
export async function getValidAccessToken(): Promise<string | null> {
    return getManager().getValidAccessToken();
}

/**
 * Refreshes the access token using the refresh token.
 */
export async function refreshAccessToken(): Promise<string | null> {
    return getManager().refreshAccessToken();
}

// ============================================================================
// TESTING EXPORTS
// ============================================================================

/**
 * For testing: allows injection of custom TokenManager.
 */
export function __setManagerForTesting(manager: TokenManager | null): void {
    managerInstance = manager;
}

/**
 * For testing: resets the singleton instance.
 */
export function __resetManagerForTesting(): void {
    managerInstance = null;
}

/**
 * Export classes and interfaces for testing and extension.
 */
export const __testing = {
    TokenManager,
    JwtTokenValidator,
    SecureTokenStorage,
    TokenRefreshClient,
    AuthNavigator,
    TokenRefreshCoordinator,
    TokenManagerFactory,
};

export type {
    IJwtValidator,
    ITokenStorage,
    ITokenRefreshClient,
    INavigator,
    TokenPair,
};
