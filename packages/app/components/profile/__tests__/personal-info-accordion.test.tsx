import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {PersonalInfoAccordion} from '../personal-info-accordion';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 0, bottom: 34, left: 0, right: 0}),
}));

describe('PersonalInfoAccordion', () => {
    const defaultProps = {
        firstName: 'John',
        lastName: 'Doe',
        phone: '555-1234',
        onFirstNameChange: jest.fn(),
        onLastNameChange: jest.fn(),
        onPhoneChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the accordion with title', () => {
            const {getByText} = render(
                <PersonalInfoAccordion {...defaultProps} />
            );

            expect(getByText('profile.personalInfo')).toBeTruthy();
        });

        it('should accept testID prop and apply to header', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            expect(getByTestId('personal-info-header')).toBeTruthy();
        });
    });

    describe('Expand/Collapse', () => {
        it('should be expanded by default', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            expect(getByTestId('personal-info-first-name')).toBeTruthy();
        });

        it('should collapse when header is pressed', () => {
            const {getByTestId, queryByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            fireEvent.press(getByTestId('personal-info-header'));
            expect(queryByTestId('personal-info-first-name')).toBeNull();
        });
    });

    describe('Input Fields', () => {
        it('should render first name input with value', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            const input = getByTestId('personal-info-first-name');
            expect(input.props.value).toBe('John');
        });

        it('should render last name input with value', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            const input = getByTestId('personal-info-last-name');
            expect(input.props.value).toBe('Doe');
        });

        it('should render phone input with value', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            const input = getByTestId('personal-info-phone');
            expect(input.props.value).toBe('555-1234');
        });

        it('should call onFirstNameChange when first name changes', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            fireEvent.changeText(getByTestId('personal-info-first-name'), 'Jane');
            expect(defaultProps.onFirstNameChange).toHaveBeenCalledWith('Jane');
        });

        it('should call onLastNameChange when last name changes', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            fireEvent.changeText(getByTestId('personal-info-last-name'), 'Smith');
            expect(defaultProps.onLastNameChange).toHaveBeenCalledWith('Smith');
        });

        it('should call onPhoneChange when phone changes', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion {...defaultProps} testID="personal-info" />
            );

            fireEvent.changeText(getByTestId('personal-info-phone'), '555-5678');
            expect(defaultProps.onPhoneChange).toHaveBeenCalledWith('555-5678');
        });
    });

    describe('Empty Values', () => {
        it('should handle empty string values', () => {
            const {getByTestId} = render(
                <PersonalInfoAccordion
                    firstName=""
                    lastName=""
                    phone=""
                    onFirstNameChange={jest.fn()}
                    onLastNameChange={jest.fn()}
                    onPhoneChange={jest.fn()}
                    testID="personal-info"
                />
            );

            expect(getByTestId('personal-info-first-name').props.value).toBe('');
            expect(getByTestId('personal-info-last-name').props.value).toBe('');
            expect(getByTestId('personal-info-phone').props.value).toBe('');
        });
    });
});
