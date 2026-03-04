/**
 * Membership Repository Tests
 *
 * Test Coverage:
 * - listMyMembershipHistory: success, empty array
 * - getMyMembershipHistory: success, 404 (returns null), other errors
 * - createMyMembershipHistory: success, 409 conflict (multiple active memberships), validation errors
 * - updateMyMembershipHistory: success, 404 not found
 * - deleteMyMembershipHistory: success, 404 not found
 */

import {HttpMembershipRepository} from '../repository';
import {appApi, unwrap} from '@yuhuu/auth';
import type {CreateMembershipHistoryInput, MembershipHistory, UpdateMembershipHistoryInput} from '../types';

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

describe('HttpMembershipRepository', () => {
    let repository: HttpMembershipRepository;
    const mockUnwrap = unwrap as jest.MockedFunction<typeof unwrap>;

    beforeEach(() => {
        repository = new HttpMembershipRepository();
        jest.clearAllMocks();
    });

    describe('listMyMembershipHistory', () => {
        it('should return array of membership history records', async () => {
            const mockHistory: MembershipHistory[] = [
                {
                    id: 1,
                    user_id: 10,
                    church_name: 'First Baptist Church',
                    start_date: '2020-01-15',
                    end_date: null,
                    transfer_type: 'transfer_in',
                    transfer_letter_received: true,
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
                {
                    id: 2,
                    user_id: 10,
                    church_name: 'Second Baptist Church',
                    start_date: '2015-05-01',
                    end_date: '2020-01-10',
                    transfer_type: 'transfer_out',
                    created_at: '2024-01-02T00:00:00',
                    updated_at: '2024-01-02T00:00:00',
                },
            ];

            mockUnwrap.mockResolvedValue(mockHistory);

            const result = await repository.listMyMembershipHistory();

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/membership-history');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockHistory);
        });

        it('should return empty array when no membership history', async () => {
            mockUnwrap.mockResolvedValue([]);

            const result = await repository.listMyMembershipHistory();

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

            await expect(repository.listMyMembershipHistory()).rejects.toEqual(serverError);
        });
    });

    describe('getMyMembershipHistory', () => {
        it('should return membership history when it exists', async () => {
            const mockRecord: MembershipHistory = {
                id: 1,
                user_id: 10,
                church_name: 'First Baptist Church',
                start_date: '2020-01-15',
                end_date: null,
                transfer_type: 'new_member',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockRecord);

            const result = await repository.getMyMembershipHistory(1);

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/membership-history/1');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockRecord);
        });

        it('should return null when record does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Membership history not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            const result = await repository.getMyMembershipHistory(999);

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

            await expect(repository.getMyMembershipHistory(1)).rejects.toEqual(serverError);
        });
    });

    describe('createMyMembershipHistory', () => {
        it('should create membership history successfully', async () => {
            const input: CreateMembershipHistoryInput = {
                church_name: 'First Baptist Church',
                start_date: '2020-01-15',
                end_date: null,
                transfer_type: 'new_member',
                transfer_letter_received: false,
                notes: 'New member',
            };

            const mockCreated: MembershipHistory = {
                id: 1,
                user_id: 10,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockCreated);

            const result = await repository.createMyMembershipHistory(input);

            expect(appApi.post).toHaveBeenCalledWith('/profiles/me/membership-history', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });

        it('should throw error when active membership already exists (409)', async () => {
            const input: CreateMembershipHistoryInput = {
                church_name: 'Second Church',
                start_date: '2024-01-01',
                end_date: null, // Attempting to create another active membership
            };

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Active membership already exists'},
                },
            };

            mockUnwrap.mockRejectedValue(conflictError);

            await expect(repository.createMyMembershipHistory(input)).rejects.toEqual(conflictError);
        });

        it('should throw error for validation errors (400)', async () => {
            const input = {
                start_date: '2020-01-15',
            } as CreateMembershipHistoryInput;

            const validationError = {
                response: {
                    status: 400,
                    data: {message: 'church_name is required'},
                },
            };

            mockUnwrap.mockRejectedValue(validationError);

            await expect(repository.createMyMembershipHistory(input)).rejects.toEqual(validationError);
        });
    });

    describe('updateMyMembershipHistory', () => {
        it('should update membership history successfully', async () => {
            const input: UpdateMembershipHistoryInput = {
                end_date: '2024-03-01',
                notes: 'Transferred out',
            };

            const mockUpdated: MembershipHistory = {
                id: 1,
                user_id: 10,
                church_name: 'First Baptist Church',
                start_date: '2020-01-15',
                end_date: '2024-03-01',
                notes: 'Transferred out',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMyMembershipHistory(1, input);

            expect(appApi.put).toHaveBeenCalledWith('/profiles/me/membership-history/1', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });

        it('should throw error when record does not exist (404)', async () => {
            const input: UpdateMembershipHistoryInput = {
                notes: 'Updated notes',
            };

            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Membership history not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.updateMyMembershipHistory(999, input)).rejects.toEqual(notFoundError);
        });

        it('should handle partial updates', async () => {
            const input: UpdateMembershipHistoryInput = {
                previous_role: 'Deacon',
            };

            const mockUpdated: MembershipHistory = {
                id: 1,
                user_id: 10,
                church_name: 'First Baptist Church',
                start_date: '2020-01-15',
                previous_role: 'Deacon',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMyMembershipHistory(1, input);

            expect(result).toEqual(mockUpdated);
        });
    });

    describe('deleteMyMembershipHistory', () => {
        it('should delete membership history successfully', async () => {
            mockUnwrap.mockResolvedValue(undefined);

            await repository.deleteMyMembershipHistory(1);

            expect(appApi.delete).toHaveBeenCalledWith('/profiles/me/membership-history/1');
            expect(unwrap).toHaveBeenCalled();
        });

        it('should throw error when record does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Membership history not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.deleteMyMembershipHistory(999)).rejects.toEqual(notFoundError);
        });

        it('should throw error for server errors', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {message: 'Internal server error'},
                },
            };

            mockUnwrap.mockRejectedValue(serverError);

            await expect(repository.deleteMyMembershipHistory(1)).rejects.toEqual(serverError);
        });
    });
});
