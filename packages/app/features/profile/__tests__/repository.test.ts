/**
 * Profile Repository Tests
 *
 * Test Coverage:
 * - getMyProfile: success, 404 (returns null), other errors
 * - createMyProfile: success, 409 conflict
 * - updateMyProfile: success, 404 not found
 */

import {HttpProfileRepository} from '../repository';
import {appApi, unwrap} from '@yuhuu/auth';
import type {ProfileInput, ProfileResponse} from '../types';

// Mock the auth module
jest.mock('@yuhuu/auth', () => ({
    appApi: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
    },
    unwrap: jest.fn(),
}));

describe('HttpProfileRepository', () => {
    let repository: HttpProfileRepository;
    const mockUnwrap = unwrap as jest.MockedFunction<typeof unwrap>;

    beforeEach(() => {
        repository = new HttpProfileRepository();
        jest.clearAllMocks();
    });

    describe('getMyProfile', () => {
        it('should return profile when it exists', async () => {
            const mockProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                middle_name: 'John',
                phone: '555-1234',
                date_of_birth: '1990-01-01',
                education_level: 'Bachelor',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockProfile);

            const result = await repository.getMyProfile();

            expect(appApi.get).toHaveBeenCalledWith('/me/profile');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockProfile);
        });

        it('should return null when profile does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Profile not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            const result = await repository.getMyProfile();

            expect(result).toBeNull();
        });

        it('should throw error for other HTTP errors', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {message: 'Internal server error'},
                },
            };

            mockUnwrap.mockRejectedValue(serverError);

            await expect(repository.getMyProfile()).rejects.toEqual(serverError);
        });

        it('should throw error for network errors', async () => {
            const networkError = new Error('Network error');
            mockUnwrap.mockRejectedValue(networkError);

            await expect(repository.getMyProfile()).rejects.toThrow('Network error');
        });
    });

    describe('createMyProfile', () => {
        it('should create profile successfully', async () => {
            const input: ProfileInput = {
                middle_name: 'Jane',
                phone: '555-5678',
                date_of_birth: '1995-05-15',
                education_level: 'Master',
            };

            const mockCreatedProfile: ProfileResponse = {
                id: 2,
                user_id: 20,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockCreatedProfile);

            const result = await repository.createMyProfile(input);

            expect(appApi.post).toHaveBeenCalledWith('/me/profile', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockCreatedProfile);
        });

        it('should throw error when profile already exists (409)', async () => {
            const input: ProfileInput = {phone: '555-1111'};

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Profile already exists'},
                },
            };

            mockUnwrap.mockRejectedValue(conflictError);

            await expect(repository.createMyProfile(input)).rejects.toEqual(conflictError);
        });

        it('should throw error for validation errors (400)', async () => {
            const input: ProfileInput = {phone: 'invalid'};

            const validationError = {
                response: {
                    status: 400,
                    data: {message: 'Invalid phone format'},
                },
            };

            mockUnwrap.mockRejectedValue(validationError);

            await expect(repository.createMyProfile(input)).rejects.toEqual(validationError);
        });
    });

    describe('updateMyProfile', () => {
        it('should update profile successfully', async () => {
            const input: ProfileInput = {
                phone: '555-9999',
                occupation: 'Senior Engineer',
            };

            const mockUpdatedProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                middle_name: 'John',
                phone: '555-9999',
                occupation: 'Senior Engineer',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdatedProfile);

            const result = await repository.updateMyProfile(input);

            expect(appApi.put).toHaveBeenCalledWith('/me/profile', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockUpdatedProfile);
        });

        it('should throw error when profile does not exist (404)', async () => {
            const input: ProfileInput = {phone: '555-1111'};

            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Profile not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.updateMyProfile(input)).rejects.toEqual(notFoundError);
        });

        it('should handle partial updates', async () => {
            const input: ProfileInput = {bio: 'Updated bio'};

            const mockUpdatedProfile: ProfileResponse = {
                id: 1,
                user_id: 10,
                bio: 'Updated bio',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdatedProfile);

            const result = await repository.updateMyProfile(input);

            expect(result).toEqual(mockUpdatedProfile);
        });
    });
});
