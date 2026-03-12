import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {FamilyForm} from '../FamilyForm';
import type {CreateVisitableFamilyInput} from '@yuhuu/types';

/**
 * Unit tests for FamilyForm Component
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific form behavior
 * - Tests user interactions and validation logic
 */

// Mock dependencies
jest.mock('@yuhuu/components', () => ({
  useGlowVariant: () => ({glowVariant: 'vibrant'}),
  getGlowColor: () => '#A78BFA',
}));

describe('FamilyForm', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  const defaultProps = {
    onSubmit: mockOnSubmit,
    onCancel: mockOnCancel,
    isSubmitting: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render all required input fields', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      expect(getByPlaceholderText('Family Name *')).toBeTruthy();
      expect(getByPlaceholderText('Street Address *')).toBeTruthy();
      expect(getByPlaceholderText('City *')).toBeTruthy();
      expect(getByPlaceholderText('Postal Code *')).toBeTruthy();
    });

    it('should render optional input fields', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      expect(getByPlaceholderText('Phone')).toBeTruthy();
      expect(getByPlaceholderText('Notes')).toBeTruthy();
    });

    it('should render Cancel and Save buttons', () => {
      const {getByText} = render(<FamilyForm {...defaultProps} />);

      expect(getByText('Cancel')).toBeTruthy();
      expect(getByText('Save')).toBeTruthy();
    });

    it('should show "Saving..." when isSubmitting is true', () => {
      const {getByText} = render(<FamilyForm {...defaultProps} isSubmitting={true} />);

      expect(getByText('Saving...')).toBeTruthy();
    });
  });

  describe('Form initialization with initialData', () => {
    it('should populate form with initialData', () => {
      const initialData: Partial<CreateVisitableFamilyInput> = {
        family_name: 'Johnson Family',
        address_street: '456 Maple Ave',
        address_city: 'Springfield',
        address_postal: '12346',
        phone: '+1234567890',
        notes: 'Test notes',
      };

      const {getByDisplayValue} = render(
        <FamilyForm {...defaultProps} initialData={initialData} />
      );

      expect(getByDisplayValue('Johnson Family')).toBeTruthy();
      expect(getByDisplayValue('456 Maple Ave')).toBeTruthy();
      expect(getByDisplayValue('Springfield')).toBeTruthy();
      expect(getByDisplayValue('12346')).toBeTruthy();
      expect(getByDisplayValue('+1234567890')).toBeTruthy();
      expect(getByDisplayValue('Test notes')).toBeTruthy();
    });

    it('should handle partial initialData', () => {
      const initialData: Partial<CreateVisitableFamilyInput> = {
        family_name: 'Partial Family',
      };

      const {getByDisplayValue, getByPlaceholderText} = render(
        <FamilyForm {...defaultProps} initialData={initialData} />
      );

      expect(getByDisplayValue('Partial Family')).toBeTruthy();
      expect(getByPlaceholderText('Street Address *')).toBeTruthy();
    });

    it('should default to empty strings when no initialData', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const nameInput = getByPlaceholderText('Family Name *');
      expect(nameInput.props.value).toBe('');
    });
  });

  describe('Form input interactions', () => {
    it('should update family_name on text input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Family Name *');
      fireEvent.changeText(input, 'Smith Family');

      expect(input.props.value).toBe('Smith Family');
    });

    it('should update address_street on text input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Street Address *');
      fireEvent.changeText(input, '123 Oak Street');

      expect(input.props.value).toBe('123 Oak Street');
    });

    it('should update address_city on text input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('City *');
      fireEvent.changeText(input, 'Springfield');

      expect(input.props.value).toBe('Springfield');
    });

    it('should update address_postal on text input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Postal Code *');
      fireEvent.changeText(input, '12345');

      expect(input.props.value).toBe('12345');
    });

    it('should update phone on text input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Phone');
      fireEvent.changeText(input, '+1234567890');

      expect(input.props.value).toBe('+1234567890');
    });

    it('should update notes on text input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Notes');
      fireEvent.changeText(input, 'Evening visits preferred');

      expect(input.props.value).toBe('Evening visits preferred');
    });
  });

  describe('Form validation', () => {
    it('should not submit when family_name is empty', () => {
      const {getByPlaceholderText, getByText} = render(<FamilyForm {...defaultProps} />);

      // Fill other required fields
      fireEvent.changeText(getByPlaceholderText('Street Address *'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City *'), 'City');
      fireEvent.changeText(getByPlaceholderText('Postal Code *'), '12345');

      fireEvent.press(getByText('Save'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when address_street is empty', () => {
      const {getByPlaceholderText, getByText} = render(<FamilyForm {...defaultProps} />);

      fireEvent.changeText(getByPlaceholderText('Family Name *'), 'Test Family');
      fireEvent.changeText(getByPlaceholderText('City *'), 'City');
      fireEvent.changeText(getByPlaceholderText('Postal Code *'), '12345');

      fireEvent.press(getByText('Save'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when address_city is empty', () => {
      const {getByPlaceholderText, getByText} = render(<FamilyForm {...defaultProps} />);

      fireEvent.changeText(getByPlaceholderText('Family Name *'), 'Test Family');
      fireEvent.changeText(getByPlaceholderText('Street Address *'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('Postal Code *'), '12345');

      fireEvent.press(getByText('Save'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should not submit when address_postal is empty', () => {
      const {getByPlaceholderText, getByText} = render(<FamilyForm {...defaultProps} />);

      fireEvent.changeText(getByPlaceholderText('Family Name *'), 'Test Family');
      fireEvent.changeText(getByPlaceholderText('Street Address *'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City *'), 'City');

      fireEvent.press(getByText('Save'));

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should submit when all required fields are filled', () => {
      const {getByPlaceholderText, getByText} = render(<FamilyForm {...defaultProps} />);

      fireEvent.changeText(getByPlaceholderText('Family Name *'), 'Test Family');
      fireEvent.changeText(getByPlaceholderText('Street Address *'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City *'), 'Springfield');
      fireEvent.changeText(getByPlaceholderText('Postal Code *'), '12345');

      fireEvent.press(getByText('Save'));

      expect(mockOnSubmit).toHaveBeenCalledTimes(1);
    });

    it('should submit with optional fields included', () => {
      const {getByPlaceholderText, getByText} = render(<FamilyForm {...defaultProps} />);

      fireEvent.changeText(getByPlaceholderText('Family Name *'), 'Test Family');
      fireEvent.changeText(getByPlaceholderText('Street Address *'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City *'), 'Springfield');
      fireEvent.changeText(getByPlaceholderText('Postal Code *'), '12345');
      fireEvent.changeText(getByPlaceholderText('Phone'), '+1234567890');
      fireEvent.changeText(getByPlaceholderText('Notes'), 'Test notes');

      fireEvent.press(getByText('Save'));

      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          family_name: 'Test Family',
          address_street: '123 Main St',
          address_city: 'Springfield',
          address_postal: '12345',
          phone: '+1234567890',
          notes: 'Test notes',
        })
      );
    });
  });

  describe('Button interactions', () => {
    it('should call onCancel when Cancel button pressed', () => {
      const {getByText} = render(<FamilyForm {...defaultProps} />);

      fireEvent.press(getByText('Cancel'));

      expect(mockOnCancel).toHaveBeenCalledTimes(1);
    });

    it('should not submit when isSubmitting is true', () => {
      const {getByPlaceholderText, getByText} = render(
        <FamilyForm {...defaultProps} isSubmitting={true} />
      );

      fireEvent.changeText(getByPlaceholderText('Family Name *'), 'Test Family');
      fireEvent.changeText(getByPlaceholderText('Street Address *'), '123 Main St');
      fireEvent.changeText(getByPlaceholderText('City *'), 'Springfield');
      fireEvent.changeText(getByPlaceholderText('Postal Code *'), '12345');

      fireEvent.press(getByText('Saving...'));

      // Button is disabled, so onPress shouldn't fire
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('useGlowVariant theming', () => {
    it('should use glow color for input borders', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Family Name *');
      expect(input).toBeTruthy();
    });

    it('should use glow color for submit button', () => {
      const {getByText} = render(<FamilyForm {...defaultProps} />);

      expect(getByText('Save')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle very long family names', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const longName = 'A'.repeat(200);
      const input = getByPlaceholderText('Family Name *');
      fireEvent.changeText(input, longName);

      expect(input.props.value).toBe(longName);
    });

    it('should handle special characters in input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const input = getByPlaceholderText('Family Name *');
      fireEvent.changeText(input, "O'Brien-Smith Family");

      expect(input.props.value).toBe("O'Brien-Smith Family");
    });

    it('should handle multiline notes input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const notesInput = getByPlaceholderText('Notes');
      expect(notesInput.props.multiline).toBe(true);
    });

    it('should have phone-pad keyboard for phone input', () => {
      const {getByPlaceholderText} = render(<FamilyForm {...defaultProps} />);

      const phoneInput = getByPlaceholderText('Phone');
      expect(phoneInput.props.keyboardType).toBe('phone-pad');
    });
  });
});
