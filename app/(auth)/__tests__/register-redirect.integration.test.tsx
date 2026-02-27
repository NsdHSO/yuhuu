import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import RegisterScreen from '../register';
import { useRouter } from 'expo-router';
import { authApi } from '@/lib/api';
import * as tokenManager from '@/lib/tokenManager';

/**
 * Integration test for registration redirect flow
 *
 * CRITICAL TEST: Verifies that after successful registration,
 * user is redirected to Login screen (not auto-logged in to tabs)
 *
 * Flow:
 * 1. User fills in registration form
 * 2. User submits form
 * 3. API processes registration
 * 4. Success alert shown
 * 5. User redirected to Login screen to sign in
 *
 * Business logic: We want users to verify their email or
 * explicitly log in after registration rather than auto-login
 */

// Mock dependencies
jest.mock('expo-router', () => ({
	Stack: {
		Screen: () => null,
	},
	useRouter: jest.fn(),
}));

jest.mock('@/lib/api');
jest.mock('@/lib/tokenManager');

jest.mock('@/hooks/use-color-scheme', () => ({
	useColorScheme: () => 'light',
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('Register → Login Redirect Integration Test', () => {
	const mockReplace = jest.fn();
	const mockPost = jest.fn();
	const mockSetTokensFromLogin = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
		(useRouter as jest.Mock).mockReturnValue({
			replace: mockReplace,
		});
		(authApi.post as jest.Mock) = mockPost;
		(tokenManager.setTokensFromLogin as jest.Mock) = mockSetTokensFromLogin;
	});

	it('should redirect to Login screen after successful registration', async () => {
		// Given: API will return success
		mockPost.mockResolvedValue({
			data: {
				message: 'User registered successfully',
				// Note: No access token returned - registration only creates account
			},
		});

		// When: User fills registration form and submits
		const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

		const emailInput = getByPlaceholderText('Email');
		const passwordInput = getByPlaceholderText('Password');
		const confirmInput = getByPlaceholderText('Confirm password');
		const firstNameInput = getByPlaceholderText('First name (optional)');
		const lastNameInput = getByPlaceholderText('Last name (optional)');

		fireEvent.changeText(emailInput, 'newuser@example.com');
		fireEvent.changeText(passwordInput, 'SecurePass123!');
		fireEvent.changeText(confirmInput, 'SecurePass123!');
		fireEvent.changeText(firstNameInput, 'John');
		fireEvent.changeText(lastNameInput, 'Doe');

		const createButton = getByText('Create account');
		fireEvent.press(createButton);

		// Then: API should be called with correct data
		await waitFor(() => {
			expect(mockPost).toHaveBeenCalledWith('/auth/register', {
				email: 'newuser@example.com',
				password: 'SecurePass123!',
				username: 'newuser@example.com',
				first_name: 'John',
				last_name: 'Doe',
				terms: true,
			});
		});

		// Then: Success alert should be shown
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith('Success', 'Account created.');
		});

		// Then: User should be redirected to Login screen (NOT tabs)
		await waitFor(() => {
			expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
		});

		// Then: Should NOT redirect to tabs
		expect(mockReplace).not.toHaveBeenCalledWith('/(tabs)');
	});

	it('should show loading state during API call', async () => {
		// Given: API will take some time to respond
		mockPost.mockImplementation(
			() =>
				new Promise((resolve) =>
					setTimeout(
						() =>
							resolve({
								data: { message: 'Success' },
							}),
						100
					)
				)
		);

		// When: User submits form
		const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

		const emailInput = getByPlaceholderText('Email');
		const passwordInput = getByPlaceholderText('Password');
		const confirmInput = getByPlaceholderText('Confirm password');

		fireEvent.changeText(emailInput, 'test@example.com');
		fireEvent.changeText(passwordInput, 'password123');
		fireEvent.changeText(confirmInput, 'password123');

		const createButton = getByText('Create account');
		fireEvent.press(createButton);

		// Then: Button should show loading state
		await waitFor(() => {
			expect(getByText('Creating…')).toBeTruthy();
		});

		// Wait for completion
		await waitFor(() => {
			expect(mockReplace).toHaveBeenCalled();
		});
	});

	it('should NOT redirect to Login if registration fails', async () => {
		// Given: API will return error
		mockPost.mockRejectedValue({
			response: {
				data: {
					message: 'Email already exists',
				},
			},
		});

		// When: User submits form
		const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

		const emailInput = getByPlaceholderText('Email');
		const passwordInput = getByPlaceholderText('Password');
		const confirmInput = getByPlaceholderText('Confirm password');

		fireEvent.changeText(emailInput, 'existing@example.com');
		fireEvent.changeText(passwordInput, 'password123');
		fireEvent.changeText(confirmInput, 'password123');

		const createButton = getByText('Create account');
		fireEvent.press(createButton);

		// Then: Error alert should be shown
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith('Error', 'Email already exists');
		});

		// Then: Should NOT redirect anywhere
		expect(mockReplace).not.toHaveBeenCalled();

		// Then: User should still see the registration form
		expect(getByText('Create account')).toBeTruthy();
	});

	it('should handle network errors gracefully', async () => {
		// Given: Network error occurs
		mockPost.mockRejectedValue(new Error('Network request failed'));

		// When: User submits form
		const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

		const emailInput = getByPlaceholderText('Email');
		const passwordInput = getByPlaceholderText('Password');
		const confirmInput = getByPlaceholderText('Confirm password');

		fireEvent.changeText(emailInput, 'test@example.com');
		fireEvent.changeText(passwordInput, 'password123');
		fireEvent.changeText(confirmInput, 'password123');

		const createButton = getByText('Create account');
		fireEvent.press(createButton);

		// Then: Generic error alert should be shown
		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith(
				'Error',
				'Registration failed. Please try again.'
			);
		});

		// Then: Should NOT redirect
		expect(mockReplace).not.toHaveBeenCalled();
	});

	it('should complete full registration flow with all fields', async () => {
		// Given: Successful API response
		mockPost.mockResolvedValue({
			data: {
				message: 'Registration successful',
				user: {
					id: '123',
					email: 'fulluser@example.com',
					first_name: 'Jane',
					last_name: 'Smith',
				},
			},
		});

		// When: User completes full registration with all fields
		const { getByPlaceholderText, getByText } = render(<RegisterScreen />);

		fireEvent.changeText(getByPlaceholderText('Email'), 'fulluser@example.com');
		fireEvent.changeText(getByPlaceholderText('Password'), 'StrongP@ss123');
		fireEvent.changeText(getByPlaceholderText('Confirm password'), 'StrongP@ss123');
		fireEvent.changeText(getByPlaceholderText('First name (optional)'), 'Jane');
		fireEvent.changeText(getByPlaceholderText('Last name (optional)'), 'Smith');

		fireEvent.press(getByText('Create account'));

		// Then: Complete flow should execute
		await waitFor(() => {
			expect(mockPost).toHaveBeenCalledWith(
				'/auth/register',
				expect.objectContaining({
					email: 'fulluser@example.com',
					password: 'StrongP@ss123',
					first_name: 'Jane',
					last_name: 'Smith',
					terms: true,
				})
			);
		});

		await waitFor(() => {
			expect(Alert.alert).toHaveBeenCalledWith('Success', 'Account created.');
		});

		await waitFor(() => {
			expect(mockReplace).toHaveBeenCalledWith('/(auth)/login');
		});
	});
});
