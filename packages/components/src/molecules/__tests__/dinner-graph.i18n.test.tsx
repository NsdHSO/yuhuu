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

describe('DinnerGraph - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.noStatsAvailable") for empty state', () => {
        render(<DinnerGraph/>);
        expect(mockT).toHaveBeenCalledWith('admin.noStatsAvailable');
    });

    it('should use t("admin.totalDinners") for total dinners label', () => {
        const data = {totalDinners: 10, totalParticipants: 50, averageAttendance: 5};
        render(<DinnerGraph data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.totalDinners');
    });

    it('should use t("admin.totalParticipants") for total participants label', () => {
        const data = {totalDinners: 10, totalParticipants: 50, averageAttendance: 5};
        render(<DinnerGraph data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.totalParticipants');
    });

    it('should use t("admin.averageAttendance") for average attendance label', () => {
        const data = {totalDinners: 10, totalParticipants: 50, averageAttendance: 5};
        render(<DinnerGraph data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.averageAttendance');
    });

    it('should not contain hardcoded English strings', () => {
        const data = {totalDinners: 10, totalParticipants: 50, averageAttendance: 5};
        const {queryByText} = render(<DinnerGraph data={data}/>);
        expect(queryByText('No dinner statistics available')).toBeNull();
        expect(queryByText('Total Dinners')).toBeNull();
        expect(queryByText('Total Participants')).toBeNull();
        expect(queryByText('Average Attendance')).toBeNull();
    });
});
