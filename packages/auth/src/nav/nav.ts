/**
 * Authentication-related navigation utilities.
 *
 * SOLID: Single Responsibility - navigation operations only.
 */
import {router} from 'expo-router';
import type {INavigator} from '../token/types';

export function isAuthPath(): boolean {
    try {
        if (typeof window !== 'undefined') {
            const p = (window.location?.pathname || '').toLowerCase();
            return p === '/login' || p === '/register' || p.startsWith('/(auth)');
        }
    } catch {
    }
    return false;
}

export function redirectToLogin(): void {
    // Avoid redundant redirects on web
    try {
        if (typeof window !== 'undefined') {
            const p = window.location?.pathname || '';
            if (p === '/login' || p === '/register' || p.startsWith('/(auth)')) return;
        }
    } catch {
    }

    try {
        router.replace('/login');
    } catch {
        // Fallback for web/non-router contexts
        if (typeof window !== 'undefined') {
            try {
                window.location.href = '/login';
            } catch {
            }
        }
    }
}

/**
 * Navigator class implementing INavigator interface.
 * Used by TokenManager via dependency injection.
 */
export class AuthNavigator implements INavigator {
    isAuthPath(): boolean {
        return isAuthPath();
    }

    redirectToLogin(): void {
        try {
            redirectToLogin();
        } catch {
            // Graceful degradation
        }
    }
}
