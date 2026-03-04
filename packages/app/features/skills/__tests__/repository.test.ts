/**
 * Skills Repository Tests
 *
 * Test Coverage:
 * - listMySkills: success, empty array
 * - getMySkill: success, 404 (returns null), other errors
 * - createMySkill: success, 409 conflict (duplicate skill_name), validation errors
 * - updateMySkill: success, 404 not found
 * - deleteMySkill: success, 404 not found
 */

import {HttpSkillsRepository} from '../repository';
import {appApi, unwrap} from '@yuhuu/auth';
import type {CreateUserSkillInput, UpdateUserSkillInput, UserSkill} from '../types';

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

describe('HttpSkillsRepository', () => {
    let repository: HttpSkillsRepository;
    const mockUnwrap = unwrap as jest.MockedFunction<typeof unwrap>;

    beforeEach(() => {
        repository = new HttpSkillsRepository();
        jest.clearAllMocks();
    });

    describe('listMySkills', () => {
        it('should return array of skills', async () => {
            const mockSkills: UserSkill[] = [
                {
                    id: 1,
                    user_id: 10,
                    skill_name: 'Piano',
                    skill_category: 'Music',
                    proficiency_level: 'advanced',
                    years_of_experience: 10,
                    is_willing_to_serve: true,
                    created_at: '2024-01-01T00:00:00',
                    updated_at: '2024-01-01T00:00:00',
                },
                {
                    id: 2,
                    user_id: 10,
                    skill_name: 'Python',
                    skill_category: 'Technology',
                    proficiency_level: 'expert',
                    is_willing_to_serve: true,
                    created_at: '2024-01-02T00:00:00',
                    updated_at: '2024-01-02T00:00:00',
                },
            ];

            mockUnwrap.mockResolvedValue(mockSkills);

            const result = await repository.listMySkills();

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/skills');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockSkills);
        });

        it('should return empty array when no skills', async () => {
            mockUnwrap.mockResolvedValue([]);

            const result = await repository.listMySkills();

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

            await expect(repository.listMySkills()).rejects.toEqual(serverError);
        });
    });

    describe('getMySkill', () => {
        it('should return skill when it exists', async () => {
            const mockSkill: UserSkill = {
                id: 1,
                user_id: 10,
                skill_name: 'Piano',
                skill_category: 'Music',
                proficiency_level: 'advanced',
                is_willing_to_serve: true,
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-01-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockSkill);

            const result = await repository.getMySkill(1);

            expect(appApi.get).toHaveBeenCalledWith('/profiles/me/skills/1');
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockSkill);
        });

        it('should return null when skill does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Skill not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            const result = await repository.getMySkill(999);

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

            await expect(repository.getMySkill(1)).rejects.toEqual(serverError);
        });
    });

    describe('createMySkill', () => {
        it('should create skill successfully', async () => {
            const input: CreateUserSkillInput = {
                skill_name: 'Guitar',
                skill_category: 'Music',
                proficiency_level: 'intermediate',
                years_of_experience: 5,
                is_willing_to_serve: true,
            };

            const mockCreated: UserSkill = {
                id: 1,
                user_id: 10,
                ...input,
                created_at: '2024-02-01T00:00:00',
                updated_at: '2024-02-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockCreated);

            const result = await repository.createMySkill(input);

            expect(appApi.post).toHaveBeenCalledWith('/profiles/me/skills', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockCreated);
        });

        it('should throw error when skill name already exists (409)', async () => {
            const input: CreateUserSkillInput = {
                skill_name: 'Piano',
            };

            const conflictError = {
                response: {
                    status: 409,
                    data: {message: 'Duplicate skill "Piano"'},
                },
            };

            mockUnwrap.mockRejectedValue(conflictError);

            await expect(repository.createMySkill(input)).rejects.toEqual(conflictError);
        });

        it('should throw error for validation errors (400)', async () => {
            const input = {} as CreateUserSkillInput;

            const validationError = {
                response: {
                    status: 400,
                    data: {message: 'skill_name is required'},
                },
            };

            mockUnwrap.mockRejectedValue(validationError);

            await expect(repository.createMySkill(input)).rejects.toEqual(validationError);
        });
    });

    describe('updateMySkill', () => {
        it('should update skill successfully', async () => {
            const input: UpdateUserSkillInput = {
                proficiency_level: 'expert',
                years_of_experience: 15,
            };

            const mockUpdated: UserSkill = {
                id: 1,
                user_id: 10,
                skill_name: 'Piano',
                skill_category: 'Music',
                proficiency_level: 'expert',
                years_of_experience: 15,
                is_willing_to_serve: true,
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMySkill(1, input);

            expect(appApi.put).toHaveBeenCalledWith('/profiles/me/skills/1', input);
            expect(unwrap).toHaveBeenCalled();
            expect(result).toEqual(mockUpdated);
        });

        it('should throw error when skill does not exist (404)', async () => {
            const input: UpdateUserSkillInput = {
                proficiency_level: 'advanced',
            };

            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Skill not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.updateMySkill(999, input)).rejects.toEqual(notFoundError);
        });

        it('should handle partial updates', async () => {
            const input: UpdateUserSkillInput = {
                is_willing_to_serve: false,
            };

            const mockUpdated: UserSkill = {
                id: 1,
                user_id: 10,
                skill_name: 'Teaching',
                is_willing_to_serve: false,
                created_at: '2024-01-01T00:00:00',
                updated_at: '2024-03-01T00:00:00',
            };

            mockUnwrap.mockResolvedValue(mockUpdated);

            const result = await repository.updateMySkill(1, input);

            expect(result).toEqual(mockUpdated);
        });
    });

    describe('deleteMySkill', () => {
        it('should delete skill successfully', async () => {
            mockUnwrap.mockResolvedValue(undefined);

            await repository.deleteMySkill(1);

            expect(appApi.delete).toHaveBeenCalledWith('/profiles/me/skills/1');
            expect(unwrap).toHaveBeenCalled();
        });

        it('should throw error when skill does not exist (404)', async () => {
            const notFoundError = {
                response: {
                    status: 404,
                    data: {message: 'Skill not found'},
                },
            };

            mockUnwrap.mockRejectedValue(notFoundError);

            await expect(repository.deleteMySkill(999)).rejects.toEqual(notFoundError);
        });

        it('should throw error for server errors', async () => {
            const serverError = {
                response: {
                    status: 500,
                    data: {message: 'Internal server error'},
                },
            };

            mockUnwrap.mockRejectedValue(serverError);

            await expect(repository.deleteMySkill(1)).rejects.toEqual(serverError);
        });
    });
});
