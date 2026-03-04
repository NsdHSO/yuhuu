/**
 * Error Utilities Tests
 */

import {isConflictError, isNotFoundError, isValidationError, getErrorMessage} from '../errors';

describe('Error Utilities', () => {
    describe('isConflictError', () => {
        it('should return true for 409 errors', () => {
            const error = {response: {status: 409, data: {message: 'Conflict'}}};
            expect(isConflictError(error)).toBe(true);
        });

        it('should return false for non-409 errors', () => {
            const error = {response: {status: 404, data: {message: 'Not found'}}};
            expect(isConflictError(error)).toBe(false);
        });

        it('should return false for errors without response', () => {
            const error = new Error('Network error');
            expect(isConflictError(error)).toBe(false);
        });

        it('should return false for null/undefined', () => {
            expect(isConflictError(null)).toBe(false);
            expect(isConflictError(undefined)).toBe(false);
        });
    });

    describe('isNotFoundError', () => {
        it('should return true for 404 errors', () => {
            const error = {response: {status: 404, data: {message: 'Not found'}}};
            expect(isNotFoundError(error)).toBe(true);
        });

        it('should return false for non-404 errors', () => {
            const error = {response: {status: 500, data: {message: 'Server error'}}};
            expect(isNotFoundError(error)).toBe(false);
        });

        it('should return false for errors without response', () => {
            const error = new Error('Network error');
            expect(isNotFoundError(error)).toBe(false);
        });
    });

    describe('isValidationError', () => {
        it('should return true for 400 errors', () => {
            const error = {response: {status: 400, data: {message: 'Validation failed'}}};
            expect(isValidationError(error)).toBe(true);
        });

        it('should return false for non-400 errors', () => {
            const error = {response: {status: 401, data: {message: 'Unauthorized'}}};
            expect(isValidationError(error)).toBe(false);
        });

        it('should return false for errors without response', () => {
            const error = new Error('Network error');
            expect(isValidationError(error)).toBe(false);
        });
    });

    describe('getErrorMessage', () => {
        it('should extract message from response.data.message', () => {
            const error = {response: {data: {message: 'Custom error'}}};
            expect(getErrorMessage(error)).toBe('Custom error');
        });

        it('should extract message from error.message', () => {
            const error = new Error('Network error');
            expect(getErrorMessage(error)).toBe('Network error');
        });

        it('should return fallback for errors without message', () => {
            const error = {response: {status: 500}};
            expect(getErrorMessage(error)).toBe('An error occurred');
        });

        it('should use custom fallback', () => {
            const error = {};
            expect(getErrorMessage(error, 'Custom fallback')).toBe('Custom fallback');
        });

        it('should handle null/undefined', () => {
            expect(getErrorMessage(null)).toBe('An error occurred');
            expect(getErrorMessage(undefined)).toBe('An error occurred');
        });

        it('should prefer response.data.message over error.message', () => {
            const error = {
                message: 'Generic error',
                response: {data: {message: 'Specific error'}},
            };
            expect(getErrorMessage(error)).toBe('Specific error');
        });
    });
});
