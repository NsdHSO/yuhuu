/**
 * Shared i18n mock factory for consistent test mocking of react-i18next.
 *
 * Usage:
 *   import {createMockT, mockUseTranslation} from '../../__test-utils__/i18n-mock';
 *
 *   const mockT = createMockT('key');
 *   jest.mock('react-i18next', () => mockUseTranslation(mockT));
 *
 * Supports three mock strategies:
 * - 'key': Returns raw translation keys (for TDD key verification tests)
 * - 'decorated': Returns `__key__` format with count support (for detecting hardcoded strings)
 * - createMockTWithTranslations(): Returns values from a provided translation map
 */

type MockTStrategy = 'key' | 'decorated';

/**
 * Creates a mock `t()` function with a consistent strategy.
 *
 * @param strategy - 'key' returns raw keys, 'decorated' returns `__key__` format
 * @returns jest.Mock implementing the chosen strategy with interpolation support
 */
export function createMockT(strategy: MockTStrategy = 'key'): jest.Mock {
    if (strategy === 'decorated') {
        return jest.fn((key: string, opts?: Record<string, unknown>) => {
            if (opts && opts.count !== undefined) return `__${key}__${opts.count}`;
            return `__${key}__`;
        });
    }

    // Default: 'key' strategy - return raw keys
    return jest.fn((key: string) => key);
}

/**
 * Creates a mock `t()` function backed by a translation map.
 *
 * @param translations - Map of translation key to rendered string or function
 * @param fallback - What to return for keys not in the map (default: the key itself)
 * @returns jest.Mock that returns translated values
 */
export function createMockTWithTranslations(
    translations: Record<string, string | ((opts?: Record<string, unknown>) => string)>,
    fallback: 'key' | 'decorated' = 'key',
): jest.Mock {
    return jest.fn((key: string, opts?: Record<string, unknown>) => {
        const translation = translations[key];
        if (typeof translation === 'function') return translation(opts);
        if (typeof translation === 'string') return translation;
        return fallback === 'decorated' ? `__${key}__` : key;
    });
}

/**
 * Wraps a mockT function into a react-i18next compatible mock shape.
 *
 * Usage with jest.mock (must be at module scope due to hoisting):
 *   const mockT = createMockT('key');
 *   jest.mock('react-i18next', () => mockUseTranslation(mockT));
 *
 * @param mockT - The mock t() function created by createMockT or createMockTWithTranslations
 * @returns Object matching react-i18next's module shape with useTranslation hook
 */
export function mockUseTranslation(mockT: jest.Mock) {
    return {
        useTranslation: () => ({
            t: mockT,
            i18n: {language: 'en', changeLanguage: jest.fn()},
        }),
    };
}
