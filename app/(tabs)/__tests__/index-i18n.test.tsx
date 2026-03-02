import React from 'react';
import { render } from '@testing-library/react-native';
import HomeScreen from '../index';

/**
 * TDD tests for Home Screen i18n Migration
 *
 * Verifies that all hardcoded strings in index.tsx (Home screen) are replaced
 * with translation keys via useTranslation().
 *
 * Translation keys expected (from locales/en.json -> home.*):
 * home.welcome       -> "Welcome!"
 * home.welcomeMessage -> "Welcome to our Pentecostal church community"
 * home.encouragement -> "We're glad you're here..."
 * home.signOut       -> "Sign out"
 */

// --- Mock react-i18next ---
const mockT = jest.fn((key: string) => key);
const mockUseTranslation = jest.fn(() => ({
    t: mockT,
    i18n: { language: 'en', changeLanguage: jest.fn() },
}));

jest.mock('react-i18next', () => ({
    useTranslation: (...args: any[]) => mockUseTranslation(...args),
}));

// --- Mock useAuth ---
const mockSignOut = jest.fn();
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => ({
        user: { id: '1', email: 'john@example.com', name: 'John' },
        status: 'signed-in',
        signOut: mockSignOut,
    }),
}));

// --- Mock hasRole (prevent redirect) ---
jest.mock('@/lib/authz', () => ({
    hasRole: jest.fn(() => false),
}));

describe('HomeScreen - i18n Migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useTranslation hook integration', () => {
        it('should call useTranslation to get translation function', () => {
            render(<HomeScreen />);

            expect(mockUseTranslation).toHaveBeenCalled();
        });
    });

    describe('Welcome strings', () => {
        it('should use t() for welcome greeting with user name interpolation', () => {
            render(<HomeScreen />);

            // The welcome text should use translation with user name
            expect(mockT).toHaveBeenCalledWith('home.welcome', expect.objectContaining({
                name: expect.any(String),
            }));
        });

        it('should use t("home.welcomeMessage") for subtitle', () => {
            render(<HomeScreen />);

            expect(mockT).toHaveBeenCalledWith('home.welcomeMessage');
        });

        it('should use t("home.encouragement") for the body text', () => {
            render(<HomeScreen />);

            expect(mockT).toHaveBeenCalledWith('home.encouragement');
        });
    });

    describe('Sign out button', () => {
        it('should use t("home.signOut") for sign out button text', () => {
            render(<HomeScreen />);

            expect(mockT).toHaveBeenCalledWith('home.signOut');
        });
    });

    describe('No hardcoded user-facing strings remain', () => {
        it('should not contain any of the original hardcoded English strings', () => {
            // Make mockT return prefixed keys so we can detect hardcoded text
            mockT.mockImplementation((key: string) => `__${key}__`);

            const { queryByText } = render(<HomeScreen />);

            const hardcodedStrings = [
                'Welcome to our Pentecostal church community',
                "We're glad you're here",
                'Sign out',
            ];

            for (const str of hardcodedStrings) {
                expect(queryByText(str)).toBeNull();
            }
        });
    });
});
