import React from 'react';
import {render} from '@testing-library/react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';

// Import HomeScreen after all mocks are set up
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

// --- Mock react-native-safe-area-context ---
jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: jest.fn(() => ({ top: 0, bottom: 0, left: 0, right: 0 })),
    SafeAreaView: ({ children, ...props }: any) => {
        const R = require('react');
        const { View } = require('react-native');
        return R.createElement(View, props, children);
    },
    SafeAreaProvider: ({ children, ...props }: any) => {
        const R = require('react');
        const { View } = require('react-native');
        return R.createElement(View, props, children);
    },
}));

// --- Mock expo-router ---
jest.mock('expo-router', () => ({
    Redirect: () => null,
    Stack: {
        Screen: () => null,
    },
}));

// --- Mock GlassBackground from @yuhuu/components ---
jest.mock('@yuhuu/components', () => {
    const actual = jest.requireActual('@yuhuu/components');
    const React = require('react');
    const { ScrollView } = require('react-native');
    return {
        ...actual,
        GlassBackground: ({children}: any) => React.createElement(React.Fragment, {}, children),
        TabScreenWrapper: ({children, testID}: any) => React.createElement(ScrollView, { testID: testID ? `${testID}-scroll` : undefined }, children),
    };
});

// --- Mock react-i18next ---
const mockT = jest.fn((key: string) => key);
const mockUseTranslation = jest.fn(() => ({
    t: mockT,
    i18n: {language: 'en', changeLanguage: jest.fn()},
}));

jest.mock('react-i18next', () => ({
    useTranslation: (...args: any[]) => mockUseTranslation(...args),
}));

// --- Mock useAuth ---
const mockSignOut = jest.fn();
jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => ({
        user: {id: '1', email: 'john@example.com', name: 'John'},
        status: 'signed-in',
        signOut: mockSignOut,
    }),
}));

// --- Mock hasRole (prevent redirect) ---
jest.mock('@yuhuu/auth', () => ({
    hasRole: jest.fn(() => false),
}));

// Helper to wrap component with SafeAreaProvider
function renderWithProvider(component: React.ReactElement) {
    return render(
        <SafeAreaProvider>
            {component}
        </SafeAreaProvider>
    );
}

describe('HomeScreen - i18n Migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Re-initialize mock return values after clearing
        mockUseTranslation.mockReturnValue({
            t: mockT,
            i18n: {language: 'en', changeLanguage: jest.fn()},
        });
        mockT.mockImplementation((key: string) => key);
    });

    describe('useTranslation hook integration', () => {
        it('should call useTranslation to get translation function', () => {
            renderWithProvider(<HomeScreen/>);

            expect(mockUseTranslation).toHaveBeenCalled();
        });
    });

    describe('Welcome strings', () => {
        it('should use t() for welcome greeting with user name interpolation', () => {
            renderWithProvider(<HomeScreen/>);

            // The welcome text should use translation with user name
            expect(mockT).toHaveBeenCalledWith('home.welcome', expect.objectContaining({
                name: expect.any(String),
            }));
        });

        it('should use t("home.welcomeMessage") for subtitle', () => {
            renderWithProvider(<HomeScreen/>);

            expect(mockT).toHaveBeenCalledWith('home.welcomeMessage');
        });

        it('should use t("home.encouragement") for the body text', () => {
            renderWithProvider(<HomeScreen/>);

            expect(mockT).toHaveBeenCalledWith('home.encouragement');
        });
    });

    describe('Sign out button', () => {
        it('should use t("home.signOut") for sign out button text', () => {
            renderWithProvider(<HomeScreen/>);

            expect(mockT).toHaveBeenCalledWith('home.signOut');
        });
    });

    describe('No hardcoded user-facing strings remain', () => {
        it('should not contain any of the original hardcoded English strings', () => {
            // Make mockT return prefixed keys so we can detect hardcoded text
            mockT.mockImplementation((key: string) => `__${key}__`);

            const {queryByText} = renderWithProvider(<HomeScreen/>);

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
