import React from 'react';
import {render} from '@testing-library/react-native';
import {DinnerGraph} from '../dinner-graph';

const mockT = jest.fn((key: string) => `__${key}__`);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({t: mockT, i18n: {language: 'en', changeLanguage: jest.fn()}}),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

describe('DinnerGraph Molecule Component', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('Rendering without data', () => {
        it('should render empty state when no data is provided', () => {
            const {getByText} = render(<DinnerGraph/>);
            expect(getByText('__admin.noStatsAvailable__')).toBeTruthy();
        });

        it('should render with testID when provided', () => {
            const {getByTestId} = render(<DinnerGraph testID="dinner-graph"/>);
            expect(getByTestId('dinner-graph')).toBeTruthy();
        });
    });

    describe('Rendering with data', () => {
        const mockData = {
            totalDinners: 10,
            totalParticipants: 50,
            averageAttendance: 5,
        };

        it('should render total dinners stat', () => {
            const {getByText} = render(<DinnerGraph data={mockData}/>);
            expect(getByText('__admin.totalDinners__')).toBeTruthy();
            expect(getByText('10')).toBeTruthy();
        });

        it('should render total participants stat', () => {
            const {getByText} = render(<DinnerGraph data={mockData}/>);
            expect(getByText('__admin.totalParticipants__')).toBeTruthy();
            expect(getByText('50')).toBeTruthy();
        });

        it('should render average attendance stat', () => {
            const {getByText} = render(<DinnerGraph data={mockData}/>);
            expect(getByText('__admin.averageAttendance__')).toBeTruthy();
            expect(getByText('5')).toBeTruthy();
        });

        it('should render with testID when data is provided', () => {
            const {getByTestId} = render(<DinnerGraph testID="dinner-graph" data={mockData}/>);
            expect(getByTestId('dinner-graph')).toBeTruthy();
        });
    });

    describe('i18n integration', () => {
        it('should call translation for empty state', () => {
            render(<DinnerGraph/>);
            expect(mockT).toHaveBeenCalledWith('admin.noStatsAvailable');
        });

        it('should call translations for all stat labels', () => {
            const data = {totalDinners: 1, totalParticipants: 2, averageAttendance: 3};
            render(<DinnerGraph data={data}/>);
            expect(mockT).toHaveBeenCalledWith('admin.totalDinners');
            expect(mockT).toHaveBeenCalledWith('admin.totalParticipants');
            expect(mockT).toHaveBeenCalledWith('admin.averageAttendance');
        });
    });
});
