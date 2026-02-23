# Providers

Auth and data-fetching providers for the app. This folder exposes two React context providers you should wrap around your app’s UI:

- `QueryProvider` — configures a shared TanStack Query (React Query) client.
- `AuthProvider` — manages authentication state, tokens, and sign-in/out.

Both are wired in `app/_layout.tsx` so they are available everywhere.

---

## 1) What each provider does

### QueryProvider
- Creates a singleton `QueryClient` with sensible defaults for mobile/web.
- Tweaks retries and refetch-on-focus to reduce noisy network activity.
- You can import the client via React Query hooks (`useQuery`, `useMutation`) in your features.

### AuthProvider
- Holds the current `user` (if provided by the backend) and an auth `status`:
  - `idle` → app just mounted, figuring out session
  - `loading` → signing in or validating tokens
  - `signed-in`
  - `signed-out`
- Exposes `signIn(email, password)` and `signOut()`.
- Handles access/refresh tokens (native uses SecureStore; web falls back to in-memory/localStorage) via `lib/tokenManager.ts`.
- Calls backend logout to clear httpOnly session cookies when signing out.

---

## 2) Prerequisites (API base URLs)
The HTTP clients read these env vars (see `lib/http/url.ts`). If they are not set, local defaults are used:

- `EXPO_PUBLIC_AUTH_API_URL` → auth service base (e.g., `http://localhost:4100`)
- `EXPO_PUBLIC_API_URL` → app API base (e.g., `http://localhost:2003`)

Both are normalized and `"/v1"` is appended by the helper.

---

## 3) Wiring them in the app (already done)
`app/_layout.tsx` wraps your navigation with both providers. If you scaffold a new layout, follow this order so React Query is available to any auth logic:

```tsx
import { ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';

export default function RootLayout() {
  return (
    <ThemeProvider value={/* theme */}>
      <QueryProvider>
        <AuthProvider>
          <Stack>
            {/* screens */}
          </Stack>
        </AuthProvider>
      </QueryProvider>
    </ThemeProvider>
  );
}
```

---

## 4) Using AuthProvider

### Read auth state
```tsx
import { useAuth } from '@/providers/AuthProvider';

const { status, user } = useAuth();
if (status === 'loading' || status === 'idle') { /* show spinner */ }
if (status === 'signed-in') { /* show app */ }
if (status === 'signed-out') { /* show login */ }
```

### Sign in
```tsx
import { useAuth } from '@/providers/AuthProvider';

const { signIn } = useAuth();
await signIn(email, password); // throws on failure
// then navigate, e.g. router.replace('/(tabs)')
```
- On success, tokens are stored and future API calls include `Authorization: Bearer <token>`.
- Session refresh is automatic via `lib/tokenManager.ts` and `lib/http/client.ts` interceptors.

### Sign out
```tsx
const { signOut } = useAuth();
await signOut();
```
Sign out will:
- POST to `/v1/auth/logout` (server clears httpOnly cookies).
- Clear stored access/refresh tokens (SecureStore or localStorage fallback).
- Best-effort clear non-httpOnly auth cookies on web.
- Redirect to the login route.

> Note: httpOnly cookies are not accessible from JS; they must be cleared server-side on the logout call (already implemented).

---

## 5) Using QueryProvider
Use React Query hooks normally inside your feature modules.

Quick example with the pre-configured `appApi` client:
```tsx
import { useQuery } from '@tanstack/react-query';
import { appApi } from '@/lib/api';

function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: async () => (await appApi.get('/projects')).data,
    staleTime: 60_000,
  });
}
```

Global defaults (see `providers/QueryProvider.tsx`):
- No refetch on focus/reconnect/mount (opt in per-query when needed).
- Retry network errors up to 2 times (never retry 4xx).
- Small `staleTime`/`gcTime` tuned for mobile.

You can always override per query.

---

## 6) Bootstrap + caching (recommended pattern)
To avoid redundant requests on app load, the app uses a single `/v1/bootstrap` POST that returns:
- current user (`/me`),
- current profile (`/me/profile`, maybe `null`),
- current roles (`/me/roles`).

The response is written into the Query cache so dependent screens render instantly without firing separate GETs.

Use the `useBootstrapGate()` hook to coordinate this:
```tsx
import { useBootstrapGate } from '@/features/bootstrap/api';
import { useQuery } from '@tanstack/react-query';

export function ExampleScreen() {
  const ready = useBootstrapGate(); // runs bootstrap once when signed in

  // Enable queries only after bootstrap to avoid duplicate calls
  const projects = useQuery({
    queryKey: ['projects'],
    queryFn: fetchProjects,
    enabled: ready,
  });

  // profile example that only reads cache seeded by bootstrap
  // useMyProfileQuery({ enabled: false })
}
```

---

## 7) Testing components that depend on the providers
Wrap your component under test with both providers (or use a test utility that supplies them):
```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/providers/AuthProvider';

const client = new QueryClient();
render(
  <QueryClientProvider client={client}>
    <AuthProvider>
      <YourComponent />
    </AuthProvider>
  </QueryClientProvider>
);
```

---

## 8) Troubleshooting
- "No queryFn was found" for `['bootstrap','seeded']`:
  - Fixed by providing a local `queryFn` that only reads from the cache. If you move this hook, keep that pattern.
- Seeing `/v1/me/profile` fire on Profile after bootstrap:
  - Ensure you call `useMyProfileQuery({ enabled: false })` on that screen so it only reads seeded cache.
- Duplicate `/v1/bootstrap` calls:
  - An in-flight guard prevents this (`ensureBootstrap`); if it still happens, check if multiple roots trigger the gate simultaneously.

---

## 9) API surface (quick reference)

### AuthProvider
```ts
useAuth(): {
  user: { id: string; email: string; name?: string } | null;
  status: 'idle' | 'loading' | 'signed-in' | 'signed-out';
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}
```

### QueryProvider
- Exposes a configured `QueryClient` through React Query context.
- Default options are set in `providers/QueryProvider.tsx` and can be overridden per-hook.

---

## 10) Customization
- Adjust global React Query behavior in `providers/QueryProvider.tsx`.
- Change API base URLs in `lib/http/url.ts` (or via env vars shown above).
- Update sign-in/out flows in `providers/AuthProvider.tsx` to match your backend contract (e.g., field names, endpoints).
