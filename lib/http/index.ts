import { createHttpClient, applyBearerAuth } from './client';
import { AUTH_BASE, APP_BASE } from './url';
import { getAccessTokenSync, getValidAccessToken, clearTokens } from '@/lib/tokenManager';

export const authApi = createHttpClient(AUTH_BASE, { withCredentials: true, unwrapEnvelope: true });
export const appApi = createHttpClient(APP_BASE, { unwrapEnvelope: true });

applyBearerAuth(appApi, { getAccessTokenSync, getValidAccessToken, clearTokens });

export { AUTH_BASE, APP_BASE } from './url';
