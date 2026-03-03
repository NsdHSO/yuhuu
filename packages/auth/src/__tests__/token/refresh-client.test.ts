jest.mock('@yuhuu/http', () => ({
    applyEnvelopeUnwrapper: jest.fn(),
    AUTH_BASE: 'http://localhost:2003/auth',
}));

import {TokenRefreshClient} from '../../token/refresh-client';
import type {RefreshResponse} from '../../token/types';

describe('TokenRefreshClient', () => {
    let mockPost: jest.Mock;
    let client: TokenRefreshClient;

    beforeEach(() => {
        mockPost = jest.fn();
        client = new TokenRefreshClient({post: mockPost} as any);
    });

    describe('constructor', () => {
        it('should accept a custom httpClient', () => {
            const customClient = {post: jest.fn()} as any;
            const refreshClient = new TokenRefreshClient(customClient);
            expect(refreshClient).toBeInstanceOf(TokenRefreshClient);
        });
    });

    describe('refresh', () => {
        it('should send refreshToken in POST body when provided', async () => {
            mockPost.mockResolvedValue({
                data: {accessToken: 'new-access-token'},
            });

            await client.refresh('my-refresh-token');

            expect(mockPost).toHaveBeenCalledWith(
                '/auth/refresh',
                {refreshToken: 'my-refresh-token'}
            );
        });

        it('should send empty body when refreshToken is null', async () => {
            mockPost.mockResolvedValue({
                data: {accessToken: 'new-access-token'},
            });

            await client.refresh(null);

            expect(mockPost).toHaveBeenCalledWith(
                '/auth/refresh',
                {}
            );
        });

        it('should return TokenPair with accessToken and refreshToken', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'access-123',
                    refreshToken: 'refresh-456',
                },
            });

            const result = await client.refresh('old-refresh');

            expect(result).toEqual({
                accessToken: 'access-123',
                refreshToken: 'refresh-456',
            });
        });

        it('should return TokenPair with undefined refreshToken when not in response', async () => {
            mockPost.mockResolvedValue({
                data: {accessToken: 'access-123'},
            });

            const result = await client.refresh('old-refresh');

            expect(result).toEqual({
                accessToken: 'access-123',
                refreshToken: undefined,
            });
        });

        it('should return null when no accessToken in response', async () => {
            mockPost.mockResolvedValue({
                data: {} as RefreshResponse,
            });

            const result = await client.refresh('old-refresh');

            expect(result).toBeNull();
        });

        it('should throw on HTTP error', async () => {
            const error = new Error('Network error');
            mockPost.mockRejectedValue(error);

            await expect(client.refresh('token')).rejects.toThrow('Network error');
        });

        it('should throw on 500 server error', async () => {
            const error = {response: {status: 500}, message: 'Internal Server Error'};
            mockPost.mockRejectedValue(error);

            await expect(client.refresh('token')).rejects.toEqual(error);
        });
    });

    describe('extractAccessToken (via refresh)', () => {
        it('should extract accessToken from camelCase field', async () => {
            mockPost.mockResolvedValue({
                data: {accessToken: 'tok-camel'} as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.accessToken).toBe('tok-camel');
        });

        it('should extract access_token from snake_case field', async () => {
            mockPost.mockResolvedValue({
                data: {access_token: 'tok-snake'} as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.accessToken).toBe('tok-snake');
        });

        it('should extract token from generic field', async () => {
            mockPost.mockResolvedValue({
                data: {token: 'tok-generic'} as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.accessToken).toBe('tok-generic');
        });

        it('should extract access_token from nested message object', async () => {
            mockPost.mockResolvedValue({
                data: {
                    message: {access_token: 'tok-nested'},
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.accessToken).toBe('tok-nested');
        });

        it('should prioritize accessToken over access_token', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'first',
                    access_token: 'second',
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.accessToken).toBe('first');
        });

        it('should prioritize access_token over token', async () => {
            mockPost.mockResolvedValue({
                data: {
                    access_token: 'snake',
                    token: 'generic',
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.accessToken).toBe('snake');
        });

        it('should return null when no token field present', async () => {
            mockPost.mockResolvedValue({
                data: {} as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result).toBeNull();
        });
    });

    describe('extractRefreshToken (via refresh)', () => {
        it('should extract refreshToken from camelCase field', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'at',
                    refreshToken: 'rt-camel',
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.refreshToken).toBe('rt-camel');
        });

        it('should extract refresh_token from snake_case field', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'at',
                    refresh_token: 'rt-snake',
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.refreshToken).toBe('rt-snake');
        });

        it('should extract refresh_token from nested message object', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'at',
                    message: {refresh_token: 'rt-nested'},
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.refreshToken).toBe('rt-nested');
        });

        it('should prioritize refreshToken over refresh_token', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'at',
                    refreshToken: 'first',
                    refresh_token: 'second',
                } as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.refreshToken).toBe('first');
        });

        it('should return undefined refreshToken when not in response', async () => {
            mockPost.mockResolvedValue({
                data: {accessToken: 'at'} as RefreshResponse,
            });

            const result = await client.refresh(null);
            expect(result?.refreshToken).toBeUndefined();
        });
    });
});
