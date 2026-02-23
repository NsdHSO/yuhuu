import { applyBearerAuth, createHttpClient } from './client';
import { APP_BASE, AUTH_BASE } from './url';
import { clearTokens, getAccessTokenSync, getValidAccessToken } from '@/lib/tokenManager';

export const authApi = createHttpClient(AUTH_BASE, {
    withCredentials: true,
    unwrapEnvelope: true
});
export const appApi = createHttpClient(APP_BASE, { unwrapEnvelope: true });

applyBearerAuth(appApi, {
    getAccessTokenSync,
    getValidAccessToken,
    clearTokens
});

export { AUTH_BASE, APP_BASE } from './url';
