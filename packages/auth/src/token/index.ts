/**
 * Token management public API.
 *
 * Provides backward-compatible function exports while internally using
 * SOLID architecture with dependency injection.
 */
import type {IJwtValidator, INavigator, ITokenRefreshClient, ITokenStorage} from './types';
import {TokenManager} from './manager';
import {JwtTokenValidator} from './validator';
import {SecureTokenStorage} from './storage-adapter';
import {TokenRefreshClient} from './refresh-client';
import {AuthNavigator} from '../nav/nav';

// Re-exports
export type {IJwtValidator, ITokenStorage, ITokenRefreshClient, INavigator, TokenPair} from './types';
export {JwtTokenValidator} from './validator';
export {SecureTokenStorage} from './storage-adapter';
export {TokenRefreshClient} from './refresh-client';
export {TokenRefreshCoordinator} from './coordinator';
export {TokenManager} from './manager';

// Factory
export class TokenManagerFactory {
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

// Singleton instance
let managerInstance: TokenManager | null = null;

function getManager(): TokenManager {
    if (!managerInstance) {
        managerInstance = TokenManagerFactory.create();
    }
    return managerInstance;
}

export async function setTokensFromLogin(at: string, rt?: string): Promise<void> {
    return getManager().setTokensFromLogin(at, rt);
}

export async function clearTokens(): Promise<void> {
    return getManager().clearTokens();
}

export function getAccessTokenSync(): string | null {
    return getManager().getAccessTokenSync();
}

export async function getValidAccessToken(): Promise<string | null> {
    return getManager().getValidAccessToken();
}

export async function refreshAccessToken(): Promise<string | null> {
    return getManager().refreshAccessToken();
}

export async function loadRefreshToken(): Promise<string | null> {
    return getManager()['storage'].loadRefreshToken();
}

// Testing exports
export function __setManagerForTesting(manager: TokenManager | null): void {
    managerInstance = manager;
}

export function __resetManagerForTesting(): void {
    managerInstance = null;
}
