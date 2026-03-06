import React from 'react';
import {render} from '@testing-library/react-native';
import {DinnerDetailsCard} from '../dinner-details-card';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

const fullDinner = {
    id: 1,
    dinnerDate: '2026-03-02',
    mealType: 'Dinner',
    location: 'Church Hall',
    description: 'Community dinner',
    maxParticipants: 50,
    recordedBy: 'admin',
    uuid: 'abc-123',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
};

const minimalDinner = {
    id: 2,
    dinnerDate: '2026-03-10',
    mealType: 'Lunch',
    uuid: 'def-456',
    createdAt: '2026-03-01T00:00:00Z',
    updatedAt: '2026-03-01T00:00:00Z',
};

describe('DinnerDetailsCard Molecule Component', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('Required Fields', () => {
        it('should render dinner date', () => {
            const {getByText} = render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(getByText('2026-03-02')).toBeTruthy();
        });

        it('should render meal type', () => {
            const {getByText} = render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(getByText('Dinner')).toBeTruthy();
        });

        it('should render date label', () => {
            render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(mockT).toHaveBeenCalledWith('supper.dateLabel');
        });

        it('should render meal type label', () => {
            render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(mockT).toHaveBeenCalledWith('supper.mealTypeLabel');
        });
    });

    describe('Optional Fields - Present', () => {
        it('should render location when provided', () => {
            const {getByText} = render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(getByText('Church Hall')).toBeTruthy();
        });

        it('should render description when provided', () => {
            const {getByText} = render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(getByText('Community dinner')).toBeTruthy();
        });

        it('should render max participants when provided', () => {
            const {getByText} = render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(getByText('50')).toBeTruthy();
        });

        it('should render location label when location exists', () => {
            render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(mockT).toHaveBeenCalledWith('supper.locationLabel');
        });

        it('should render description label when description exists', () => {
            render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(mockT).toHaveBeenCalledWith('supper.descriptionLabel');
        });

        it('should render max participants label when maxParticipants exists', () => {
            render(<DinnerDetailsCard dinner={fullDinner}/>);
            expect(mockT).toHaveBeenCalledWith('supper.maxParticipantsLabel');
        });
    });

    describe('Optional Fields - Absent', () => {
        it('should not render location when not provided', () => {
            const {queryByText} = render(<DinnerDetailsCard dinner={minimalDinner}/>);
            expect(queryByText('Church Hall')).toBeNull();
        });

        it('should not render description when not provided', () => {
            const {queryByText} = render(<DinnerDetailsCard dinner={minimalDinner}/>);
            expect(queryByText('Community dinner')).toBeNull();
        });

        it('should not render max participants when not provided', () => {
            const {queryByText} = render(<DinnerDetailsCard dinner={minimalDinner}/>);
            expect(queryByText('50')).toBeNull();
        });

        it('should not call location label translation when location is absent', () => {
            render(<DinnerDetailsCard dinner={minimalDinner}/>);
            expect(mockT).not.toHaveBeenCalledWith('supper.locationLabel');
        });

        it('should not call description label translation when description is absent', () => {
            render(<DinnerDetailsCard dinner={minimalDinner}/>);
            expect(mockT).not.toHaveBeenCalledWith('supper.descriptionLabel');
        });

        it('should not call maxParticipants label translation when absent', () => {
            render(<DinnerDetailsCard dinner={minimalDinner}/>);
            expect(mockT).not.toHaveBeenCalledWith('supper.maxParticipantsLabel');
        });
    });

    describe('Null Optional Fields', () => {
        it('should not render location when null', () => {
            const dinner = {...fullDinner, location: null};
            render(<DinnerDetailsCard dinner={dinner}/>);
            expect(mockT).not.toHaveBeenCalledWith('supper.locationLabel');
        });

        it('should not render description when null', () => {
            const dinner = {...fullDinner, description: null};
            render(<DinnerDetailsCard dinner={dinner}/>);
            expect(mockT).not.toHaveBeenCalledWith('supper.descriptionLabel');
        });

        it('should not render max participants when null', () => {
            const dinner = {...fullDinner, maxParticipants: null};
            render(<DinnerDetailsCard dinner={dinner}/>);
            expect(mockT).not.toHaveBeenCalledWith('supper.maxParticipantsLabel');
        });
    });
});
