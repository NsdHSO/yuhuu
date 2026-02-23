import type { QueryClient } from '@tanstack/react-query';
import type { BootstrapResponse } from './types';
import type { BootstrapRepository } from './repository';
import { defaultBootstrapRepository } from './repository';

export function seedFromBootstrap(qc: QueryClient, data: BootstrapResponse) {
  if (data.user) qc.setQueryData(['me'], data.user);
  qc.setQueryData(['me', 'profile'], data.profile ?? null);
  if (data.roles) qc.setQueryData(['me', 'roles'], data.roles);
  // Signal to subscribers that bootstrap has completed for this session
  qc.setQueryData(['bootstrap', 'seeded'], true);
}

export async function bootstrapAndSeed(
  qc: QueryClient,
  repo: BootstrapRepository = defaultBootstrapRepository
): Promise<BootstrapResponse> {
  const data = await repo.post();
  seedFromBootstrap(qc, data);
  return data;
}
