import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a singleton QueryClient at module scope to avoid double-fetches in React StrictMode
const client = new QueryClient({
  defaultOptions: {
    queries: {
      // Don't refetch on window focus/navigation by default; we'll opt-in per-query if needed
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      // retry up to 2 times for network errors; never for 4xx
      retry: (failureCount, error: any) => {
        const status = (error as any)?.response?.status ?? 0;
        if (status >= 400 && status < 500) return false;
        return failureCount < 2;
      },
      // small default cache so repeated mounts don't refetch immediately
      staleTime: 30_000,
      gcTime: 5 * 60_000,
    },
  },
});

export function QueryProvider({ children }: { children: React.ReactNode }) {
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
