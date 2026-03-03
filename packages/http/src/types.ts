import type {AxiosInstance} from 'axios';

export type CreateHttpClientOptions = {
    withCredentials?: boolean;
    timeoutMs?: number;
    unwrapEnvelope?: boolean;
};

export type TokenProvider = {
    getAccessTokenSync: () => string | null;
    getValidAccessToken: () => Promise<string | null>;
    clearTokens: () => Promise<void>;
};

export type ApiEnvelope<T> = { message: T; code: unknown };

export interface IHttpClient extends AxiosInstance {
}
