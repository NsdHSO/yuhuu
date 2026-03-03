import axios, {AxiosError, AxiosHeaders, InternalAxiosRequestConfig} from 'axios';
import {applyBearerAuth} from '../client';
import type {TokenProvider} from '../types';

function createMockTokenProvider(overrides: Partial<TokenProvider> = {}): TokenProvider {
    return {
        getAccessTokenSync: jest.fn().mockReturnValue(null),
        getValidAccessToken: jest.fn().mockResolvedValue(null),
        clearTokens: jest.fn().mockResolvedValue(undefined),
        ...overrides,
    };
}

function createAxiosInstance() {
    return axios.create({
        baseURL: 'https://api.test.com',
    });
}

function createAxiosError(
    status: number,
    config: InternalAxiosRequestConfig
): AxiosError {
    const error = new AxiosError(
        `Request failed with status ${status}`,
        AxiosError.ERR_BAD_REQUEST,
        config,
        {},
        {
            status,
            statusText: status === 401 ? 'Unauthorized' : 'Error',
            headers: {},
            config,
            data: {},
        }
    );
    return error;
}

describe('applyBearerAuth', () => {
    describe('request interceptor', () => {
        it('should attach Bearer token from sync getter', async () => {
            const instance = createAxiosInstance();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue('sync-token'),
            });

            applyBearerAuth(instance, tp);

            // Run request through interceptors using adapter to capture the config
            let capturedConfig: InternalAxiosRequestConfig | undefined;
            instance.defaults.adapter = async (config) => {
                capturedConfig = config as InternalAxiosRequestConfig;
                return {data: {}, status: 200, statusText: 'OK', headers: {}, config: capturedConfig};
            };

            await instance.get('/test');

            expect(capturedConfig).toBeDefined();
            expect((capturedConfig!.headers as any).Authorization).toBe('Bearer sync-token');
            expect(tp.getAccessTokenSync).toHaveBeenCalled();
        });

        it('should fall back to async getter when sync returns null', async () => {
            const instance = createAxiosInstance();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue(null),
                getValidAccessToken: jest.fn().mockResolvedValue('async-token'),
            });

            applyBearerAuth(instance, tp);

            let capturedConfig: InternalAxiosRequestConfig | undefined;
            instance.defaults.adapter = async (config) => {
                capturedConfig = config as InternalAxiosRequestConfig;
                return {data: {}, status: 200, statusText: 'OK', headers: {}, config: capturedConfig};
            };

            await instance.get('/test');

            expect(capturedConfig).toBeDefined();
            expect((capturedConfig!.headers as any).Authorization).toBe('Bearer async-token');
            expect(tp.getAccessTokenSync).toHaveBeenCalled();
            expect(tp.getValidAccessToken).toHaveBeenCalled();
        });

        it('should not set Authorization header when no token is available', async () => {
            const instance = createAxiosInstance();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue(null),
                getValidAccessToken: jest.fn().mockResolvedValue(null),
            });

            applyBearerAuth(instance, tp);

            let capturedConfig: InternalAxiosRequestConfig | undefined;
            instance.defaults.adapter = async (config) => {
                capturedConfig = config as InternalAxiosRequestConfig;
                return {data: {}, status: 200, statusText: 'OK', headers: {}, config: capturedConfig};
            };

            await instance.get('/test');

            expect(capturedConfig).toBeDefined();
            expect((capturedConfig!.headers as any).Authorization).toBeUndefined();
        });
    });

    describe('response interceptor - 401 handling', () => {
        it('should retry 401 with refreshed token', async () => {
            const instance = createAxiosInstance();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue('old-token'),
                getValidAccessToken: jest.fn().mockResolvedValue('refreshed-token'),
            });

            applyBearerAuth(instance, tp);

            let callCount = 0;
            instance.defaults.adapter = async (config) => {
                callCount++;
                const cfg = config as InternalAxiosRequestConfig;
                if (callCount === 1) {
                    // First request: return 401
                    throw createAxiosError(401, cfg);
                }
                // Retry: return success
                return {data: {ok: true}, status: 200, statusText: 'OK', headers: {}, config: cfg};
            };

            const response = await instance.get('/test');

            expect(callCount).toBe(2);
            expect(response.data).toEqual({ok: true});
            expect(tp.getValidAccessToken).toHaveBeenCalled();
        });

        it('should clear tokens and call onUnauthorized when refresh fails on 401', async () => {
            const instance = createAxiosInstance();
            const onUnauthorized = jest.fn();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue('old-token'),
                getValidAccessToken: jest.fn().mockResolvedValue(null),
            });

            applyBearerAuth(instance, tp, onUnauthorized);

            instance.defaults.adapter = async (config) => {
                throw createAxiosError(401, config as InternalAxiosRequestConfig);
            };

            await expect(instance.get('/test')).rejects.toThrow();

            expect(tp.clearTokens).toHaveBeenCalled();
            expect(onUnauthorized).toHaveBeenCalled();
        });

        it('should not retry 401 twice to prevent infinite loops', async () => {
            const instance = createAxiosInstance();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue('old-token'),
                getValidAccessToken: jest.fn().mockResolvedValue('refreshed-token'),
            });

            applyBearerAuth(instance, tp);

            let callCount = 0;
            instance.defaults.adapter = async (config) => {
                callCount++;
                // Always return 401
                throw createAxiosError(401, config as InternalAxiosRequestConfig);
            };

            await expect(instance.get('/test')).rejects.toThrow();

            // First request + one retry = 2 calls max
            expect(callCount).toBe(2);
        });

        it('should pass through non-401 errors without retry', async () => {
            const instance = createAxiosInstance();
            const tp = createMockTokenProvider({
                getAccessTokenSync: jest.fn().mockReturnValue('token'),
            });

            applyBearerAuth(instance, tp);

            let callCount = 0;
            instance.defaults.adapter = async (config) => {
                callCount++;
                throw createAxiosError(403, config as InternalAxiosRequestConfig);
            };

            await expect(instance.get('/test')).rejects.toThrow();

            expect(callCount).toBe(1);
            expect(tp.getValidAccessToken).not.toHaveBeenCalled();
        });
    });
});
