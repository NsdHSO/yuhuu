import { appApi, unwrap } from '@/lib/api';
import type { BootstrapResponse } from './types';

export interface BootstrapRepository {
    post(): Promise<BootstrapResponse>;
}

export class HttpBootstrapRepository implements BootstrapRepository {
    async post(): Promise<BootstrapResponse> {
        return await unwrap<BootstrapResponse>(appApi.post('/bootstrap', {}));
    }
}

export const defaultBootstrapRepository: BootstrapRepository = new HttpBootstrapRepository();
