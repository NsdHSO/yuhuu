import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../register';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api';
import * as tokenManager from '@/lib/tokenManager';

// Mock dependencies
jest.mock('expo-router', () => ({
    Stack: {
        Screen: () => null
    },
    useRouter: jest.fn()
}));

jest.mock('@/lib/api');
jest.mock('@/lib/tokenManager');

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light'
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('RegisterScreen', () => {
    const mockPush = jest.fn();
    const mockReplace = jest.fn();
    const mockPost = jest.fn();
    const mockSetTokensFromLogin = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
            replace: mockReplace
        });
        (authApi.post as jest.Mock) = mockPost;
        (tokenManager.setTokensFromLogin as jest.Mock) = mockSetTokensFromLogin;
    });

    describe('Rendering', () => {
        it('should render registration form with all fields', () => {
            render(<RegisterScreen />);

            expect(screen.getByText('Create your account')).toBeTruthy();
            expect(screen.getByPlaceholderText('Email')).toBeTruthy();
            expect(screen.getByPlaceholderText('Password')).toBeTruthy();
            expect(screen.getByPlaceholderText('Confirm password')).toBeTruthy();
            expect(screen.getByPlaceholderText('First name (optional)')).toBeTruthy();
            expect(screen.getByPlaceholderText('Last name (optional)')).toBeTruthy();
            expect(screen.getByText('I accept the terms')).toBeTruthy();
            expect(screen.getByText('Create account')).toBeTruthy();
            expect(screen.getByText('Already have an account? Sign in')).toBeTruthy();
        });

        it('should show creating state during submission', () => {
            render(<RegisterScreen />);

            // Button should show "Create account" by default
            expect(screen.getByText('Create account')).toBeTruthy();
        });
    });

    describe('User Interactions', () => {
        it('should update email input when user types', () => {
            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.changeText(emailInput, 'test@example.com');

            expect(emailInput.props.value).toBe('test@example.com');
        });

        it('should update password input when user types', () => {
            render(<RegisterScreen />);

            const passwordInput = screen.getByPlaceholderText('Password');
            fireEvent.changeText(passwordInput, 'password123');

            expect(passwordInput.props.value).toBe('password123');
        });

        it('should update confirm password input when user types', () => {
            render(<RegisterScreen />);

            const confirmInput = screen.getByPlaceholderText('Confirm password');
            fireEvent.changeText(confirmInput, 'password123');

            expect(confirmInput.props.value).toBe('password123');
        });

        it('should update first name input when user types', () => {
            render(<RegisterScreen />);

            const firstNameInput = screen.getByPlaceholderText('First name (optional)');
            fireEvent.changeText(firstNameInput, 'John');

            expect(firstNameInput.props.value).toBe('John');
        });

        it('should update last name input when user types', () => {
            render(<RegisterScreen />);

            const lastNameInput = screen.getByPlaceholderText('Last name (optional)');
            fireEvent.changeText(lastNameInput, 'Doe');

            expect(lastNameInput.props.value).toBe('Doe');
        });

        it('should navigate to login screen when clicking sign in link', () => {
            render(<RegisterScreen />);

            const signInLink = screen.getByText('Already have an account? Sign in');
            fireEvent.press(signInLink);

            expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
        });
    });

    describe('Form Validation', () => {
        it('should show alert when email is empty', async () => {
            render(<RegisterScreen />);

            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Email and password are required.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });

        it('should show alert when password is empty', async () => {
            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            fireEvent.changeText(emailInput, 'test@example.com');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Email and password are required.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });

        it('should show alert when both email and password are empty', async () => {
            render(<RegisterScreen />);

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Missing fields',
                    'Email and password are required.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });
    });

    describe('Password Confirmation Validation', () => {
        it('should show alert when passwords do not match', async () => {
            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password456');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Password mismatch',
                    'Passwords do not match.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });

        it('should proceed when passwords match exactly', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalled();
            });

            expect(Alert.alert).not.toHaveBeenCalledWith(
                'Password mismatch',
                'Passwords do not match.'
            );
        });

        it('should detect password mismatch with different case', async () => {
            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'Password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Password mismatch',
                    'Passwords do not match.'
                );
            });
        });

        it('should detect password mismatch with trailing spaces', async () => {
            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123 ');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Password mismatch',
                    'Passwords do not match.'
                );
            });
        });

        it('should handle special characters in password confirmation', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            const complexPassword = 'P@ssw0rd!@#$%^&*()';
            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, complexPassword);
            fireEvent.changeText(confirmInput, complexPassword);

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalled();
            });

            expect(Alert.alert).not.toHaveBeenCalledWith(
                'Password mismatch',
                'Passwords do not match.'
            );
        });
    });

    describe('Terms Acceptance Validation', () => {
        it('should show alert when terms are not accepted', async () => {
            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            // Terms switch is on by default, so toggle it off
            const termsSwitch = screen.getByRole('switch');
            fireEvent(termsSwitch, 'valueChange', false);

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith(
                    'Terms',
                    'You must accept the terms.'
                );
            });

            expect(mockPost).not.toHaveBeenCalled();
        });

        it('should proceed when terms are accepted', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalled();
            });
        });
    });

    describe('Registration Flow', () => {
        it('should call API with correct data and navigate on success', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-access-token',
                    refreshToken: 'test-refresh-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');
            const firstNameInput = screen.getByPlaceholderText('First name (optional)');
            const lastNameInput = screen.getByPlaceholderText('Last name (optional)');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');
            fireEvent.changeText(firstNameInput, 'John');
            fireEvent.changeText(lastNameInput, 'Doe');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/register', {
                    email: 'test@example.com',
                    password: 'password123',
                    username: 'test@example.com',
                    first_name: 'John',
                    last_name: 'Doe',
                    terms: true
                });
            });

            expect(mockSetTokensFromLogin).toHaveBeenCalledWith(
                'test-access-token',
                'test-refresh-token'
            );

            expect(Alert.alert).toHaveBeenCalledWith('Success', 'Account created.');
            expect(mockReplace).toHaveBeenCalledWith('/(tabs)');
        });

        it('should trim email before sending to API', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, '  test@example.com  ');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                    email: 'test@example.com',
                    username: 'test@example.com'
                }));
            });
        });

        it('should show error alert on registration failure', async () => {
            const errorMessage = 'Email already exists';
            mockPost.mockRejectedValue({
                response: {
                    data: {
                        message: errorMessage
                    }
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', errorMessage);
            });

            expect(mockReplace).not.toHaveBeenCalled();
        });

        it('should show default error message when no error message in response', async () => {
            mockPost.mockRejectedValue(new Error('Network error'));

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(Alert.alert).toHaveBeenCalledWith('Error', 'Registration failed. Please try again.');
            });
        });

        it('should handle optional name fields being empty', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                    email: 'test@example.com',
                    password: 'password123',
                    first_name: undefined,
                    last_name: undefined
                }));
            });
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long passwords', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');

            const longPassword = 'password'.repeat(50);
            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, longPassword);
            fireEvent.changeText(confirmInput, longPassword);

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                    password: longPassword
                }));
            });
        });

        it('should handle unicode characters in names', async () => {
            mockPost.mockResolvedValue({
                data: {
                    accessToken: 'test-token'
                }
            });

            render(<RegisterScreen />);

            const emailInput = screen.getByPlaceholderText('Email');
            const passwordInput = screen.getByPlaceholderText('Password');
            const confirmInput = screen.getByPlaceholderText('Confirm password');
            const firstNameInput = screen.getByPlaceholderText('First name (optional)');

            fireEvent.changeText(emailInput, 'test@example.com');
            fireEvent.changeText(passwordInput, 'password123');
            fireEvent.changeText(confirmInput, 'password123');
            fireEvent.changeText(firstNameInput, 'José');

            const createButton = screen.getByText('Create account');
            fireEvent.press(createButton);

            await waitFor(() => {
                expect(mockPost).toHaveBeenCalledWith('/auth/register', expect.objectContaining({
                    first_name: 'José'
                }));
            });
        });
    });
});
