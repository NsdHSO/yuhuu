/**
 * Family Relationships Feature - Domain Types
 *
 * SOLID Principles:
 * - Single Responsibility: This file contains only domain models and DTOs for family relationships
 * - Open/Closed: Types can be extended without modification
 */

/**
 * Valid relationship types between family members.
 */
export type RelationshipType = "spouse" | "child" | "parent" | "sibling";

/**
 * Family relationship record.
 *
 * Note: Either related_user_id (for registered users) OR related_person_name (for unregistered) must be provided.
 */
export type FamilyRelationship = {
    id: number;
    user_id: number;
    /** ID of related user if they're registered in the system */
    related_user_id?: number;
    /** Name of related person if they're not registered */
    related_person_name?: string;
    /** Date of birth of related person (YYYY-MM-DD) */
    related_person_dob?: string;
    /** Phone number of related person */
    related_person_phone?: string;
    /** Email address of related person */
    related_person_email?: string;
    /** Type of relationship */
    relationship_type: RelationshipType;
    created_at: string;
    updated_at: string;
};

/**
 * Input for creating a new family relationship.
 */
export type CreateFamilyRelationshipInput = {
    /** Either related_user_id OR related_person_name must be provided */
    related_user_id?: number;
    related_person_name?: string;
    related_person_dob?: string;
    related_person_phone?: string;
    related_person_email?: string;
    relationship_type: RelationshipType;
};

/**
 * Input for updating an existing family relationship.
 * All fields are optional for partial updates.
 */
export type UpdateFamilyRelationshipInput = Partial<CreateFamilyRelationshipInput>;
