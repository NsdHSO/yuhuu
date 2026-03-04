/**
 * Spiritual Milestones Feature - Domain Types
 *
 * SOLID Principles:
 * - Single Responsibility: This file contains only domain models and DTOs for spiritual milestones
 * - Open/Closed: Types can be extended without modification
 */

/**
 * Valid milestone types representing key events in a spiritual journey.
 *
 * Business Rule: Each user can only have ONE milestone per type.
 */
export type MilestoneType =
    | "conversion"
    | "baptism"
    | "water_baptism"
    | "spirit_baptism"
    | "confirmation"
    | "dedication"
    | "ordination";

/**
 * Spiritual milestone record.
 */
export type SpiritualMilestone = {
    id: number;
    user_id: number;
    /** Type of spiritual milestone */
    milestone_type: MilestoneType;
    /** Date the milestone occurred (YYYY-MM-DD) */
    milestone_date?: string;
    /** Location where the milestone occurred */
    location?: string;
    /** Person who officiated the milestone */
    officiant?: string;
    /** Additional notes about the milestone */
    notes?: string;
    created_at: string;
    updated_at: string;
};

/**
 * Input for creating a new spiritual milestone.
 *
 * Business Rule: milestone_type must be unique per user (409 Conflict if duplicate).
 */
export type CreateSpiritualMilestoneInput = {
    milestone_type: MilestoneType;
    milestone_date?: string;
    location?: string;
    officiant?: string;
    notes?: string;
};

/**
 * Input for updating an existing spiritual milestone.
 * milestone_type cannot be changed (omitted from update).
 * All other fields are optional for partial updates.
 */
export type UpdateSpiritualMilestoneInput = Partial<
    Omit<CreateSpiritualMilestoneInput, 'milestone_type'>
>;
