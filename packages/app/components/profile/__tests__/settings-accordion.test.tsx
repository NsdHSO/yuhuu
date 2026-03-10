import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {SettingsAccordion} from '../settings-accordion';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 0, bottom: 34, left: 0, right: 0}),
}));

jest.mock('@yuhuu/components', () => ({
    ...jest.requireActual('@yuhuu/components'),
    LanguagePicker: () => {
        const R = require('react');
        return R.createElement('View', {testID: 'language-picker'});
    },
}));

describe('SettingsAccordion', () => {
    const defaultProps = {
        biometricAvailable: true,
        biometricEnabled: false,
        onBiometricToggle: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the accordion with title', () => {
            const {getByText} = render(
                <SettingsAccordion {...defaultProps} />
            );

            expect(getByText('profile.settings')).toBeTruthy();
        });

        it('should accept testID prop', () => {
            const {getByTestId} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            expect(getByTestId('settings-header')).toBeTruthy();
        });
    });

    describe('Expand/Collapse', () => {
        it('should be collapsed by default', () => {
            const {queryByTestId} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            expect(queryByTestId('language-picker')).toBeNull();
        });

        it('should expand when header is pressed', () => {
            const {getByTestId} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            fireEvent.press(getByTestId('settings-header'));
            expect(getByTestId('language-picker')).toBeTruthy();
        });
    });

    describe('Language Picker', () => {
        it('should render language picker when expanded', () => {
            const {getByTestId} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            fireEvent.press(getByTestId('settings-header'));
            expect(getByTestId('language-picker')).toBeTruthy();
        });
    });

    describe('Biometric Toggle', () => {
        it('should show biometric section when biometric is available', () => {
            const {getByTestId, getByText} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            fireEvent.press(getByTestId('settings-header'));
            expect(getByTestId('settings-biometric-toggle')).toBeTruthy();
        });

        it('should hide biometric section when biometric is unavailable', () => {
            const {getByTestId, queryByTestId} = render(
                <SettingsAccordion
                    {...defaultProps}
                    biometricAvailable={false}
                    testID="settings"
                />
            );

            fireEvent.press(getByTestId('settings-header'));
            expect(queryByTestId('settings-biometric-toggle')).toBeNull();
        });

        it('should call onBiometricToggle when switch is toggled', () => {
            const onToggle = jest.fn();
            const {getByTestId} = render(
                <SettingsAccordion
                    {...defaultProps}
                    onBiometricToggle={onToggle}
                    testID="settings"
                />
            );

            fireEvent.press(getByTestId('settings-header'));
            fireEvent(getByTestId('settings-biometric-toggle'), 'valueChange', true);
            expect(onToggle).toHaveBeenCalledWith(true);
        });

        it('should reflect biometricEnabled state', () => {
            const {getByTestId} = render(
                <SettingsAccordion
                    {...defaultProps}
                    biometricEnabled={true}
                    testID="settings"
                />
            );

            fireEvent.press(getByTestId('settings-header'));
            expect(getByTestId('settings-biometric-toggle').props.value).toBe(true);
        });
    });

    describe('Glow Variant Picker', () => {
        it('should render glow variant options when expanded', () => {
            const {getByTestId, getByText} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            fireEvent.press(getByTestId('settings-header'));
            expect(getByText('profile.glowTheme')).toBeTruthy();
        });

        it('should render all glow variant options', () => {
            const {getByTestId} = render(
                <SettingsAccordion {...defaultProps} testID="settings" />
            );

            fireEvent.press(getByTestId('settings-header'));

            expect(getByTestId('settings-glow-subtle')).toBeTruthy();
            expect(getByTestId('settings-glow-vibrant')).toBeTruthy();
            expect(getByTestId('settings-glow-warm')).toBeTruthy();
            expect(getByTestId('settings-glow-cool')).toBeTruthy();
        });
    });
});
