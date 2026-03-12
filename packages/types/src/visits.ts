/**
 * SOLID Principles:
 * - Single Responsibility: Each type represents one specific domain concept
 * - Open/Closed: Types are open for extension (new fields) without breaking existing code
 * - Interface Segregation: Input types separated from full models
 */

// Domain Types (App layer)

/**
 * Visit status enum
 * Represents the lifecycle of a family visit
 */
export type VisitStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

/**
 * Geographic coordinates
 * Single Responsibility: Represents a location point
 */
export type GeoCoordinates = {
  latitude: number;
  longitude: number;
};

/**
 * Visitable family record
 * Represents a family that can be visited by church members
 */
export type VisitableFamily = {
  id: number;
  family_name: string;
  address_street: string;
  address_city: string;
  address_postal: string;
  latitude: number;
  longitude: number;
  phone?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Visit assignment record
 * Represents a visit assigned to a church member
 */
export type VisitAssignment = {
  id: number;
  family_id: number;
  assigned_to_user_id: number;
  scheduled_date: string; // ISO 8601 date string
  status: VisitStatus;
  arrived_at?: string | null; // ISO 8601 datetime string
  completed_at?: string | null; // ISO 8601 datetime string
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
};

/**
 * Visit timer state
 * Single Responsibility: Tracks timer state for a visit
 * Used for AsyncStorage persistence
 */
export type VisitTimerState = {
  visitId: number;
  startedAt: string; // ISO 8601 datetime string
  duration: number; // milliseconds
};

// Input Types (Interface Segregation Principle)

/**
 * Input type for creating a visitable family
 */
export type CreateVisitableFamilyInput = {
  family_name: string;
  address_street: string;
  address_city: string;
  address_postal: string;
  latitude: number;
  longitude: number;
  phone?: string;
  notes?: string;
};

/**
 * Input type for updating a visitable family
 */
export type UpdateVisitableFamilyInput = {
  family_name?: string;
  address_street?: string;
  address_city?: string;
  address_postal?: string;
  latitude?: number;
  longitude?: number;
  phone?: string;
  notes?: string;
};

/**
 * Input type for creating a visit assignment
 */
export type CreateVisitAssignmentInput = {
  family_id: number;
  assigned_to_user_id: number;
  scheduled_date: string; // ISO 8601 date string
  notes?: string;
};

/**
 * Input type for updating a visit assignment
 */
export type UpdateVisitAssignmentInput = {
  scheduled_date?: string;
  status?: VisitStatus;
  notes?: string;
};
