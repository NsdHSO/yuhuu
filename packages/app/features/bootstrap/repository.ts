import {appApi, unwrap} from '@yuhuu/auth';
import type {BootstrapResponse} from './types';

export interface BootstrapRepository {
    post(): Promise<BootstrapResponse>;
}

export class HttpBootstrapRepository implements BootstrapRepository {
    async post(): Promise<BootstrapResponse> {
        return await unwrap<BootstrapResponse>(appApi.post('/bootstrap', {create_profile_if_missing: true}));
    }
}

export const defaultBootstrapRepository: BootstrapRepository = new HttpBootstrapRepository();
