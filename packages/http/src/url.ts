export function normalizeBase(url: string): string {
    try {
        const u = new URL(url);
        if (u.hostname === '0.0.0.0') u.hostname = 'localhost';
        const origin = `${u.protocol}//${u.host}`;
        return origin + (u.pathname.endsWith('/') ? u.pathname.slice(0, -1) : u.pathname);
    } catch {
        return url.replace('0.0.0.0', 'localhost');
    }
}

export const AUTH_BASE = normalizeBase(process.env.EXPO_PUBLIC_AUTH_API_URL || 'http://localhost:4100') + '/v1';
export const APP_BASE = normalizeBase(process.env.EXPO_PUBLIC_API_URL || 'http://localhost:2003') + '/v1';

// Log API URLs in both dev and production for debugging
// This helps verify correct URLs are bundled in release builds
console.log('[api] AUTH_BASE', AUTH_BASE, 'APP_BASE', APP_BASE);

// Warn if localhost URLs detected in production
if (!__DEV__ && (AUTH_BASE.includes('localhost') || APP_BASE.includes('localhost'))) {
    console.error('[api] WARNING: Localhost URLs detected in production build!');
    console.error('[api] This will cause the app to fail on physical devices.');
    console.error('[api] Check GitHub Secrets: FAT_GRAPHQL_URL, EXPO_PUBLIC_API_URL, EXPO_PUBLIC_AUTH_API_URL');
}
