/**
 * Storage adapter that wraps @yuhuu/storage functions.
 *
 * SOLID: Single Responsibility - storage operations only.
 * SOLID: Dependency Inversion - adapts external storage to ITokenStorage interface.
 */
import {getItem, removeItem, setItem} from '@yuhuu/storage';
import type {ITokenStorage} from './types';

const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';

export class SecureTokenStorage implements ITokenStorage {
    async saveAccessToken(token: string): Promise<void> {
        await setItem(ACCESS_TOKEN_KEY, token);
    }

    async loadAccessToken(): Promise<string | null> {
        return getItem(ACCESS_TOKEN_KEY);
    }

    async clearAccessToken(): Promise<void> {
        await removeItem(ACCESS_TOKEN_KEY);
    }

    async saveRefreshToken(token: string): Promise<void> {
        await setItem(REFRESH_TOKEN_KEY, token);
    }

    async loadRefreshToken(): Promise<string | null> {
        return getItem(REFRESH_TOKEN_KEY);
    }

    async clearRefreshToken(): Promise<void> {
        await removeItem(REFRESH_TOKEN_KEY);
    }
}
