/**
 * Milestones Repository Tests
 *
 * Test Coverage:
 * - listMyMilestones: success, empty array
 * - getMyMilestone: success, 404 (returns null), other errors
 * - createMyMilestone: success, 409 conflict (duplicate milestone_type), validation errors
 * - updateMyMilestone: success, 404 not found
 * - deleteMyMilestone: success, 404 not found
 */

import {HttpMilestonesRepository} from '../repository';
import {appApi, unwrap} from '@yuhuu/auth';
import type {SpiritualMilestone, CreateSpiritualMilestoneInput, UpdateSpiritualMilestoneInput} from '../types';

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

describe('HttpMilestonesRepository', () => {
    let repository: HttpMilestonesRepository;
    const mockUnwrap = unwrap as jest.MockedFunction<typeof unwrap>;

    beforeEach(() => {
        repository = new HttpMilestonesRepository();
        jest.clearAllMocks();
    });

    describe('listMyMilestones', () => {
        it('should return array of milestones', async () => {
            const mockMilestones: SpiritualMilestone[] = [
                {
                    id: 1,
                    user_id: 10,
                    milestone_type: 'conversion',
                    milestone_date: '2015-03-10',
                    location: 'Revival Meeting',
                    notes: 'Life-changing experience',
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
                {
                    id: 2,
                    user_id: 10,
                    milestone_type: 'baptism',
                    milestone_date: '2020-06-15',
                    location: 'First Baptist Church',
                    officiant: 'Pastor John Smith',
                    created_at: '2024-01-02T00:00:00',
                    updated_at: '2024-01-02T00:00:00',
                },
            ];

            mockUnwrap.mockResolvedValue(mockMilestones);

            const result = await repository.listMyMilestones();

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/milestones');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockMilestones);
        });

        it('should return empty array when no milestones', async () => {
            mockUnwrap.mockResolvedValue([]);

            const result = await repository.listMyMilestones();

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

            await expect(repository.listMyMilestones()).rejects.toEqual(serverError);
        });
    });

    describe('getMyMilestone', () => {
        it('should return milestone when it exists', async () => {
            const mockMilestone: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                milestone_type: 'conversion',
                milestone_date: '2015-03-10',
                location: 'Revival Meeting',
                notes: 'Life-changing',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockMilestone);

            const result = await repository.getMyMilestone(1);

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/milestones/1');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockMilestone);
        });

        it('should return null when milestone does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Milestone not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            const result = await repository.getMyMilestone(999);

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

            await expect(repository.getMyMilestone(1)).rejects.toEqual(serverError);
        });
    });

    describe('createMyMilestone', () => {
        it('should create milestone successfully', async () => {
            const input: CreateSpiritualMilestoneInput = {
                milestone_type: 'baptism',
                milestone_date: '2020-06-15',
                location: 'First Baptist Church',
                officiant: 'Pastor John Smith',
                notes: 'Special ceremony',
            };

            const mockCreated: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockCreated);

            const result = await repository.createMyMilestone(input);

            expect(appApi.post).toHaveBeenCalledWith('/profiles/me/milestones', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });

        it('should throw error when milestone type already exists (409)', async () => {
            const input: CreateSpiritualMilestoneInput = {
                milestone_type: 'baptism',
                milestone_date: '2021-01-01',
            };

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Duplicate milestone type "baptism"'},
                },
            };

            mockUnwrap.mockRejectedValue(conflictError);

            await expect(repository.createMyMilestone(input)).rejects.toEqual(conflictError);
        });

        it('should throw error for validation errors (400)', async () => {
            const input = {
                milestone_date: '2020-06-15',
            } as CreateSpiritualMilestoneInput;

            const validationError = {
                response: {
                    status: 400,
                    data: {message: 'milestone_type is required'},
                },
            };

            mockUnwrap.mockRejectedValue(validationError);

            await expect(repository.createMyMilestone(input)).rejects.toEqual(validationError);
        });
    });

    describe('updateMyMilestone', () => {
        it('should update milestone successfully', async () => {
            const input: UpdateSpiritualMilestoneInput = {
                milestone_date: '2020-06-20',
                notes: 'Updated notes',
            };

            const mockUpdated: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                milestone_type: 'baptism',
                milestone_date: '2020-06-20',
                location: 'First Baptist Church',
                notes: 'Updated notes',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMyMilestone(1, input);

            expect(appApi.put).toHaveBeenCalledWith('/profiles/me/milestones/1', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });

        it('should throw error when milestone does not exist (404)', async () => {
            const input: UpdateSpiritualMilestoneInput = {
                notes: 'New notes',
            };

            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Milestone not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.updateMyMilestone(999, input)).rejects.toEqual(notFoundError);
        });

        it('should handle partial updates', async () => {
            const input: UpdateSpiritualMilestoneInput = {
                location: 'New Location',
            };

            const mockUpdated: SpiritualMilestone = {
                id: 1,
                user_id: 10,
                milestone_type: 'confirmation',
                milestone_date: '2018-05-10',
                location: 'New Location',
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMyMilestone(1, input);

            expect(result).toEqual(mockUpdated);
        });
    });

    describe('deleteMyMilestone', () => {
        it('should delete milestone successfully', async () => {
            mockUnwrap.mockResolvedValue(undefined);

            await repository.deleteMyMilestone(1);

            expect(appApi.delete).toHaveBeenCalledWith('/profiles/me/milestones/1');
            expect(unwrap).toHaveBeenCalled();
        });

        it('should throw error when milestone does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Milestone not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.deleteMyMilestone(999)).rejects.toEqual(notFoundError);
        });

        it('should throw error for server errors', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {message: 'Internal server error'},
                },
            };

            mockUnwrap.mockRejectedValue(serverError);

            await expect(repository.deleteMyMilestone(1)).rejects.toEqual(serverError);
        });
    });
});
