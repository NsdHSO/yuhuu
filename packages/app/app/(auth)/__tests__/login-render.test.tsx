import React from 'react';
import {render} from '@testing-library/react-native';
import {View} from 'react-native';
import LoginScreen from '../login';

jest.mock('expo-router', () => ({
  Stack: {Screen: () => null},
  useRouter: () => ({
    replace: jest.fn(),
  }),
}));

jest.mock('@/providers/AuthProvider', () => ({
  useAuth: () => ({
    signIn: jest.fn(),
    signInWithBiometrics: jest.fn(),
    status: 'idle',
  }),
}));

jest.mock('@yuhuu/auth', () => ({
  getBiometricPreference: jest.fn().mockResolvedValue(false),
  isBiometricAvailable: jest.fn().mockResolvedValue(false),
}));

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('LoginScreen', () => {
  it('should render with flex-1 style (not className) for iOS compatibility', () => {
    const {UNSAFE_root} = render(<LoginScreen />);

    // ThemedView renders as a View component - find the root View
    const allViews = UNSAFE_root.findAllByType(View);
    const rootView = allViews[0];

    expect(rootView.props.style).toBeDefined();
    // Style can be an array of style objects
    const styleArray = Array.isArray(rootView.props.style)
      ? rootView.props.style
      : [rootView.props.style];

    expect(styleArray).toEqual(
      expect.arrayContaining([expect.objectContaining({flex: 1})])
    );

    expect(rootView.props.className).toBeUndefined();
  });

  it('should render login form elements', () => {
    const {getByPlaceholderText, getByText} = render(<LoginScreen />);

    expect(getByPlaceholderText('auth.login.emailPlaceholder')).toBeTruthy();
    expect(getByPlaceholderText('auth.login.passwordPlaceholder')).toBeTruthy();
    expect(getByText('auth.login.submit')).toBeTruthy();
  });
});
