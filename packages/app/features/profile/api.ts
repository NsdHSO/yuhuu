/**
 * Profile Feature - Public API
 *
 * SOLID Principles:
 * - Liskov Substitution: Barrel exports provide consistent interface
 * - Open/Closed: New exports can be added without breaking existing imports
 *
 * Barrel exports make it easy to import from the feature:
 * import { useMyProfileQuery, ProfileRepository, ProfileResponse } from '@/features/profile';
 */

// Types
export type {
    UserResponse,
    EducationLevel,
    ProfileResponse,
    ProfileInput,
} from './types';

// Repository
export type {ProfileRepository} from './repository';
export {HttpProfileRepository, defaultProfileRepository} from './repository';

// Hooks
export {useMyProfileQuery, useSaveMyProfileMutation} from './hooks';
