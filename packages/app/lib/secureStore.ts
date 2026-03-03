/**
 * Backwards compatibility layer for old @/lib/secureStore imports
 * Wraps the new SecureTokenStorage from @yuhuu/auth
 */
import {SecureTokenStorage} from '@yuhuu/auth';

const storage = new SecureTokenStorage();

export const saveRefreshToken = (token: string) => storage.saveRefreshToken(token);
export const loadRefreshToken = () => storage.loadRefreshToken();
export const clearStoredRefreshToken = () => storage.clearRefreshToken();
export const saveAccessToken = (token: string) => storage.saveAccessToken(token);
export const loadAccessToken = () => storage.loadAccessToken();
export const clearStoredAccessToken = () => storage.clearAccessToken();
