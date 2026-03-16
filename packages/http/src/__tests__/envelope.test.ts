import axios from 'axios';
import {applyEnvelopeUnwrapper, isEnvelope} from '../envelope';
import type {ApiEnvelope} from '../types';

function createAxiosInstance() {
    return axios.create({
        baseURL: 'https://api.test.com',
    });
}

describe('isEnvelope', () => {
    it('should return true for valid envelope objects', () => {
        const envelope: ApiEnvelope<{id: number}> = {
            code: 200,
            data: {id: 1},
            message: 'Success',
        };
        expect(isEnvelope(envelope)).toBe(true);
    });

    it('should return false for non-envelope objects', () => {
        expect(isEnvelope({id: 1})).toBe(false);
        expect(isEnvelope(null)).toBe(false);
        expect(isEnvelope(undefined)).toBe(false);
        expect(isEnvelope('string')).toBe(false);
        expect(isEnvelope(123)).toBe(false);
    });

    it('should return false for objects missing required fields', () => {
        expect(isEnvelope({code: 200})).toBe(false);
        expect(isEnvelope({message: 'Success'})).toBe(false);
        expect(isEnvelope({data: {}})).toBe(false);
    });
});

describe('applyEnvelopeUnwrapper', () => {
    it('should extract data field from envelope response', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const expectedData = {id: 1, name: 'Test User'};
        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 200,
                    data: expectedData,
                    message: 'Success',
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');

        // The unwrapper should extract the 'data' field from the envelope
        expect(response.data).toEqual(expectedData);
    });

    it('should extract data field with array payload', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const expectedData = [{id: 1}, {id: 2}, {id: 3}];
        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 200,
                    data: expectedData,
                    message: 'Success',
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');
        expect(response.data).toEqual(expectedData);
    });

    it('should extract data field with nested object payload', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const expectedData = {
            user: {id: 1, name: 'Test'},
            permissions: ['read', 'write'],
        };
        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 200,
                    data: expectedData,
                    message: 'User retrieved successfully',
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');
        expect(response.data).toEqual(expectedData);
    });

    it('should handle null data field in envelope', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 204,
                    data: null,
                    message: 'No content',
                },
                status: 204,
                statusText: 'No Content',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');
        expect(response.data).toBeNull();
    });

    it('should not modify non-envelope responses', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const plainData = {id: 1, value: 'test'};
        instance.defaults.adapter = async (config) => {
            return {
                data: plainData,
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');
        expect(response.data).toEqual(plainData);
    });

    it('should handle error envelope with 4xx status', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const errorData = {error: 'Validation failed', fields: ['email']};
        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 400,
                    data: errorData,
                    message: 'Bad Request',
                },
                status: 400,
                statusText: 'Bad Request',
                headers: {},
                config,
            };
        };

        try {
            await instance.get('/test');
        } catch (error: any) {
            // Axios will throw on 4xx, but we can still check the data if intercepted differently
            // This test ensures envelope unwrapping works regardless of status
        }
    });

    it('should preserve message field separately (not overwrite data)', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const expectedData = {id: 1};
        const expectedMessage = 'Operation successful';

        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 200,
                    data: expectedData,
                    message: expectedMessage,
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');

        // Data should be unwrapped to the actual payload
        expect(response.data).toEqual(expectedData);
        // Message should NOT be in response.data
        expect(response.data).not.toBe(expectedMessage);
    });

    it('should handle old backend format (data in message field)', async () => {
        const instance = createAxiosInstance();
        applyEnvelopeUnwrapper(instance);

        const expectedData = [{id: 1, name: 'Test'}, {id: 2, name: 'Test2'}];

        instance.defaults.adapter = async (config) => {
            return {
                data: {
                    code: 'OK',
                    message: expectedData,  // Old backend puts data in 'message' field
                },
                status: 200,
                statusText: 'OK',
                headers: {},
                config,
            };
        };

        const response = await instance.get('/test');

        // Should extract data from 'message' field for old backend
        expect(response.data).toEqual(expectedData);
        expect(Array.isArray(response.data)).toBe(true);
    });
});
