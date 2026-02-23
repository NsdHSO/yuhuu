import { router } from 'expo-router';

export function isAuthPath() {
    try {
        if (typeof window !== 'undefined') {
            const p = (window.location?.pathname || '').toLowerCase();
            return p === '/login' || p === '/register' || p.startsWith('/(auth)');
        }
    } catch {
    }
    return false;
}

export function redirectToLogin() {
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
