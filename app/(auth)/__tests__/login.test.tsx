import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import LoginScreen from '../login';
import { useAuth } from '@/providers/AuthProvider';
import { useRouter } from 'expo-router';

// Mock dependencies
jest.mock('expo-router', () => ({
    Stack: {
        Screen: () => null
    },
    useRouter: jest.fn()
}));

jest.mock('@/providers/AuthProvider', () => ({
    useAuth: jest.fn()
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light'
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('LoginScreen', () => {
    const mockPush = jest.fn();
    const mockReplace = jest.fn();
    const mockSignIn = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace
        });
        (useAuth as jest.Mock).mockReturnValue({
            signIn: mockSignIn,
            status: 'signed-out'
        });
    });

    describe('Rendering', () => {
        it('should render login form with all elements', () => {
            render(<LoginScreen />);

            expect(screen.getByText('Welcome back')).toBeTruthy();
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
            expect(screen.getByPlaceholderText('Password')).toBeTruthy();
            expect(screen.getByText('Sign in')).toBeTruthy();
            expect(screen.getByText(/Don't have an account/)).toBeTruthy();
        });

        it('should render environment variables debug section', () => {
            render(<LoginScreen />);

            expect(screen.getByText('Environment Variables')).toBeTruthy();
            expect(screen.getByText('EXPO_PUBLIC_GRAPHQL_URL')).toBeTruthy();
            expect(screen.getByText('EXPO_PUBLIC_API_URL')).toBeTruthy();
            expect(screen.getByText('EXPO_PUBLIC_AUTH_API_URL')).toBeTruthy();
            expect(screen.getByText('EXPO_PUBLIC_ENV')).toBeTruthy();
        });

        it('should show loading state during sign in', () => {
            (useAuth as jest.Mock).mockReturnValue({
                signIn: mockSignIn,
                status: 'loading'
            });

            render(<LoginScreen />);

            const signInButton = screen.getByText('Signing in…');
            expect(signInButton).toBeTruthy();
        });
    });

    describe('User Interactions', () => {
        it('should update email input when user types', () => {
            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.changeText(emailInput, 'test@example.com');

            expect(emailInput.props.value).toBe('test@example.com');
        });

        it('should update password input when user types', () => {
            render(<LoginScreen />);

            const passwordInput = screen.getByPlaceholderText('Password');
            fireEvent.changeText(passwordInput, 'password123');

            expect(passwordInput.props.value).toBe('password123');
        });

        it('should navigate to register screen when clicking create account link', () => {
            render(<LoginScreen />);

            const createAccountLink = screen.getByText(/Don't have an account/);
            fireEvent.press(createAccountLink);

            expect(mockPush).toHaveBeenCalledWith('/(auth)/register');
        });
    });

    describe('Form Validation', () => {
        it('should show alert when email is empty', async () => {
            render(<LoginScreen />);

            const passwordInput = screen.getByPlaceholderText('Password');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Please enter email and password.'
                );
            });

            expect(mockSignIn).not.toHaveBeenCalled();
        });

        it('should show alert when password is empty', async () => {
            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.changeText(emailInput, 'test@example.com');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Please enter email and password.'
                );
            });

            expect(mockSignIn).not.toHaveBeenCalled();
        });

        it('should show alert when both fields are empty', async () => {
            render(<LoginScreen />);

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Please enter email and password.'
                );
            });

            expect(mockSignIn).not.toHaveBeenCalled();
        });
    });

    describe('Sign In Flow', () => {
        it('should call signIn with trimmed email and password', async () => {
            mockSignIn.mockResolvedValue(undefined);

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, '  test@example.com  ');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'password123');
            });
        });

        it('should navigate to tabs on successful sign in', async () => {
            mockSignIn.mockResolvedValue(undefined);

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
            });
        });

        it('should show error alert on sign in failure', async () => {
            const errorMessage = 'Invalid credentials';
            mockSignIn.mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage
                    }
                }
            });

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'wrongpassword');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show default error message when no error message in response', async () => {
            mockSignIn.mockRejectedValue(new Error('Network error'));

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', 'Login failed. Please try again.');
            });
        });

        it('should disable sign in button when status is loading', () => {
            (useAuth as jest.Mock).mockReturnValue({
                signIn: mockSignIn,
                status: 'loading'
            });

            render(<LoginScreen />);

            const signInButton = screen.getByText('Signing in…');
            expect(signInButton.props.accessibilityState?.disabled).toBe(true);
        });
    });

    describe('Edge Cases', () => {
        it('should handle email with special characters', async () => {
            mockSignIn.mockResolvedValue(undefined);

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test+user@example.com');
            fireEvent.changeText(passwordInput, 'password123');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test+user@example.com', 'password123');
            });
        });

        it('should handle password with special characters', async () => {
            mockSignIn.mockResolvedValue(undefined);

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'P@ssw0rd!@#$%');

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith('test@example.com', 'P@ssw0rd!@#$%');
            });
        });

        it('should handle very long inputs', async () => {
            mockSignIn.mockResolvedValue(undefined);

            render(<LoginScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');

            const longEmail = 'a'.repeat(100) + '@example.com';
            const longPassword = 'password'.repeat(50);

            fireEvent.changeText(emailInput, longEmail);
            fireEvent.changeText(passwordInput, longPassword);

            const signInButton = screen.getByText('Sign in');
            fireEvent.press(signInButton);

            await waitFor(() => {
                expect(mockSignIn).toHaveBeenCalledWith(longEmail, longPassword);
            });
        });
    });
});
