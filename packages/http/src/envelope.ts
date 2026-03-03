import type {AxiosInstance, AxiosResponse} from 'axios';
import type {ApiEnvelope} from './types';

export function isEnvelope(data: any): data is ApiEnvelope<any> {
    return data && typeof data === 'object' && 'message' in data && 'code' in data;
}

export function applyEnvelopeUnwrapper(instance: AxiosInstance) {
    instance.interceptors.response.use((r: AxiosResponse) => {
        const d: any = (r as any).data;
        if (isEnvelope(d)) {
            (r as any).data = d.message;
        }
        return r;
    });
}

export const unwrap = async <T>(p: Promise<{ data: T }>): Promise<T> => (await p).data;
