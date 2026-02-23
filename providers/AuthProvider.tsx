import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { authApi } from '@/lib/api';
import { clearTokens, getValidAccessToken, setTokensFromLogin } from '@/lib/tokenManager';
import { redirectToLogin } from '@/lib/nav';

export type User = { id: string; email: string; name?: string };

type AuthStatus = 'idle' | 'loading' | 'signed-in' | 'signed-out';

type AuthContextType = {
  user: User | null;
  status: AuthStatus;
  signIn: (email: string, password: string) => Promise<void>;
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
      const token = await getValidAccessToken();
      if (token) {
        setStatus('signed-in');
      } else {
        setUser(null);
        setStatus('signed-out');
      }
    })();
  }, []);

  async function signIn(email: string, password: string) {
    setStatus('loading');
    try {
      const { data } = await authApi.post<any>('/auth/login', { email, password });
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

  async function signOut() {
    try {
      await authApi.post('/auth/logout', {});
    } catch {}

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
    } catch {}

    await clearTokens();
    setUser(null);
    setStatus('signed-out');

    // Navigate to login immediately
    try { redirectToLogin(); } catch {}
  }

  const value = useMemo(() => ({ user, status, signIn, signOut }), [user, status]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
