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

if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[api] AUTH_BASE', AUTH_BASE, 'APP_BASE', APP_BASE);
}
