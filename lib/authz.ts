import { jwtDecode } from 'jwt-decode';
import { getAccessTokenSync } from './tokenManager';

export type Claims = {
    roles?: string[];
    role?: string | string[];
    perms?: string[];
    permissions?: string[];
    [k: string]: any;
};

export function readClaims(): Claims | null {
    const at = getAccessTokenSync();
    if (!at) return null;
    try {
        return jwtDecode<Claims>(at);
    } catch {
        return null;
    }
}

export function hasRole(target: string): boolean {
    const c = readClaims();
    if (!c) return false;
    const roles: string[] = Array.isArray(c.roles)
        ? (c.roles as string[])
        : Array.isArray(c.role)
            ? (c.role as string[])
            : typeof c.role === 'string'
                ? [c.role]
                : [];
    const set = new Set(roles.map((r) => r.toLowerCase()));
    return set.has((target || '').toLowerCase());
}

export function hasAnyRole(targets: string[]): boolean {
    return targets.some((r) => hasRole(r));
}

export function hasPermission(target: string): boolean {
    const c = readClaims();
    if (!c) return false;
    const perms: string[] = Array.isArray((c as any).permissions)
        ? ((c as any).permissions as string[])
        : Array.isArray((c as any).perms)
            ? ((c as any).perms as string[])
            : [];
    const set = new Set(perms.map((p) => p.toLowerCase()));
    return set.has((target || '').toLowerCase());
}

export function hasAnyPermission(targets: string[]): boolean {
    return targets.some((p) => hasPermission(p));
}
