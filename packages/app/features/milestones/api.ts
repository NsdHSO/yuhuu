/**
 * Spiritual Milestones Feature - Public API
 *
 * Barrel exports for easy importing.
 */

// Types
export type {
    MilestoneType,
    SpiritualMilestone,
    CreateSpiritualMilestoneInput,
    UpdateSpiritualMilestoneInput,
} from './types';

// Repository
export type {MilestonesRepository} from './repository';
export {HttpMilestonesRepository, defaultMilestonesRepository} from './repository';

// Hooks
export {
    useMyMilestonesQuery,
    useUserMilestonesQuery,
    useMyMilestoneQuery,
    useCreateMyMilestoneMutation,
    useUpdateMyMilestoneMutation,
    useDeleteMyMilestoneMutation,
    useCreateUserMilestoneMutation,
    useUpdateUserMilestoneMutation,
    useDeleteUserMilestoneMutation,
} from './hooks';
