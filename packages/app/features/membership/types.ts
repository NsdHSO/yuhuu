/**
 * Membership History Feature - Domain Types
 *
 * SOLID Principles:
 * - Single Responsibility: This file contains only domain models and DTOs for membership history
 * - Open/Closed: Types can be extended without modification
 */

/**
 * Valid transfer types for membership changes.
 */
export type TransferType = "transfer_in" | "transfer_out" | "new_member" | "restored";

/**
 * Membership history record.
 *
 * Business Rule: Only ONE active membership allowed (end_date = null).
 */
export type MembershipHistory = {
    id: number;
    user_id: number;
    /** Name of the church */
    church_name: string;
    /** Date membership started (YYYY-MM-DD) */
    start_date?: string;
    /** Date membership ended (YYYY-MM-DD). null = active/current membership */
    end_date?: string | null;
    /** Type of transfer/membership change */
    transfer_type?: TransferType;
    /** Previous role at the church */
    previous_role?: string;
    /** Whether a transfer letter was received */
    transfer_letter_received?: boolean;
    /** Additional notes */
    notes?: string;
    created_at: string;
    updated_at: string;
};

/**
 * Input for creating a new membership history record.
 *
 * Business Rule: Only ONE active membership (end_date = null) allowed (409 Conflict if violated).
 */
export type CreateMembershipHistoryInput = {
    church_name: string;
    start_date?: string;
    end_date?: string | null;
    transfer_type?: TransferType;
    previous_role?: string;
    transfer_letter_received?: boolean;
    notes?: string;
};

/**
 * Input for updating an existing membership history record.
 * All fields are optional for partial updates.
 */
export type UpdateMembershipHistoryInput = Partial<CreateMembershipHistoryInput>;
