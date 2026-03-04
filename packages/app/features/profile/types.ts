/**
 * Profile Feature - Domain Types
 *
 * SOLID Principles:
 * - Single Responsibility: This file contains only domain models and DTOs
 * - Open/Closed: Types can be extended without modification
 */

export type UserResponse = {
    id: number;
    auth_user_id: string;
    created_at: string;
    updated_at: string;
};

export type EducationLevel =
    | "Elementary"
    | "High School"
    | "Bachelor"
    | "Master"
    | "PhD"
    | "Other";

export type ProfileResponse = {
    id: number;
    user_id: number;
    middle_name?: string;
    phone?: string;
    phone_secondary?: string;
    date_of_birth?: string; // YYYY-MM-DD
    gender?: string;
    marital_status?: string;
    occupation?: string;
    nationality?: string;
    emergency_contact_name?: string;
    emergency_contact_phone?: string;
    emergency_contact_relationship?: string;
    profile_picture_url?: string;
    bio?: string;
    education_level?: EducationLevel;
    field_of_study?: string;
    languages_spoken?: string[]; // JSON array
    created_at: string;
    updated_at: string;
};

export type ProfileInput = Partial<
    Omit<ProfileResponse, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>;
