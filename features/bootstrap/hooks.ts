import { useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import type { BootstrapRepository } from './repository';
import { defaultBootstrapRepository } from './repository';
import { bootstrapAndSeed } from './service';
import { useAuth } from '@/providers/AuthProvider';

// Global in-flight guard to avoid duplicate POST /bootstrap under StrictMode
let inflight: Promise<void> | null = null;

export async function ensureBootstrap(qc: ReturnType<typeof useQueryClient>, repo: BootstrapRepository) {
    const seeded = qc.getQueryData<boolean>(['bootstrap', 'seeded']);
    if (seeded) return;
    if (inflight) return inflight;
    inflight = (async () => {
        try {
            await bootstrapAndSeed(qc, repo);
        } finally {
            inflight = null;
        }
    })();
    return inflight;
}

// Runs bootstrap if needed and returns whether the cache is ready.
export function useBootstrapGate(repo: BootstrapRepository = defaultBootstrapRepository): boolean {
    const qc = useQueryClient();
    const { status } = useAuth();

  // Subscribe to bootstrap seeded flag using a no-network queryFn
  const { data: seeded } = useQuery({
    queryKey: ['bootstrap', 'seeded'],
    // Return cached value only; no HTTP calls involved
    queryFn: async () =>
      (qc.getQueryData<boolean>(['bootstrap', 'seeded']) ?? Boolean(qc.getQueryData(['me']))) as boolean,
    initialData: () => qc.getQueryData<boolean>(['bootstrap', 'seeded']) ?? Boolean(qc.getQueryData(['me'])),
    staleTime: Infinity,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

    useEffect(() => {
        if (status !== 'signed-in') return;
        if (seeded) return;
        void ensureBootstrap(qc, repo);
    }, [status, seeded, qc, repo]);

    return Boolean(seeded || status !== 'signed-in');
}
