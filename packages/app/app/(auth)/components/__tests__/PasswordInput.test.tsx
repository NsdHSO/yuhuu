import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {PasswordInput} from '../PasswordInput';

describe('PasswordInput', () => {
  it('renders password input in hidden mode by default', () => {
    const {getByTestId} = render(
      <PasswordInput
        value=""
        onChangeText={() => {}}
        placeholder="Enter password"
        testID="password-input"
      />
    );

    const input = getByTestId('password-input');
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('toggles password visibility when eye icon is pressed', () => {
    const {getByTestId} = render(
      <PasswordInput
        value="secret123"
        onChangeText={() => {}}
        placeholder="Enter password"
        testID="password-input"
      />
    );

    const input = getByTestId('password-input');
    const toggleButton = getByTestId('password-input-toggle');

    // Initially hidden
    expect(input.props.secureTextEntry).toBe(true);

    // Press toggle button
    fireEvent.press(toggleButton);

    // Now visible
    expect(input.props.secureTextEntry).toBe(false);

    // Press again to hide
    fireEvent.press(toggleButton);
    expect(input.props.secureTextEntry).toBe(true);
  });

  it('shows eye-off icon when password is hidden', () => {
    const {getByTestId} = render(
      <PasswordInput
        value=""
        onChangeText={() => {}}
        testID="password-input"
      />
    );

    const icon = getByTestId('password-input-icon');
    expect(icon.props.name).toBe('visibility-off');
  });

  it('shows eye icon when password is visible', () => {
    const {getByTestId} = render(
      <PasswordInput
        value=""
        onChangeText={() => {}}
        testID="password-input"
      />
    );

    const toggleButton = getByTestId('password-input-toggle');

    // Toggle to visible
    fireEvent.press(toggleButton);

    const icon = getByTestId('password-input-icon');
    expect(icon.props.name).toBe('visibility');
  });

  it('calls onChangeText when text changes', () => {
    const mockOnChangeText = jest.fn();
    const {getByTestId} = render(
      <PasswordInput
        value=""
        onChangeText={mockOnChangeText}
        testID="password-input"
      />
    );

    const input = getByTestId('password-input');
    fireEvent.changeText(input, 'newpassword');

    expect(mockOnChangeText).toHaveBeenCalledWith('newpassword');
  });

  it('passes through autoCapitalize and autoCorrect props', () => {
    const {getByTestId} = render(
      <PasswordInput
        value=""
        onChangeText={() => {}}
        autoCapitalize="none"
        autoCorrect={false}
        testID="password-input"
      />
    );

    const input = getByTestId('password-input');
    expect(input.props.autoCapitalize).toBe('none');
    expect(input.props.autoCorrect).toBe(false);
  });

  it('passes through textContentType and autoComplete props', () => {
    const {getByTestId} = render(
      <PasswordInput
        value=""
        onChangeText={() => {}}
        textContentType="password"
        autoComplete="password"
        testID="password-input"
      />
    );

    const input = getByTestId('password-input');
    expect(input.props.textContentType).toBe('password');
    expect(input.props.autoComplete).toBe('password');
  });
});
