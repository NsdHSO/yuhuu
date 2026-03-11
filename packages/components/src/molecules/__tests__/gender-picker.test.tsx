import React from 'react';
import {render, fireEvent, waitFor} from '@testing-library/react-native';
import {GenderPicker} from '../gender-picker';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        'genderPicker.placeholder': 'Select Gender',
        'genderPicker.male': 'Male',
        'genderPicker.female': 'Female',
        'genderPicker.modalTitle': 'Select Your Gender',
      };
      return translations[key] || key;
    },
  }),
}));

describe('GenderPicker', () => {
  describe('Rendering', () => {
    it('renders trigger button with selected value', () => {
      const {getByTestId, getByText} = render(
        <GenderPicker
          value="male"
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      expect(getByTestId('gender-picker-trigger')).toBeTruthy();
      expect(getByText('Male')).toBeTruthy();
    });

    it('renders placeholder when value is null', () => {
      const {getByText} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      expect(getByText('Select Gender')).toBeTruthy();
    });

    it('shows correct avatar in trigger for male', () => {
      const {getByTestId} = render(
        <GenderPicker
          value="male"
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      expect(getByTestId('gender-picker-trigger-avatar')).toBeTruthy();
    });

    it('shows correct avatar in trigger for female', () => {
      const {getByTestId} = render(
        <GenderPicker
          value="female"
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      expect(getByTestId('gender-picker-trigger-avatar')).toBeTruthy();
    });

    it('does not show avatar when value is null', () => {
      const {queryByTestId} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      expect(queryByTestId('gender-picker-trigger-avatar')).toBeNull();
    });
  });

  describe('Modal Interaction', () => {
    it('opens modal on trigger press', async () => {
      const {getByTestId, getByText} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      const trigger = getByTestId('gender-picker-trigger');
      fireEvent.press(trigger);

      await waitFor(() => {
        expect(getByText('Select Your Gender')).toBeTruthy();
      });
    });

    it('shows both avatars in modal', async () => {
      const {getByTestId} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        expect(getByTestId('gender-picker-modal-male')).toBeTruthy();
        expect(getByTestId('gender-picker-modal-female')).toBeTruthy();
      });
    });

    it('highlights selected avatar in modal', async () => {
      const {getByTestId} = render(
        <GenderPicker
          value="male"
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        const maleAvatar = getByTestId('gender-picker-modal-male');
        expect(maleAvatar.props.isSelected).toBe(true);
      });
    });

    it('calls onChange when avatar selected', async () => {
      const onChange = jest.fn();
      const {getByTestId} = render(
        <GenderPicker
          value={null}
          onChange={onChange}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        expect(getByTestId('gender-picker-modal-male')).toBeTruthy();
      });

      fireEvent.press(getByTestId('gender-picker-modal-male-button'));

      expect(onChange).toHaveBeenCalledWith('male');
    });

    it('closes modal after selection', async () => {
      const {getByTestId, queryByText} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        expect(getByTestId('gender-picker-modal-male-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('gender-picker-modal-male-button'));

      await waitFor(() => {
        expect(queryByText('Select Your Gender')).toBeNull();
      });
    });

    it('closes modal on backdrop press', async () => {
      const {getByTestId, queryByText} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        expect(getByTestId('gender-picker-modal')).toBeTruthy();
      });

      fireEvent.press(getByTestId('gender-picker-modal-backdrop'));

      await waitFor(() => {
        expect(queryByText('Select Your Gender')).toBeNull();
      });
    });

    it('does not call onChange when same avatar tapped', async () => {
      const onChange = jest.fn();
      const {getByTestId} = render(
        <GenderPicker
          value="male"
          onChange={onChange}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        expect(getByTestId('gender-picker-modal-male-button')).toBeTruthy();
      });

      fireEvent.press(getByTestId('gender-picker-modal-male-button'));

      expect(onChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('trigger has correct accessibility role', () => {
      const {getByTestId} = render(
        <GenderPicker
          value="male"
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      const trigger = getByTestId('gender-picker-trigger');
      expect(trigger.props.accessibilityRole).toBe('button');
    });

    it('trigger has correct accessibility label with value', () => {
      const {getByTestId} = render(
        <GenderPicker
          value="male"
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      const trigger = getByTestId('gender-picker-trigger');
      expect(trigger.props.accessibilityLabel).toContain('Male');
      expect(trigger.props.accessibilityLabel).toContain('Tap to change');
    });

    it('trigger has correct accessibility label without value', () => {
      const {getByTestId} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      const trigger = getByTestId('gender-picker-trigger');
      expect(trigger.props.accessibilityLabel).toContain('Select Gender');
      expect(trigger.props.accessibilityLabel).toContain('Tap to select');
    });

    it('modal avatar buttons have radio role', async () => {
      const {getByTestId} = render(
        <GenderPicker
          value={null}
          onChange={jest.fn()}
          testID="gender-picker"
        />
      );

      fireEvent.press(getByTestId('gender-picker-trigger'));

      await waitFor(() => {
        const maleButton = getByTestId('gender-picker-modal-male-button');
        expect(maleButton.props.accessibilityRole).toBe('radio');
      });
    });
  });
});
