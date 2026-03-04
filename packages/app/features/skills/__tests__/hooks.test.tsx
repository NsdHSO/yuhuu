/**
 * Skills Hooks Tests - Concise version
 */

import {renderHook, waitFor} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import React from 'react';
import {
    useCreateMySkillMutation,
    useDeleteMySkillMutation,
    useMySkillQuery,
    useMySkillsQuery,
    useUpdateMySkillMutation,
} from '../hooks';
import type {SkillsRepository} from '../repository';
import type {CreateUserSkillInput, UserSkill} from '../types';

describe('Skills Hooks', () => {
    let queryClient: QueryClient;
    let wrapper: React.FC<{ children: React.ReactNode }>;

    const mockRepo: SkillsRepository = {
        listMySkills: jest.fn(),
        getMySkill: jest.fn(),
        createMySkill: jest.fn(),
        updateMySkill: jest.fn(),
        deleteMySkill: jest.fn(),
    };

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
        });
        wrapper = ({children}) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
        jest.clearAllMocks();
    });

    afterEach(() => queryClient.clear());

    it('should fetch skills list', async () => {
        const mockSkills: UserSkill[] = [{
            id: 1,
            user_id: 10,
            skill_name: 'Piano',
            is_willing_to_serve: true,
            created_at: '2024-01-01T00:00:00',
            updated_at: '2024-01-01T00:00:00',
        }];

        (mockRepo.listMySkills as jest.Mock).mockResolvedValue(mockSkills);

        const {result} = renderHook(() => useMySkillsQuery(mockRepo), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockSkills);
    });

    it('should fetch specific skill', async () => {
        const mockSkill: UserSkill = {
            id: 1,
            user_id: 10,
            skill_name: 'Guitar',
            is_willing_to_serve: true,
            created_at: '2024-01-01T00:00:00',
            updated_at: '2024-01-01T00:00:00',
        };

        (mockRepo.getMySkill as jest.Mock).mockResolvedValue(mockSkill);

        const {result} = renderHook(() => useMySkillQuery(1, mockRepo), {wrapper});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(result.current.data).toEqual(mockSkill);
    });

    it('should create skill and invalidate queries', async () => {
        const input: CreateUserSkillInput = {skill_name: 'Drums'};
        const mockCreated: UserSkill = {
            id: 1,
            user_id: 10,
            ...input,
            is_willing_to_serve: true,
            created_at: '2024-02-01T00:00:00',
            updated_at: '2024-02-01T00:00:00',
        };

        (mockRepo.createMySkill as jest.Mock).mockResolvedValue(mockCreated);

        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
        const {result} = renderHook(() => useCreateMySkillMutation(mockRepo), {wrapper});

        result.current.mutate(input);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'skills']});
    });

    it('should handle 409 conflict error', async () => {
        const input: CreateUserSkillInput = {skill_name: 'Piano'};
        const error = {response: {status: 409, data: {message: 'Duplicate skill'}}};

        (mockRepo.createMySkill as jest.Mock).mockRejectedValue(error);

        const {result} = renderHook(() => useCreateMySkillMutation(mockRepo), {wrapper});

        result.current.mutate(input);

        await waitFor(() => expect(result.current.isError).toBe(true));
        expect(result.current.error).toEqual(error);
    });

    it('should update skill and invalidate queries', async () => {
        const mockUpdated: UserSkill = {
            id: 1,
            user_id: 10,
            skill_name: 'Piano',
            proficiency_level: 'expert',
            is_willing_to_serve: true,
            created_at: '2024-01-01T00:00:00',
            updated_at: '2024-03-01T00:00:00',
        };

        (mockRepo.updateMySkill as jest.Mock).mockResolvedValue(mockUpdated);

        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
        const {result} = renderHook(() => useUpdateMySkillMutation(mockRepo), {wrapper});

        result.current.mutate({id: 1, data: {proficiency_level: 'expert'}});

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(invalidateSpy).toHaveBeenCalledWith({queryKey: ['me', 'skills', 1]});
    });

    it('should delete skill and invalidate queries', async () => {
        (mockRepo.deleteMySkill as jest.Mock).mockResolvedValue(undefined);

        const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');
        const {result} = renderHook(() => useDeleteMySkillMutation(mockRepo), {wrapper});

        result.current.mutate(1);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));
        expect(mockRepo.deleteMySkill).toHaveBeenCalledWith(1);
    });
});
