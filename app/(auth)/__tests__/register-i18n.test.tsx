import React from 'react';
import { render, fireEvent, act, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../register';

/**
 * TDD tests for Register Screen i18n Migration
 *
 * Verifies that all hardcoded strings in register.tsx are replaced
 * with translation keys via useTranslation().
 *
 * Translation keys expected:
 * auth.register.title              -> "Create account" (Stack.Screen title)
 * auth.register.createAccount      -> "Create your account"
 * auth.register.emailPlaceholder   -> "Email"
 * auth.register.passwordPlaceholder -> "Password"
 * auth.register.confirmPassword    -> "Confirm password"
 * auth.register.firstNamePlaceholder -> "First name (optional)"
 * auth.register.lastNamePlaceholder -> "Last name (optional)"
 * auth.register.acceptTerms        -> "I accept the terms"
 * auth.register.submit             -> "Create account"
 * auth.register.submitting         -> "Creating..."
 * auth.register.hasAccount         -> "Already have an account? Sign in"
 * auth.register.missingFields      -> "Email and password are required."
 * auth.register.passwordMismatchTitle -> "Password mismatch"
 * auth.register.passwordMismatch   -> "Passwords do not match."
 * auth.register.termsTitle         -> "Terms"
 * auth.register.termsRequired      -> "You must accept the terms."
 * auth.register.success            -> "Account created."
 * auth.register.error              -> "Registration failed. Please try again."
 * auth.register.errorGeneric       -> "Registration failed."
 * common.missingFields             -> "Missing fields"
 * common.error                     -> "Error"
 * common.success                   -> "Success"
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

// --- Mock expo-router ---
const mockReplace = jest.fn();
const mockPush = jest.fn();

jest.mock('expo-router', () => ({
    Stack: { Screen: () => null },
    useRouter: () => ({ replace: mockReplace, push: mockPush }),
}));

// --- Mock dependencies ---
jest.mock('@/lib/api', () => ({
    authApi: { post: jest.fn() },
}));

jest.mock('@/lib/tokenManager', () => ({
    setTokensFromLogin: jest.fn(),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

// Get mocked modules for test manipulation
const { authApi } = jest.requireMock('@/lib/api');

describe('RegisterScreen - i18n Migration', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('useTranslation hook integration', () => {
        it('should call useTranslation', () => {
            render(<RegisterScreen />);
            expect(mockUseTranslation).toHaveBeenCalled();
        });
    });

    describe('Screen title', () => {
        it('should use t() for the Stack.Screen title instead of hardcoded "Create account"', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.title');
        });
    });

    describe('Heading text', () => {
        it('should use t() for heading instead of hardcoded "Create your account"', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.createAccount');
        });
    });

    describe('Input placeholder strings', () => {
        it('should use t() for email placeholder', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.emailPlaceholder');
        });

        it('should use t() for password placeholder', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.passwordPlaceholder');
        });

        it('should use t() for confirm password placeholder', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.confirmPassword');
        });

        it('should use t() for first name placeholder', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.firstNamePlaceholder');
        });

        it('should use t() for last name placeholder', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.lastNamePlaceholder');
        });
    });

    describe('Terms acceptance text', () => {
        it('should use t() for terms text instead of hardcoded "I accept the terms"', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.acceptTerms');
        });
    });

    describe('Submit button strings', () => {
        it('should use t() for submit button text', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.submit');
        });
    });

    describe('Navigation link text', () => {
        it('should use t() for "already have account" link', () => {
            render(<RegisterScreen />);
            expect(mockT).toHaveBeenCalledWith('auth.register.hasAccount');
        });
    });

    describe('Alert strings - missing fields', () => {
        it('should use t() for missing fields alert', () => {
            const { getByText } = render(<RegisterScreen />);

            // Submit without entering fields
            const submitButton = getByText('auth.register.submit');
            fireEvent.press(submitButton);

            expect(mockT).toHaveBeenCalledWith('common.missingFields');
            expect(mockT).toHaveBeenCalledWith('auth.register.missingFields');
        });
    });

    describe('Alert strings - password mismatch', () => {
        it('should use t() for password mismatch alert', () => {
            const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

            fireEvent.changeText(getByPlaceholderText('auth.register.emailPlaceholder'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('auth.register.passwordPlaceholder'), 'password1');
            fireEvent.changeText(getByPlaceholderText('auth.register.confirmPassword'), 'password2');

            fireEvent.press(getByText('auth.register.submit'));

            expect(mockT).toHaveBeenCalledWith('auth.register.passwordMismatchTitle');
            expect(mockT).toHaveBeenCalledWith('auth.register.passwordMismatch');
        });
    });

    describe('Alert strings - terms not accepted', () => {
        it('should use t() for terms required alert', () => {
            const { getByText, getByPlaceholderText, getByRole } = render(<RegisterScreen />);

            fireEvent.changeText(getByPlaceholderText('auth.register.emailPlaceholder'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('auth.register.passwordPlaceholder'), 'password1');
            fireEvent.changeText(getByPlaceholderText('auth.register.confirmPassword'), 'password1');

            // Toggle terms off
            fireEvent(getByRole('switch'), 'valueChange', false);

            fireEvent.press(getByText('auth.register.submit'));

            expect(mockT).toHaveBeenCalledWith('auth.register.termsTitle');
            expect(mockT).toHaveBeenCalledWith('auth.register.termsRequired');
        });
    });

    describe('Alert strings - success', () => {
        it('should use t() for success alert', async () => {
            authApi.post.mockResolvedValue({
                data: { accessToken: 'test-token' },
            });

            const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

            fireEvent.changeText(getByPlaceholderText('auth.register.emailPlaceholder'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('auth.register.passwordPlaceholder'), 'password1');
            fireEvent.changeText(getByPlaceholderText('auth.register.confirmPassword'), 'password1');

            await act(async () => {
                fireEvent.press(getByText('auth.register.submit'));
            });

            expect(mockT).toHaveBeenCalledWith('common.success');
            expect(mockT).toHaveBeenCalledWith('auth.register.success');
        });
    });

    describe('Alert strings - registration error', () => {
        it('should use t() for error alert title', async () => {
            authApi.post.mockRejectedValue(new Error('Server error'));

            const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

            fireEvent.changeText(getByPlaceholderText('auth.register.emailPlaceholder'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('auth.register.passwordPlaceholder'), 'password1');
            fireEvent.changeText(getByPlaceholderText('auth.register.confirmPassword'), 'password1');

            await act(async () => {
                fireEvent.press(getByText('auth.register.submit'));
            });

            expect(mockT).toHaveBeenCalledWith('common.error');
            expect(mockT).toHaveBeenCalledWith('auth.register.error');
        });

        it('should use t() for generic error fallback when message is non-string', async () => {
            authApi.post.mockRejectedValue({
                response: { data: { message: { complex: 'object' } } },
            });

            const { getByText, getByPlaceholderText } = render(<RegisterScreen />);

            fireEvent.changeText(getByPlaceholderText('auth.register.emailPlaceholder'), 'test@test.com');
            fireEvent.changeText(getByPlaceholderText('auth.register.passwordPlaceholder'), 'password1');
            fireEvent.changeText(getByPlaceholderText('auth.register.confirmPassword'), 'password1');

            await act(async () => {
                fireEvent.press(getByText('auth.register.submit'));
            });

            expect(mockT).toHaveBeenCalledWith('auth.register.errorGeneric');
        });
    });

    describe('No hardcoded user-facing strings remain', () => {
        it('should not contain any original hardcoded English strings in rendered output', () => {
            // Return prefixed keys so we can detect hardcoded strings
            mockT.mockImplementation((key: string) => `__${key}__`);

            const { queryByText } = render(<RegisterScreen />);

            const hardcodedStrings = [
                'Create account',
                'Create your account',
                'Creating\u2026',
                'Email',
                'Password',
                'Confirm password',
                'First name (optional)',
                'Last name (optional)',
                'I accept the terms',
                'Already have an account? Sign in',
            ];

            for (const str of hardcodedStrings) {
                expect(queryByText(str)).toBeNull();
            }
        });
    });
});
