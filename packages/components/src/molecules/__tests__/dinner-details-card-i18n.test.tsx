import React from 'react';
import {render} from '@testing-library/react-native';
import {DinnerDetailsCard} from '../dinner-details-card';

/**
 * TDD tests for DinnerDetailsCard i18n migration.
 *
 * Strings to migrate:
 * "Date:"             -> supper.dateLabel
 * "Meal Type:"        -> supper.mealTypeLabel
 * "Location:"         -> supper.locationLabel
 * "Description:"      -> supper.descriptionLabel
 * "Max Participants:" -> supper.maxParticipantsLabel
 */

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({t: mockT, i18n: {language: 'en', changeLanguage: jest.fn()}}),
}));

const mockDinner = {
    id: 1,
    dinnerDate: '2026-03-02',
    mealType: 'Dinner',
    location: 'Church Hall',
    description: 'Community dinner',
    maxParticipants: 50,
};

describe('DinnerDetailsCard - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("supper.dateLabel") instead of hardcoded "Date:"', () => {
        render(<DinnerDetailsCard dinner={mockDinner}/>);
        expect(mockT).toHaveBeenCalledWith('supper.dateLabel');
    });

    it('should use t("supper.mealTypeLabel") instead of hardcoded "Meal Type:"', () => {
        render(<DinnerDetailsCard dinner={mockDinner}/>);
        expect(mockT).toHaveBeenCalledWith('supper.mealTypeLabel');
    });

    it('should use t("supper.locationLabel") instead of hardcoded "Location:"', () => {
        render(<DinnerDetailsCard dinner={mockDinner}/>);
        expect(mockT).toHaveBeenCalledWith('supper.locationLabel');
    });

    it('should use t("supper.descriptionLabel") instead of hardcoded "Description:"', () => {
        render(<DinnerDetailsCard dinner={mockDinner}/>);
        expect(mockT).toHaveBeenCalledWith('supper.descriptionLabel');
    });

    it('should use t("supper.maxParticipantsLabel") instead of hardcoded "Max Participants:"', () => {
        render(<DinnerDetailsCard dinner={mockDinner}/>);
        expect(mockT).toHaveBeenCalledWith('supper.maxParticipantsLabel');
    });

    it('should not contain any hardcoded English label strings', () => {
        mockT.mockImplementation((key: string) => `__${key}__`);
        const {queryByText} = render(<DinnerDetailsCard dinner={mockDinner}/>);

        const hardcodedStrings = [
            'Date:',
            'Meal Type:',
            'Location:',
            'Description:',
            'Max Participants:',
        ];

        for (const str of hardcodedStrings) {
            expect(queryByText(str)).toBeNull();
        }
    });
});
