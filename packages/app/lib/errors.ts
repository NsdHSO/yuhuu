/**
 * Error Handling Utilities
 *
 * Provides type guards and helper functions for handling common HTTP errors.
 */

export type ConflictError = { status: 409; message: string };
export type NotFoundError = { status: 404; message: string };
export type ValidationError = { status: 400; message: string; errors?: Record<string, string[]> };

/**
 * Type guard to check if an error is a 409 Conflict error.
 *
 * @param error - The error to check
 * @returns True if the error is a 409 Conflict error
 */
export function isConflictError(error: any): error is ConflictError {
    return error?.response?.status === 409;
}

/**
 * Type guard to check if an error is a 404 Not Found error.
 *
 * @param error - The error to check
 * @returns True if the error is a 404 Not Found error
 */
export function isNotFoundError(error: any): error is NotFoundError {
    return error?.response?.status === 404;
}

/**
 * Type guard to check if an error is a 400 Validation error.
 *
 * @param error - The error to check
 * @returns True if the error is a 400 Validation error
 */
export function isValidationError(error: any): error is ValidationError {
    return error?.response?.status === 400;
}

/**
 * Extract a human-readable error message from an error object.
 *
 * @param error - The error to extract the message from
 * @param fallback - The fallback message to use if no message is found
 * @returns The error message
 */
export function getErrorMessage(error: any, fallback: string = 'An error occurred'): string {
    return error?.response?.data?.message || error?.message || fallback;
}
