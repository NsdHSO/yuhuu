import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/api';
import { clearTokens, getValidAccessToken, setTokensFromLogin, refreshAccessToken } from '@/lib/tokenManager';
import { redirectToLogin } from '@/lib/nav';
import { queryClient } from '@/providers/QueryProvider';
import {
    authenticateWithBiometrics,
    getBiometricEmail,
    clearBiometricData,
} from '@/lib/biometricAuth';

export type User = { id: string; email: string; name?: string };

type AuthStatus = 'idle' | 'loading' | 'signed-in' | 'signed-out';

type AuthContextType = {
    user: User | null;
    status: AuthStatus;
    signIn: (email: string, password: string) => Promise<void>;
    signInWithBiometrics: () => Promise<void>;
    signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('AuthProvider missing');
    return ctx;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [status, setStatus] = useState<AuthStatus>('idle');

    useEffect(() => {
        (async () => {
            setStatus('loading');
            try {
                const token = await getValidAccessToken();
                if (token) {
                    // Fetch user data to populate user object on relaunch
                    try {
                        const { data } = await authApi.get<any>('/auth/me');
                        const usr = data?.user ?? data;
                        if (usr) setUser(usr as User);
                    } catch {
                        // If /auth/me fails, continue without user data
                        // User will be fetched on next login/refresh
                    }
                    setStatus('signed-in');
                } else {
                    setUser(null);
                    setStatus('signed-out');
                }
            } catch (error) {
                // Token refresh failed (401, network error, etc.)
                // Clear state and show login
                setUser(null);
                setStatus('signed-out');
            }
        })();
    }, []);

    async function signIn(email: string, password: string) {
        setStatus('loading');
        try {
            const { data } = await authApi.post<any>('/auth/login', {
                email,
                password
            });
            const at = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.message?.access_token;
            const rt = data?.refreshToken ?? data?.refresh_token ?? data?.message?.refresh_token;
            const usr = (data?.user ?? data?.message?.user) as User | undefined;
            if (at) await setTokensFromLogin(at, rt);
            if (usr) setUser(usr as User);
            setStatus('signed-in');
        } catch (e) {
            setUser(null);
            setStatus('signed-out');
            throw e;
        }
    }

    async function signInWithBiometrics() {
        setStatus('loading');
        try {
            const email = await getBiometricEmail();
            if (!email) throw new Error('No saved biometric credentials found');

            const authenticated = await authenticateWithBiometrics('Authenticate to sign in');
            if (!authenticated) {
                throw new Error('Biometric authentication failed');
            }

            // Use tokenManager's refreshAccessToken to avoid race conditions
            // This uses the same deduplication as the 401 interceptor
            const at = await refreshAccessToken();
            if (!at) {
                throw new Error('Session expired. Please sign in with your password.');
            }

            // Fetch user data after successful token refresh
            try {
                const { data } = await authApi.get<any>('/auth/me');
                const usr = data?.user ?? data;
                if (usr) setUser(usr as User);
            } catch {
                // Continue without user data if /auth/me fails
            }

            setStatus('signed-in');
        } catch (e) {
            setUser(null);
            setStatus('signed-out');
            throw e;
        }
    }

    async function signOut() {
        try {
            await authApi.post('/auth/logout', {});
        } catch {
        }

        // Best-effort: clear any non-HttpOnly cookies on web (HttpOnly must be cleared server-side above)
        try {
            if (typeof document !== 'undefined' && document.cookie) {
                const cookies = document.cookie.split(';').map((c) => c.split('=')[0].trim());
                for (const name of cookies) {
                    // Restrict to obvious auth names to avoid nuking unrelated cookies
                    if (!/access|refresh|auth|token/i.test(name)) continue;
                    document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
                }
            }
        } catch {
        }

        await clearBiometricData();
        await clearTokens();

        // CRITICAL: Clear React Query cache to prevent cached data from previous user
        // This ensures roles, permissions, and other user-specific data are cleared
        queryClient.clear();

        setUser(null);
        setStatus('signed-out');

        // Navigate to login immediately
        try {
            redirectToLogin();
        } catch {
        }
    }

    const value = useMemo(() => ({
        user,
        status,
        signIn,
        signInWithBiometrics,
        signOut
    }), [user, status]);

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
