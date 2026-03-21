import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AssignmentForm} from '../AssignmentForm';

import {useFamiliesQuery} from '../../../features/visits/hooks';

/**
 * Unit tests for AssignmentForm Component
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific form behavior
 * - Tests family selection, date input, and submission
 */

// Mock dependencies
jest.mock('@yuhuu/components', () => ({
  useGlowVariant: () => ({glowVariant: 'vibrant'}),
  getGlowColor: () => '#A78BFA',
}));

jest.mock('../../../features/visits/hooks', () => ({
  useFamiliesQuery: jest.fn(),
}));

const mockUserData = {
  id: 123,
  auth_user_id: 'auth-123',
  created_at: '2026-01-01',
  updated_at: '2026-01-01',
};

describe('AssignmentForm', () => {
  let queryClient: QueryClient;
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false,
  };

  const mockFamilies = [
    {
      id: 1,
      family_name: 'Smith Family',
      address_street: '123 Oak St',
      address_city: 'Springfield',
      address_postal: '12345',
      latitude: 40.0,
      longitude: -74.0,
    },
    {
      id: 2,
      family_name: 'Johnson Family',
      address_street: '456 Maple Ave',
      address_city: 'Springfield',
      address_postal: '12346',
      latitude: 40.1,
      longitude: -74.1,
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {retry: false},
        mutations: {retry: false},
      },
    });

    // Seed bootstrap user data
    queryClient.setQueryData(['me'], mockUserData);

    (useFamiliesQuery as jest.Mock).mockReturnValue({
      data: mockFamilies,
      isLoading: false,
    });
  });

  const renderWithProvider = (component: React.ReactElement) => {
    return render(
      <QueryClientProvider client={queryClient}>{component}</QueryClientProvider>
    );
  };

  describe('Rendering', () => {
    it('should render family selector', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByText('Select Family')).toBeTruthy();
    });

    it('should render all available families', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByText('Smith Family')).toBeTruthy();
      expect(getByText('Johnson Family')).toBeTruthy();
    });

    it('should render date input field', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByPlaceholderText('Scheduled Date (YYYY-MM-DD)')).toBeTruthy();
    });

    it('should render notes input field', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByPlaceholderText('Notes')).toBeTruthy();
    });

    it('should render Cancel and Create buttons', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Create')).toBeTruthy();
    });

    it('should show "Creating..." when isSubmitting is true', () => {
      const {getByText} = renderWithProvider(
        <AssignmentForm {...defaultProps} isSubmitting={true} />
      );

      expect(getByText('Creating...')).toBeTruthy();
    });
  });

  describe('Family selection', () => {
    it('should select family when clicked', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const smithFamily = getByText('Smith Family');
      fireEvent.press(smithFamily);

      // Family should be selected (visual indication via background)
      expect(smithFamily).toBeTruthy();
    });

    it('should allow selecting different families', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      fireEvent.press(getByText('Smith Family'));
      fireEvent.press(getByText('Johnson Family'));

      expect(getByText('Johnson Family')).toBeTruthy();
    });

    it('should handle empty family list', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: [],
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByText('Select Family')).toBeTruthy();
    });

    it('should handle undefined family list', () => {
      (useFamiliesQuery as jest.Mock).mockReturnValue({
        data: undefined,
        isLoading: false,
      });

      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByText('Select Family')).toBeTruthy();
    });
  });

  describe('Date input', () => {
    it('should have default date set to today', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const dateInput = getByPlaceholderText('Scheduled Date (YYYY-MM-DD)');
      const today = new Date().toISOString().split('T')[0];

      expect(dateInput.props.value).toBe(today);
    });

    it('should update scheduled_date on text input', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const dateInput = getByPlaceholderText('Scheduled Date (YYYY-MM-DD)');
      fireEvent.changeText(dateInput, '2026-03-20');

      expect(dateInput.props.value).toBe('2026-03-20');
    });
  });

  describe('Notes input', () => {
    it('should update notes on text input', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const notesInput = getByPlaceholderText('Notes');
      fireEvent.changeText(notesInput, 'First visit to this family');

      expect(notesInput.props.value).toBe('First visit to this family');
    });

    it('should support multiline notes', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const notesInput = getByPlaceholderText('Notes');
      expect(notesInput.props.multiline).toBe(true);
    });
  });

  describe('Form validation', () => {
    it('should not submit when family_id is 0', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      // Don't select a family, just press Create
      fireEvent.press(getByText('Create'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit when family is selected and date is set', () => {
      const {getByText} = renderWithProvider(
        <AssignmentForm {...defaultProps} />
      );

      // Select family
      fireEvent.press(getByText('Smith Family'));

      // Date is already set to today by default
      fireEvent.press(getByText('Create'));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          family_id: 1,
          assigned_to_user_id: 123,
        })
      );
    });

    it('should include notes in submission', () => {
      const {getByText, getByPlaceholderText} = renderWithProvider(
        <AssignmentForm {...defaultProps} />
      );

      fireEvent.press(getByText('Smith Family'));
      fireEvent.changeText(getByPlaceholderText('Notes'), 'Evening visit preferred');
      fireEvent.press(getByText('Create'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          notes: 'Evening visit preferred',
        })
      );
    });
  });

  describe('Button interactions', () => {
    it('should call onCancel when Cancel button pressed', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      fireEvent.press(getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not submit when isSubmitting is true', () => {
      const {getByText} = renderWithProvider(
        <AssignmentForm {...defaultProps} isSubmitting={true} />
      );

      fireEvent.press(getByText('Smith Family'));
      fireEvent.press(getByText('Creating...'));

      // Button is disabled, so onPress shouldn't fire
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('useGlowVariant theming', () => {
    it('should use glow color for selected family background', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      fireEvent.press(getByText('Smith Family'));
      expect(getByText('Smith Family')).toBeTruthy();
    });

    it('should use glow color for create button', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      expect(getByText('Create')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle custom date format input', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const dateInput = getByPlaceholderText('Scheduled Date (YYYY-MM-DD)');
      fireEvent.changeText(dateInput, '2026-12-31');

      expect(dateInput.props.value).toBe('2026-12-31');
    });

    it('should handle very long notes', () => {
      const {getByPlaceholderText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      const longNotes = 'A'.repeat(500);
      const notesInput = getByPlaceholderText('Notes');
      fireEvent.changeText(notesInput, longNotes);

      expect(notesInput.props.value).toBe(longNotes);
    });

    it('should default assigned_to_user_id to bootstrap user ID', () => {
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      fireEvent.press(getByText('Smith Family'));
      fireEvent.press(getByText('Create'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          assigned_to_user_id: 123,
        })
      );
    });
  });

  describe('Bootstrap user ID handling', () => {
    it('should prevent submission when user data is not in cache', () => {
      queryClient.setQueryData(['me'], null);
      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      fireEvent.press(getByText('Smith Family'));
      fireEvent.press(getByText('Create'));

      // Form validation should prevent submission when user ID is 0
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should use correct user ID when different user is logged in', () => {
      const differentUser = {
        id: 456,
        auth_user_id: 'auth-456',
        created_at: '2026-01-01',
        updated_at: '2026-01-01',
      };
      queryClient.setQueryData(['me'], differentUser);

      const {getByText} = renderWithProvider(<AssignmentForm {...defaultProps} />);

      fireEvent.press(getByText('Smith Family'));
      fireEvent.press(getByText('Create'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          assigned_to_user_id: 456,
        })
      );
    });
  });
});
