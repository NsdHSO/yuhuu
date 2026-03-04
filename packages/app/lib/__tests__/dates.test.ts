/**
 * Date Utilities Tests
 */

import {formatDateForDisplay, formatDateToBackend, isValidDateFormat, parseDateFromBackend,} from '../dates';

describe('Date Utilities', () => {
    describe('isValidDateFormat', () => {
        it('should return true for valid YYYY-MM-DD format', () => {
            expect(isValidDateFormat('2024-01-15')).toBe(true);
            expect(isValidDateFormat('2024-12-31')).toBe(true);
            expect(isValidDateFormat('1990-05-20')).toBe(true);
        });

        it('should return false for invalid formats', () => {
            expect(isValidDateFormat('2024-1-15')).toBe(false); // Single digit month
            expect(isValidDateFormat('2024-01-5')).toBe(false); // Single digit day
            expect(isValidDateFormat('24-01-15')).toBe(false); // 2-digit year
            expect(isValidDateFormat('01/15/2024')).toBe(false); // Slashes
            expect(isValidDateFormat('not a date')).toBe(false);
            expect(isValidDateFormat('')).toBe(false);
        });
    });

    describe('formatDateToBackend', () => {
        it('should format Date to YYYY-MM-DD', () => {
            const date = new Date('2024-01-15T12:00:00Z');
            const result = formatDateToBackend(date);
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('should pad single-digit months and days', () => {
            const date = new Date('2024-01-05T00:00:00Z');
            const result = formatDateToBackend(date);
            expect(result).toMatch(/^\d{4}-01-\d{2}$/);
        });

        it('should handle different dates correctly', () => {
            const date1 = new Date('2024-12-31T00:00:00Z');
            const date2 = new Date('1990-05-01T00:00:00Z');

            const result1 = formatDateToBackend(date1);
            const result2 = formatDateToBackend(date2);

            expect(result1).toMatch(/^\d{4}-12-\d{2}$/);
            expect(result2).toMatch(/^1990-05-\d{2}$/);
        });
    });

    describe('parseDateFromBackend', () => {
        it('should parse YYYY-MM-DD string to Date', () => {
            const result = parseDateFromBackend('2024-01-15');
            expect(result).toBeInstanceOf(Date);
            expect(result.getFullYear()).toBe(2024);
        });

        it('should handle different valid dates', () => {
            const result1 = parseDateFromBackend('2024-12-31');
            const result2 = parseDateFromBackend('1990-05-20');

            expect(result1.getFullYear()).toBe(2024);
            expect(result2.getFullYear()).toBe(1990);
        });
    });

    describe('formatDateForDisplay', () => {
        it('should format date for display in default locale (en-US)', () => {
            const result = formatDateForDisplay('2024-01-15');
            expect(result).toContain('January');
            expect(result).toContain('15');
            expect(result).toContain('2024');
        });

        it('should format date for display in custom locale', () => {
            const result = formatDateForDisplay('2024-01-15', 'es-ES');
            // Spanish format varies by implementation, just verify it's a string
            expect(typeof result).toBe('string');
            expect(result).toContain('2024');
        });

        it('should handle different dates', () => {
            const result1 = formatDateForDisplay('2024-12-31');
            const result2 = formatDateForDisplay('1990-05-20');

            expect(result1).toContain('December');
            expect(result1).toContain('31');
            expect(result1).toContain('2024');

            expect(result2).toContain('May');
            expect(result2).toContain('20');
            expect(result2).toContain('1990');
        });
    });
});
