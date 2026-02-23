import { Platform } from 'react-native';
import { NativeModulesProxy } from 'expo-modules-core';

const REFRESH_TOKEN_KEY = 'refresh_token';
const ACCESS_TOKEN_KEY = 'access_token';
let inMemoryRefresh: string | null = null;
let inMemoryAccess: string | null = null;

function canUseSecureStore() {
  if (Platform.OS === 'web') return false;
  try {
    return !!(NativeModulesProxy as any)?.ExpoSecureStore;
  } catch {
    return false;
  }
}

async function getSecureStore(): Promise<any | null> {
  if (!canUseSecureStore()) return null;
  try {
    // Lazy import only when the native module exists
    return await import('expo-secure-store');
  } catch {
    return null;
  }
}

// -------------------- Refresh token --------------------
export async function saveRefreshToken(token: string) {
  const SecureStore = await getSecureStore();
  if (SecureStore?.setItemAsync) {
    try {
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        requireAuthentication: false,
      });
      return;
    } catch {}
  }
  // Fallbacks
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.setItem(REFRESH_TOKEN_KEY, token); } catch {}
  } else {
    inMemoryRefresh = token;
  }
}

export async function loadRefreshToken(): Promise<string | null> {
  const SecureStore = await getSecureStore();
  if (SecureStore?.getItemAsync) {
    try { return (await SecureStore.getItemAsync(REFRESH_TOKEN_KEY)) ?? null; } catch {}
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { return window.localStorage.getItem(REFRESH_TOKEN_KEY); } catch { return null; }
  }
  return inMemoryRefresh;
}

export async function clearStoredRefreshToken() {
  const SecureStore = await getSecureStore();
  if (SecureStore?.deleteItemAsync) {
    try { await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY); } catch {}
  } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.removeItem(REFRESH_TOKEN_KEY); } catch {}
  }
  inMemoryRefresh = null;
}

// -------------------- Access token (optional persist) --------------------
export async function saveAccessToken(token: string) {
  const SecureStore = await getSecureStore();
  if (SecureStore?.setItemAsync) {
    try {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        requireAuthentication: false,
      });
      return;
    } catch {}
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.setItem(ACCESS_TOKEN_KEY, token); } catch {}
  } else {
    inMemoryAccess = token;
  }
}

export async function loadAccessToken(): Promise<string | null> {
  const SecureStore = await getSecureStore();
  if (SecureStore?.getItemAsync) {
    try { return (await SecureStore.getItemAsync(ACCESS_TOKEN_KEY)) ?? null; } catch {}
  }
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { return window.localStorage.getItem(ACCESS_TOKEN_KEY); } catch { return null; }
  }
  return inMemoryAccess;
}

export async function clearStoredAccessToken() {
  const SecureStore = await getSecureStore();
  if (SecureStore?.deleteItemAsync) {
    try { await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY); } catch {}
  } else if (Platform.OS === 'web' && typeof window !== 'undefined') {
    try { window.localStorage.removeItem(ACCESS_TOKEN_KEY); } catch {}
  }
  inMemoryAccess = null;
}
