/**
 * Family Repository Tests
 *
 * Test Coverage:
 * - listMyFamily: success, empty array
 * - getMyFamilyRelationship: success, 404 (returns null), other errors
 * - createMyFamilyRelationship: success (registered user), success (unregistered person), validation errors
 * - updateMyFamilyRelationship: success, 404 not found
 * - deleteMyFamilyRelationship: success, 404 not found
 */

import {HttpFamilyRepository} from '../repository';
import {appApi, unwrap} from '@yuhuu/auth';
import type {CreateFamilyRelationshipInput, FamilyRelationship, UpdateFamilyRelationshipInput} from '../types';

// Mock the auth module
jest.mock('@yuhuu/auth', () => ({
    appApi: {
        get: jest.fn(),
        post: jest.fn(),
        put: jest.fn(),
        delete: jest.fn(),
    },
    unwrap: jest.fn(),
}));

describe('HttpFamilyRepository', () => {
    let repository: HttpFamilyRepository;
    const mockUnwrap = unwrap as jest.MockedFunction<typeof unwrap>;

    beforeEach(() => {
        repository = new HttpFamilyRepository();
        jest.clearAllMocks();
    });

    describe('listMyFamily', () => {
        it('should return array of family relationships', async () => {
            const mockFamily: FamilyRelationship[] = [
                {
                    id: 1,
                    user_id: 10,
                    related_user_id: 20,
                    relationship_type: 'spouse',
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
                {
                    id: 2,
                    user_id: 10,
                    related_person_name: 'John Doe',
                    relationship_type: 'child',
                    created_at: '2024-01-02T00:00:00',
                    updated_at: '2024-01-02T00:00:00',
                },
            ];

            mockUnwrap.mockResolvedValue(mockFamily);

            const result = await repository.listMyFamily();

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/family');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockFamily);
        });

        it('should return empty array when no family relationships', async () => {
            mockUnwrap.mockResolvedValue([]);

            const result = await repository.listMyFamily();

            expect(result).toEqual([]);
        });

        it('should throw error for server errors', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {message: 'Internal server error'},
                },
            };

            mockUnwrap.mockRejectedValue(serverError);

            await expect(repository.listMyFamily()).rejects.toEqual(serverError);
        });
    });

    describe('getMyFamilyRelationship', () => {
        it('should return family relationship when it exists', async () => {
            const mockRelationship: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_user_id: 20,
                relationship_type: 'spouse',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockRelationship);

            const result = await repository.getMyFamilyRelationship(1);

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/family/1');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockRelationship);
        });

        it('should return null when relationship does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Relationship not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            const result = await repository.getMyFamilyRelationship(999);

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

            await expect(repository.getMyFamilyRelationship(1)).rejects.toEqual(serverError);
        });
    });

    describe('createMyFamilyRelationship', () => {
        it('should create relationship for registered user', async () => {
            const input: CreateFamilyRelationshipInput = {
                related_user_id: 20,
                relationship_type: 'spouse',
            };

            const mockCreated: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_user_id: 20,
                relationship_type: 'spouse',
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockCreated);

            const result = await repository.createMyFamilyRelationship(input);

            expect(appApi.post).toHaveBeenCalledWith('/profiles/me/family', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });

        it('should create relationship for unregistered person', async () => {
            const input: CreateFamilyRelationshipInput = {
                related_person_name: 'Jane Doe',
                related_person_dob: '1995-05-15',
                related_person_phone: '555-1234',
                related_person_email: 'jane@example.com',
                relationship_type: 'child',
            };

            const mockCreated: FamilyRelationship = {
                id: 2,
                user_id: 10,
                related_person_name: 'Jane Doe',
                related_person_dob: '1995-05-15',
                related_person_phone: '555-1234',
                related_person_email: 'jane@example.com',
                relationship_type: 'child',
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockCreated);

            const result = await repository.createMyFamilyRelationship(input);

            expect(appApi.post).toHaveBeenCalledWith('/profiles/me/family', input);
            expect(result).toEqual(mockCreated);
        });

        it('should throw error for validation errors (400)', async () => {
            const input: CreateFamilyRelationshipInput = {
                relationship_type: 'spouse',
                // Missing both related_user_id and related_person_name
            };

            const validationError = {
                response: {
                    status: 400,
                    data: {message: 'Either related_user_id or related_person_name is required'},
                },
            };

            mockUnwrap.mockRejectedValue(validationError);

            await expect(repository.createMyFamilyRelationship(input)).rejects.toEqual(validationError);
        });
    });

    describe('updateMyFamilyRelationship', () => {
        it('should update relationship successfully', async () => {
            const input: UpdateFamilyRelationshipInput = {
                related_person_phone: '555-9999',
            };

            const mockUpdated: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_person_name: 'John Doe',
                related_person_phone: '555-9999',
                relationship_type: 'child',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMyFamilyRelationship(1, input);

            expect(appApi.put).toHaveBeenCalledWith('/profiles/me/family/1', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });

        it('should throw error when relationship does not exist (404)', async () => {
            const input: UpdateFamilyRelationshipInput = {
                related_person_email: 'new@example.com',
            };

            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Relationship not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.updateMyFamilyRelationship(999, input)).rejects.toEqual(notFoundError);
        });

        it('should handle partial updates', async () => {
            const input: UpdateFamilyRelationshipInput = {
                relationship_type: 'sibling',
            };

            const mockUpdated: FamilyRelationship = {
                id: 1,
                user_id: 10,
                related_user_id: 20,
                relationship_type: 'sibling',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMyFamilyRelationship(1, input);

            expect(result).toEqual(mockUpdated);
        });
    });

    describe('deleteMyFamilyRelationship', () => {
        it('should delete relationship successfully', async () => {
            mockUnwrap.mockResolvedValue(undefined);

            await repository.deleteMyFamilyRelationship(1);

            expect(appApi.delete).toHaveBeenCalledWith('/profiles/me/family/1');
            expect(unwrap).toHaveBeenCalled();
        });

        it('should throw error when relationship does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Relationship not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.deleteMyFamilyRelationship(999)).rejects.toEqual(notFoundError);
        });

        it('should throw error for server errors', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {message: 'Internal server error'},
                },
            };

            mockUnwrap.mockRejectedValue(serverError);

            await expect(repository.deleteMyFamilyRelationship(1)).rejects.toEqual(serverError);
        });
    });
});
