import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { applyEnvelopeUnwrapper } from './envelope';

export type CreateHttpClientOptions = {
  withCredentials?: boolean;
  timeoutMs?: number;
  unwrapEnvelope?: boolean;
};

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

export type TokenProvider = {
  getAccessTokenSync: () => string | null;
  getValidAccessToken: () => Promise<string | null>;
  clearTokens: () => Promise<void>;
};

export function applyBearerAuth(instance: AxiosInstance, tp: TokenProvider) {
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
      }
      return Promise.reject(error);
    }
  );
}
