/**
 * Main token manager that coordinates all token operations.
 *
 * SOLID: Facade Pattern - provides simple interface to complex subsystem.
 * SOLID: Single Responsibility - orchestrate token lifecycle.
 * SOLID: Dependency Inversion - depends on abstractions via constructor injection.
 */
import type {IJwtValidator, INavigator, ITokenRefreshClient, ITokenStorage} from './types';
import {TokenRefreshCoordinator} from './coordinator';

export class TokenManager {
    private accessToken: string | null = null;
    private accessExpMs: number | null = null;
    private readonly coordinator = new TokenRefreshCoordinator();

    constructor(
        private readonly validator: IJwtValidator,
        private readonly storage: ITokenStorage,
        private readonly refreshClient: ITokenRefreshClient,
        private readonly navigator: INavigator
    ) {
    }

    async setTokensFromLogin(accessToken: string, refreshToken?: string): Promise<void> {
        this.setAccessTokenInMemory(accessToken);
        await this.storage.saveAccessToken(accessToken);
        if (refreshToken) {
            await this.storage.saveRefreshToken(refreshToken);
        }
    }

    async clearTokens(): Promise<void> {
        this.accessToken = null;
        this.accessExpMs = null;
        await Promise.all([
            this.storage.clearRefreshToken(),
            this.storage.clearAccessToken(),
        ]);
    }

    getAccessTokenSync(): string | null {
        return this.accessToken;
    }

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
