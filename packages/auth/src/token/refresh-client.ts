/**
 * HTTP client for token refresh operations.
 *
 * SOLID: Single Responsibility - API communication only.
 * SOLID: Dependency Inversion - uses @yuhuu/http abstractions.
 */
import axios, {AxiosInstance} from 'axios';
import {applyEnvelopeUnwrapper, AUTH_BASE} from '@yuhuu/http';
import type {ITokenRefreshClient, RefreshResponse, TokenPair} from './types';

export class TokenRefreshClient implements ITokenRefreshClient {
    private readonly httpClient: AxiosInstance;

    constructor(httpClient?: AxiosInstance) {
        if (httpClient) {
            this.httpClient = httpClient;
        } else {
            this.httpClient = axios.create({
                baseURL: AUTH_BASE,
                timeout: 15_000,
                withCredentials: true,
            });
            try {
                applyEnvelopeUnwrapper(this.httpClient);
            } catch {
                // In test environment, interceptors might not be available
            }
        }
    }

    async refresh(refreshToken: string | null): Promise<TokenPair | null> {
        try {
            const {data} = await this.httpClient.post<RefreshResponse>(
                '/auth/refresh',
                refreshToken ? {refreshToken} : {}
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
