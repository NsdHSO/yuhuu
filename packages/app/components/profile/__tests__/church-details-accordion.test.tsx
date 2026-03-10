import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {ChurchDetailsAccordion} from '../church-details-accordion';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('react-native-safe-area-context', () => ({
    useSafeAreaInsets: () => ({top: 0, bottom: 34, left: 0, right: 0}),
}));

describe('ChurchDetailsAccordion', () => {
    const defaultProps = {
        churchName: 'Grace Community Church',
        memberSince: '2020-01-15',
        role: 'Deacon',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render the accordion with title', () => {
            const {getByText} = render(
                <ChurchDetailsAccordion {...defaultProps} />
            );

            expect(getByText('profile.churchDetails')).toBeTruthy();
        });

        it('should accept testID prop', () => {
            const {getByTestId} = render(
                <ChurchDetailsAccordion {...defaultProps} testID="church-details" />
            );

            expect(getByTestId('church-details-header')).toBeTruthy();
        });
    });

    describe('Expand/Collapse', () => {
        it('should be collapsed by default', () => {
            const {queryByText} = render(
                <ChurchDetailsAccordion {...defaultProps} />
            );

            expect(queryByText('Grace Community Church')).toBeNull();
        });

        it('should expand when header is pressed', () => {
            const {getByTestId, getByText} = render(
                <ChurchDetailsAccordion {...defaultProps} testID="church-details" />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(getByText('Grace Community Church')).toBeTruthy();
        });
    });

    describe('Content Display', () => {
        it('should display church name when expanded', () => {
            const {getByTestId, getByText} = render(
                <ChurchDetailsAccordion {...defaultProps} testID="church-details" />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(getByText('Grace Community Church')).toBeTruthy();
        });

        it('should display member since date when expanded', () => {
            const {getByTestId, getByText} = render(
                <ChurchDetailsAccordion {...defaultProps} testID="church-details" />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(getByText('2020-01-15')).toBeTruthy();
        });

        it('should display role when expanded', () => {
            const {getByTestId, getByText} = render(
                <ChurchDetailsAccordion {...defaultProps} testID="church-details" />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(getByText('Deacon')).toBeTruthy();
        });
    });

    describe('Optional Fields', () => {
        it('should handle missing role gracefully', () => {
            const {getByTestId, queryByTestId} = render(
                <ChurchDetailsAccordion
                    churchName="Test Church"
                    memberSince="2023-01-01"
                    testID="church-details"
                />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(queryByTestId('church-details-role')).toBeNull();
        });

        it('should handle missing memberSince gracefully', () => {
            const {getByTestId, queryByTestId} = render(
                <ChurchDetailsAccordion
                    churchName="Test Church"
                    testID="church-details"
                />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(queryByTestId('church-details-member-since')).toBeNull();
        });

        it('should show empty state when no church name', () => {
            const {getByTestId, getByText} = render(
                <ChurchDetailsAccordion testID="church-details" />
            );

            fireEvent.press(getByTestId('church-details-header'));
            expect(getByText('profile.noChurchDetails')).toBeTruthy();
        });
    });
});
