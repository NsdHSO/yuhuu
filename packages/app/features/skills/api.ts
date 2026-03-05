/**
 * User Skills Feature - Public API
 */

// Types
export type {
    ProficiencyLevel,
    SkillCategory,
    UserSkill,
    CreateUserSkillInput,
    UpdateUserSkillInput,
} from './types';

// Repository
export type {SkillsRepository} from './repository';
export {HttpSkillsRepository, defaultSkillsRepository} from './repository';

// Hooks
export {
    useMySkillsQuery,
    useUserSkillsQuery,
    useMySkillQuery,
    useCreateMySkillMutation,
    useUpdateMySkillMutation,
    useDeleteMySkillMutation,
    useCreateUserSkillMutation,
    useUpdateUserSkillMutation,
    useDeleteUserSkillMutation,
} from './hooks';
