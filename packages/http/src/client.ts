import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from 'axios';
import {applyEnvelopeUnwrapper} from './envelope';
import type {CreateHttpClientOptions, TokenProvider} from './types';

export function createHttpClient(baseURL: string, opts?: CreateHttpClientOptions): AxiosInstance {
    const instance = axios.create({
        baseURL,
        timeout: opts?.timeoutMs ?? 15_000,
        withCredentials: opts?.withCredentials,
    });

    if (opts?.unwrapEnvelope !== false) {
        applyEnvelopeUnwrapper(instance);
    }

    return instance;
}

export function applyBearerAuth(
    instance: AxiosInstance,
    tp: TokenProvider,
    onUnauthorized?: () => void
) {
    instance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
        const token = tp.getAccessTokenSync() || (await tp.getValidAccessToken());
        if (token) {
            const h = (config.headers = (config.headers as any) ?? {});
            (h as any).Authorization = `Bearer ${token}`;
        }
        return config;
    });

    instance.interceptors.response.use(
        (r) => r,
        async (error: AxiosError) => {
            const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;
            const status = error.response?.status ?? 0;
            if (status === 401 && original && !original._retry) {
                original._retry = true;
                const token = await tp.getValidAccessToken();
                if (token) {
                    const h = (original.headers = (original.headers as any) ?? {});
                    (h as any).Authorization = `Bearer ${token}`;
                    return instance(original);
                }
                await tp.clearTokens();
                if (onUnauthorized) {
                    try {
                        onUnauthorized();
                    } catch {
                    }
                }
            }
            return Promise.reject(error);
        }
    );
}
