/**
 * API client re-exports using @yuhuu/http.
 */
import {APP_BASE, applyBearerAuth, AUTH_BASE, createHttpClient, unwrap} from '@yuhuu/http';
import {clearTokens, getAccessTokenSync, getValidAccessToken} from './token';

export const authApi = createHttpClient(AUTH_BASE, {
    withCredentials: true,
    unwrapEnvelope: true,
});

export const appApi = createHttpClient(APP_BASE, {unwrapEnvelope: true});

applyBearerAuth(appApi, {
    getAccessTokenSync,
    getValidAccessToken,
    clearTokens,
});

export {AUTH_BASE, APP_BASE} from '@yuhuu/http';
export {unwrap} from '@yuhuu/http';
