import type { BootstrapResponse } from './types';
import type { BootstrapRepository } from './repository';
import { defaultBootstrapRepository } from './repository';

// SOLID barrel exports
export * from './types';
export * from './repository';
export * from './hooks';
export { seedFromBootstrap, bootstrapAndSeed } from './service';

// Back-compat: keep function name used elsewhere
export function postBootstrap(repo: BootstrapRepository = defaultBootstrapRepository): Promise<BootstrapResponse> {
    return repo.post();
}
