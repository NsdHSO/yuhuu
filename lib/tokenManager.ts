import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import {
  clearStoredRefreshToken,
  loadRefreshToken,
  saveRefreshToken,
  saveAccessToken,
  loadAccessToken,
  clearStoredAccessToken,
} from './secureStore';

// Access token kept in-memory, but we also persist to secure storage for reloads.
let accessToken: string | null = null;
let accessExpMs: number | null = null;
let refreshInFlight: Promise<string | null> | null = null;

const API_BASE_URL = (process.env.EXPO_PUBLIC_AUTH_API_URL || 'http://localhost:4100') + '/v1';

type Jwt = { exp?: number; [k: string]: unknown };

function setAccessInMemory(at: string) {
  accessToken = at;
  try {
    const { exp } = jwtDecode<Jwt>(at);
    accessExpMs = exp ? exp * 1000 : null;
  } catch {
    accessExpMs = null;
  }
}

export async function setTokensFromLogin(at: string, rt?: string) {
  setAccessInMemory(at);
  await saveAccessToken(at);
  if (rt) await saveRefreshToken(rt);
}

export async function clearTokens() {
  accessToken = null;
  accessExpMs = null;
  await Promise.all([clearStoredRefreshToken(), clearStoredAccessToken()]);
}

function isAccessValid(bufferMs = 30_000) {
  if (!accessToken) return false;
  if (!accessExpMs) return true;
  return Date.now() + bufferMs < accessExpMs;
}

export function getAccessTokenSync() {
  return accessToken;
}

async function maybeLoadPersistedAccess() {
  if (accessToken) return;
  const saved = await loadAccessToken();
  if (saved) setAccessInMemory(saved);
}

async function refreshAccessToken(): Promise<string | null> {
  // Prefer stored RT for native apps; otherwise rely on httpOnly cookie with credentials
  const rt = await loadRefreshToken();

  const { data } = await axios.post(
    API_BASE_URL + '/auth/refresh',
    rt ? { refreshToken: rt } : {},
    { timeout: 15_000, withCredentials: true }
  );

  const newAT: string =
    (data as any).accessToken ?? (data as any).access_token ?? (data as any).token ?? (data as any)?.message?.access_token;
  const newRT: string | undefined =
    (data as any).refreshToken ?? (data as any).refresh_token ?? (data as any)?.message?.refresh_token;

  if (!newAT) return null;

  setAccessInMemory(newAT);
  await saveAccessToken(newAT);
  if (newRT) await saveRefreshToken(newRT);
  return accessToken;
}

export async function getValidAccessToken(): Promise<string | null> {
  if (isAccessValid()) return accessToken;
  await maybeLoadPersistedAccess();
  if (isAccessValid()) return accessToken;

  if (!refreshInFlight) {
    refreshInFlight = (async () => {
      try {
        return await refreshAccessToken();
      } catch {
        await clearTokens();
        return null;
      } finally {
        refreshInFlight = null;
      }
    })();
  }
  return refreshInFlight;
}
