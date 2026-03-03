/**
 * JWT token validator.
 *
 * SOLID: Single Responsibility - JWT validation only.
 */
import {jwtDecode} from 'jwt-decode';
import type {IJwtValidator, Jwt} from './types';

export class JwtTokenValidator implements IJwtValidator {
    getExpirationTime(token: string): number | null {
        try {
            const {exp} = jwtDecode<Jwt>(token);
            return exp ? exp * 1000 : null;
        } catch {
            return null;
        }
    }

    isValid(token: string, bufferMs: number = 30_000): boolean {
        if (!token) return false;
        const expMs = this.getExpirationTime(token);
        if (!expMs) return true; // No expiration = always valid
        return Date.now() + bufferMs < expMs;
    }
}
