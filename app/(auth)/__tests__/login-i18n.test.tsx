import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Alert, Platform } from 'react-native';
import LoginScreen from '../login';

/**
 * TDD tests for Login Screen i18n Migration
 *
 * Verifies that all hardcoded strings in login.tsx are replaced
 * with translation keys via useTranslation().
 *
 * Translation keys expected:
 * auth.login.title           -> "Sign in" (Stack.Screen title)
 * auth.login.welcome         -> "Welcome back"
 * auth.login.emailPlaceholder -> "Email"
 * auth.login.passwordPlaceholder -> "Password"
 * auth.login.submit          -> "Sign in"
 * auth.login.submitting      -> "Signing in..."
 * auth.login.noAccount       -> "Don't have an account? Create one"
 * auth.login.biometricButton -> "Sign in with Face ID"
 * auth.login.biometricButtonAndroid -> "Sign in with biometrics"
 * auth.login.biometricDivider -> "or"
 * auth.login.biometricAccessibilityLabel -> "Sign in with Face ID or Touch ID"
 * auth.login.biometricAccessibilityLabelAndroid -> "Sign in with biometrics"
 * auth.login.biometricAccessibilityHint -> "Authenticate using your device biometrics to sign in"
 * auth.login.missingFields   -> "Please enter email and password."
 * auth.login.error           -> "Login failed. Please try again."
 * auth.login.biometricError  -> "Biometric login failed. Please try again."
 * common.missingFields       -> "Missing fields"
 * common.error               -> "Error"
 */

// Spy on Alert
jest.spyOn(Alert, 'alert');

// --- Mock react-i18next ---
const mockT = jest.fn((key: string) => key);
const mockUseTranslation = jest.fn(() => ({
    t: mockT,
    i18n: { language: 'en', changeLanguage: jest.fn() },
}));

jest.mock('react-i18next', () => ({
    useTranslation: (...args: any[]) => mockUseTranslation(...args),
}));

// --- Mock biometricAuth ---
const mockIsBiometricAvailable = jest.fn();
const mockGetBiometricPreference = jest.fn();

jest.mock('@/lib/biometricAuth', () => ({
    isBiometricAvailable: (...args: any[]) => mockIsBiometricAvailable(...args),
    getBiometricPreference: (...args: any[]) => mockGetBiometricPreference(...args),
}));

// --- Mock useAuth ---
const mockSignIn = jest.fn();
const mockSignInWithBiometrics = jest.fn();

jest.mock('@/providers/AuthProvider', () => ({
    useAuth: () => ({
        signIn: mockSignIn,
        signInWithBiometrics: mockSignInWithBiometrics,
        status: 'signed-out',
    }),
}));

describe('LoginScreen - i18n Migration', () => {
    const originalPlatform = Platform.OS;

    beforeEach(() => {
        jest.clearAllMocks();
        mockIsBiometricAvailable.mockResolvedValue(false);
        mockGetBiometricPreference.mockResolvedValue(false);
    });

    afterEach(() => {
        Object.defineProperty(Platform, 'OS', { value: originalPlatform });
    });

    describe('useTranslation hook integration', () => {
        it('should call useTranslation', () => {
            render(<LoginScreen />);
            expect(mockUseTranslation).toHaveBeenCalled();
        });
    });

    describe('Screen title', () => {
        it('should use t() for the Stack.Screen title instead of hardcoded "Sign in"', () => {
            render(<LoginScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.login.title');
        });
    });

    describe('Welcome text', () => {
        it('should use t() for welcome heading instead of hardcoded "Welcome back"', () => {
            render(<LoginScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.login.welcome');
        });
    });

    describe('Input placeholder strings', () => {
        it('should use t() for email placeholder', () => {
            render(<LoginScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.login.emailPlaceholder');
        });

        it('should use t() for password placeholder', () => {
            render(<LoginScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.login.passwordPlaceholder');
        });
    });

    describe('Submit button strings', () => {
        it('should use t() for submit button text', () => {
            render(<LoginScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.login.submit');
        });
    });

    describe('No account link', () => {
        it('should use t() for "no account" text', () => {
            render(<LoginScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.login.noAccount');
        });
    });

    describe('Biometric section strings', () => {
        beforeEach(() => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);
        });

        it('should use t() for biometric divider text', async () => {
            const { findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-divider');

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricDivider');
        });

        it('should use t() for iOS biometric button label', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'ios' });

            const { findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-login-button');

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricButton');
        });

        it('should use t() for Android biometric button label', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'android' });

            const { findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-login-button');

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricButtonAndroid');
        });

        it('should use t() for iOS biometric accessibility label', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'ios' });

            const { findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-login-button');

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricAccessibilityLabel');
        });

        it('should use t() for Android biometric accessibility label', async () => {
            Object.defineProperty(Platform, 'OS', { value: 'android' });

            const { findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-login-button');

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricAccessibilityLabelAndroid');
        });

        it('should use t() for biometric accessibility hint', async () => {
            const { findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-login-button');

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricAccessibilityHint');
        });
    });

    describe('Alert strings - missing fields', () => {
        it('should use t() for missing fields alert', () => {
            const { getByText } = render(<LoginScreen />);

            // Submit without entering fields
            const submitButton = getByText('auth.login.submit');
            fireEvent.press(submitButton);

            expect(mockT).toHaveBeenCalledWith('common.missingFields');
            expect(mockT).toHaveBeenCalledWith('auth.login.missingFields');
        });
    });

    describe('Alert strings - login error', () => {
        it('should use t() for login error fallback message', async () => {
            mockSignIn.mockRejectedValue(new Error('Server error'));

            const { getByText, getByPlaceholderText } = render(<LoginScreen />);

            fireEvent.changeText(getByPlaceholderText('auth.login.emailPlaceholder'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('auth.login.passwordPlaceholder'), 'password');

            await act(async () => {
                fireEvent.press(getByText('auth.login.submit'));
            });

            expect(mockT).toHaveBeenCalledWith('auth.login.error');
        });
    });

    describe('Alert strings - biometric error', () => {
        it('should use t() for biometric error fallback message', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);
            mockSignInWithBiometrics.mockRejectedValue(new Error());

            const { findByTestId } = render(<LoginScreen />);
            const biometricButton = await findByTestId('biometric-login-button');

            await act(async () => {
                fireEvent.press(biometricButton);
            });

            expect(mockT).toHaveBeenCalledWith('auth.login.biometricError');
        });
    });

    describe('No hardcoded user-facing strings remain', () => {
        it('should not contain any original hardcoded English strings in rendered output', async () => {
            mockIsBiometricAvailable.mockResolvedValue(true);
            mockGetBiometricPreference.mockResolvedValue(true);

            // Return prefixed keys so we can detect hardcoded strings
            mockT.mockImplementation((key: string) => `__${key}__`);

            const { queryByText, findByTestId } = render(<LoginScreen />);
            await findByTestId('biometric-login-button');

            const hardcodedStrings = [
                'Welcome back',
                'Sign in',
                'Signing in\u2026',
                'Email',
                'Password',
                "Don't have an account? Create one",
                'or',
                'Sign in with Face ID',
                'Sign in with biometrics',
            ];

            for (const str of hardcodedStrings) {
                expect(queryByText(str)).toBeNull();
            }
        });
    });
});
