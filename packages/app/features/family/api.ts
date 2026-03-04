/**
 * Family Relationships Feature - Public API
 *
 * SOLID Principles:
 * - Liskov Substitution: Barrel exports provide consistent interface
 * - Open/Closed: New exports can be added without breaking existing imports
 *
 * Barrel exports make it easy to import from the feature:
 * import { useMyFamilyQuery, FamilyRepository, FamilyRelationship } from '@/features/family/api';
 */

// Types
export type {
    RelationshipType,
    FamilyRelationship,
    CreateFamilyRelationshipInput,
    UpdateFamilyRelationshipInput,
} from './types';

// Repository
export type {FamilyRepository} from './repository';
export {HttpFamilyRepository, defaultFamilyRepository} from './repository';

// Hooks
export {
    useMyFamilyQuery,
    useMyFamilyRelationshipQuery,
    useCreateMyFamilyRelationshipMutation,
    useUpdateMyFamilyRelationshipMutation,
    useDeleteMyFamilyRelationshipMutation,
} from './hooks';
