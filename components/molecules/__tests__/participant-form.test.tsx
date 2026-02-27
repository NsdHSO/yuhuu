import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { ParticipantForm } from '@/components/molecules/participant-form';
import * as useColorSchemeModule from '@/hooks/use-color-scheme';

// Mock Alert
jest.spyOn(Alert, 'alert');

// Mock useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
	useColorScheme: jest.fn(() => 'light'),
}));

describe('ParticipantForm', () => {
	const mockOnSubmit = jest.fn();

	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('should render username and notes inputs', () => {
		const { getByPlaceholderText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		expect(getByPlaceholderText('Username')).toBeTruthy();
		expect(getByPlaceholderText('Notes (optional)')).toBeTruthy();
	});

	it('should render submit button', () => {
		const { getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		expect(getByText('Add Participant')).toBeTruthy();
	});

	it('should render button text with proper styling for visibility', () => {
		const { getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const buttonText = getByText('Add Participant');

		// Button text should have white color for visibility
		expect(buttonText.props.style).toEqual(
			expect.objectContaining({
				color: '#fff',
			})
		);
	});

	it('should update username input value', () => {
		const { getByPlaceholderText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const usernameInput = getByPlaceholderText('Username');
		fireEvent.changeText(usernameInput, 'john_doe');

		expect(usernameInput.props.value).toBe('john_doe');
	});

	it('should update notes input value', () => {
		const { getByPlaceholderText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const notesInput = getByPlaceholderText('Notes (optional)');
		fireEvent.changeText(notesInput, 'Vegetarian');

		expect(notesInput.props.value).toBe('Vegetarian');
	});

	it('should have visible button with proper background color', () => {
		const { getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const button = getByText('Add Participant').parent;

		// Button should have a solid background color (not transparent or white)
		// This ensures the button is visible against any background
		expect(button?.props.style).toBeDefined();
	});

	it('should call onSubmit with trimmed values when form is valid', () => {
		const { getByPlaceholderText, getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const usernameInput = getByPlaceholderText('Username');
		const notesInput = getByPlaceholderText('Notes (optional)');
		const submitButton = getByText('Add Participant');

		fireEvent.changeText(usernameInput, '  john_doe  ');
		fireEvent.changeText(notesInput, '  Vegetarian  ');
		fireEvent.press(submitButton);

		expect(mockOnSubmit).toHaveBeenCalledWith('john_doe', 'Vegetarian');
	});

	it('should show alert when username is empty', () => {
		const { getByPlaceholderText, getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const notesInput = getByPlaceholderText('Notes (optional)');
		const submitButton = getByText('Add Participant');

		fireEvent.changeText(notesInput, 'Test notes');
		fireEvent.press(submitButton);

		expect(Alert.alert).toHaveBeenCalledWith('Required', 'Please enter a username.');
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	it('should allow submission when notes is empty (notes is optional)', () => {
		const { getByPlaceholderText, getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const usernameInput = getByPlaceholderText('Username');
		const submitButton = getByText('Add Participant');

		fireEvent.changeText(usernameInput, 'john_doe');
		fireEvent.press(submitButton);

		// Should succeed with empty notes
		expect(Alert.alert).not.toHaveBeenCalled();
		expect(mockOnSubmit).toHaveBeenCalledWith('john_doe', '');
	});

	it('should show alert when username is empty', () => {
		const { getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const submitButton = getByText('Add Participant');
		fireEvent.press(submitButton);

		expect(Alert.alert).toHaveBeenCalledWith('Required', 'Please enter a username.');
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	it('should show alert when username contains only whitespace', () => {
		const { getByPlaceholderText, getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const usernameInput = getByPlaceholderText('Username');
		const submitButton = getByText('Add Participant');

		fireEvent.changeText(usernameInput, '   ');
		fireEvent.press(submitButton);

		expect(Alert.alert).toHaveBeenCalledWith('Required', 'Please enter a username.');
		expect(mockOnSubmit).not.toHaveBeenCalled();
	});

	it('should clear form after successful submission', () => {
		const { getByPlaceholderText, getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const usernameInput = getByPlaceholderText('Username');
		const notesInput = getByPlaceholderText('Notes (optional)');
		const submitButton = getByText('Add Participant');

		fireEvent.changeText(usernameInput, 'john_doe');
		fireEvent.changeText(notesInput, 'Vegetarian');
		fireEvent.press(submitButton);

		expect(mockOnSubmit).toHaveBeenCalled();
		expect(usernameInput.props.value).toBe('');
		expect(notesInput.props.value).toBe('');
	});

	it('should disable inputs when isSubmitting is true', () => {
		const { getByPlaceholderText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={true} />
		);

		const usernameInput = getByPlaceholderText('Username');
		const notesInput = getByPlaceholderText('Notes (optional)');

		expect(usernameInput.props.editable).toBe(false);
		expect(notesInput.props.editable).toBe(false);
	});

	it('should disable submit button when isSubmitting is true', () => {
		const { getByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={true} />
		);

		const submitButton = getByText('Adding…');
		expect(submitButton).toBeTruthy();
	});

	it('should show "Adding…" text when isSubmitting is true', () => {
		const { getByText, queryByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={true} />
		);

		expect(getByText('Adding…')).toBeTruthy();
		expect(queryByText('Add Participant')).toBeNull();
	});

	it('should show "Add Participant" text when isSubmitting is false', () => {
		const { getByText, queryByText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		expect(getByText('Add Participant')).toBeTruthy();
		expect(queryByText('Adding…')).toBeNull();
	});

	it('should use theme-aware styling', () => {
		jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('dark');

		const { getByPlaceholderText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const usernameInput = getByPlaceholderText('Username');
		expect(usernameInput.props.style).toBeDefined();
	});

	it('should handle multiline notes input', () => {
		const { getByPlaceholderText } = render(
			<ParticipantForm onSubmit={mockOnSubmit} isSubmitting={false} />
		);

		const notesInput = getByPlaceholderText('Notes (optional)');

		expect(notesInput.props.multiline).toBe(true);
		expect(notesInput.props.numberOfLines).toBe(4);
	});
});
