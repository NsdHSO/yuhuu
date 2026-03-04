/**
 * User Skills Feature - Domain Types
 *
 * SOLID Principles:
 * - Single Responsibility: This file contains only domain models and DTOs for user skills
 * - Open/Closed: Types can be extended without modification
 */

/**
 * Valid proficiency levels for skills.
 */
export type ProficiencyLevel = "beginner" | "intermediate" | "advanced" | "expert";

/**
 * Skill categories for ministry talents and capabilities.
 * Custom categories are allowed via string union.
 */
export type SkillCategory =
    | "Music"
    | "Technology"
    | "Teaching"
    | "Administration"
    | "Hospitality"
    | "Creative Arts"
    | string;

/**
 * User skill record.
 *
 * Business Rule: Each user can only have ONE skill per skill_name (409 Conflict if duplicate).
 */
export type UserSkill = {
    id: number;
    user_id: number;
    /** Name of the skill */
    skill_name: string;
    /** Category of the skill */
    skill_category?: SkillCategory;
    /** Proficiency level */
    proficiency_level?: ProficiencyLevel;
    /** Years of experience with this skill */
    years_of_experience?: number;
    /** Whether user is willing to serve using this skill */
    is_willing_to_serve: boolean;
    created_at: string;
    updated_at: string;
};

/**
 * Input for creating a new user skill.
 *
 * Business Rule: skill_name must be unique per user (409 Conflict if duplicate).
 */
export type CreateUserSkillInput = {
    skill_name: string;
    skill_category?: SkillCategory;
    proficiency_level?: ProficiencyLevel;
    years_of_experience?: number;
    is_willing_to_serve?: boolean;
};

/**
 * Input for updating an existing user skill.
 * All fields are optional for partial updates.
 */
export type UpdateUserSkillInput = Partial<CreateUserSkillInput>;
