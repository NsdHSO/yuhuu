import type {AxiosInstance, AxiosResponse} from 'axios';
import type {ApiEnvelope} from './types';

export function isEnvelope(data: any): data is ApiEnvelope<any> {
    // Check if it's an envelope structure with message and code fields
    return !!(data && typeof data === 'object' && 'message' in data && 'code' in data);
}

export function applyEnvelopeUnwrapper(instance: AxiosInstance) {
    instance.interceptors.response.use((r: AxiosResponse) => {
        const d: any = (r as any).data;
        if (isEnvelope(d)) {
            // NEW BACKEND (correct): {code: 200, data: {...}, message: "Success"}
            // OLD BACKEND (bug): {code: "OK", message: {...}}
            // Prefer 'data' field if it exists, fallback to 'message' for backward compatibility
            if ('data' in d) {
                (r as any).data = d.data;
            } else {
                // Old backend puts actual data in 'message' field
                (r as any).data = d.message;
            }
        }
        return r;
    });
}

export const unwrap = async <T>(p: Promise<{ data: T }>): Promise<T> => (await p).data;
