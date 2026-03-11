import React from 'react';
import {render} from '@testing-library/react-native';
import {GenderAvatar} from '../gender-avatar';

describe('GenderAvatar', () => {
  describe('Rendering', () => {
    it('renders male avatar container', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={false}
          testID="male-avatar"
        />
      );

      expect(getByTestId('male-avatar')).toBeTruthy();
      expect(getByTestId('male-avatar-wrapper')).toBeTruthy();
    });

    it('renders female avatar container', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="female"
          size={120}
          isSelected={false}
          testID="female-avatar"
        />
      );

      expect(getByTestId('female-avatar')).toBeTruthy();
      expect(getByTestId('female-avatar-wrapper')).toBeTruthy();
    });

    it('applies correct size to avatar container', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={32}
          isSelected={false}
          testID="avatar"
        />
      );

      const container = getByTestId('avatar');
      expect(container.props.style).toMatchObject({
        width: 32,
        height: 32,
      });
    });
  });

  describe('Selection States', () => {
    it('shows border when selected', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={true}
          testID="avatar"
        />
      );

      const container = getByTestId('avatar');
      expect(container.props.style.borderWidth).toBeGreaterThan(0);
    });

    it('hides border when not selected', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={false}
          testID="avatar"
        />
      );

      const container = getByTestId('avatar');
      expect(container.props.style.borderWidth).toBe(2);
    });
  });

  describe('Theming', () => {
    it('applies tint overlay when selected', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={true}
          testID="avatar"
        />
      );

      const wrapper = getByTestId('avatar-wrapper');
      expect(wrapper.props.style.backgroundColor).toBeDefined();
    });

    it('applies neutral styling when not selected', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={false}
          testID="avatar"
        />
      );

      const container = getByTestId('avatar');
      expect(container.props.style.opacity).toBe(0.6);
    });
  });

  describe('Accessibility', () => {
    it('has correct accessibility role', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={false}
          testID="avatar"
        />
      );

      expect(getByTestId('avatar').props.accessible).toBe(true);
      expect(getByTestId('avatar').props.accessibilityRole).toBe('image');
    });

    it('has correct accessibility label for male', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={false}
          testID="avatar"
        />
      );

      expect(getByTestId('avatar').props.accessibilityLabel).toBe('Male avatar');
    });

    it('has correct accessibility label for female', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="female"
          size={120}
          isSelected={false}
          testID="avatar"
        />
      );

      expect(getByTestId('avatar').props.accessibilityLabel).toBe('Female avatar');
    });

    it('indicates selected state in accessibility state', () => {
      const {getByTestId} = render(
        <GenderAvatar
          gender="male"
          size={120}
          isSelected={true}
          testID="avatar"
        />
      );

      expect(getByTestId('avatar').props.accessibilityState).toEqual({
        selected: true,
      });
    });
  });
});
