/**
 * Date Utilities
 *
 * Provides helper functions for working with dates in YYYY-MM-DD format.
 */

/**
 * Validate that a string is in YYYY-MM-DD format.
 *
 * @param dateString - The date string to validate
 * @returns True if the date string is in YYYY-MM-DD format
 */
export function isValidDateFormat(dateString: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(dateString);
}

/**
 * Format a Date object to YYYY-MM-DD string for backend.
 *
 * @param date - The Date object to format
 * @returns Date string in YYYY-MM-DD format
 */
export function formatDateToBackend(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

/**
 * Parse a YYYY-MM-DD date string from backend to Date object.
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @returns Date object
 */
export function parseDateFromBackend(dateString: string): Date {
    return new Date(dateString);
}

/**
 * Format a YYYY-MM-DD date string for display to users.
 *
 * @param dateString - The date string in YYYY-MM-DD format
 * @param locale - The locale to use for formatting (defaults to 'en-US')
 * @returns Formatted date string for display
 */
export function formatDateForDisplay(dateString: string, locale: string = 'en-US'): string {
    const date = parseDateFromBackend(dateString);
    return new Intl.DateTimeFormat(locale, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}
