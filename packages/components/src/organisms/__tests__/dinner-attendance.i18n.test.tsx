import React from 'react';
import {render} from '@testing-library/react-native';
import {DinnerAttendance} from '../dinner-attendance';

const mockT = jest.fn((key: string, opts?: Record<string, unknown>) => {
    if (opts && opts.count !== undefined) return `__${key}__${opts.count}`;
    return `__${key}__`;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({t: mockT, i18n: {language: 'en', changeLanguage: jest.fn()}}),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

describe('DinnerAttendance - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.noAttendanceRecords") for empty state', () => {
        render(<DinnerAttendance username="testuser" data={[]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.noAttendanceRecords');
    });

    it('should use t("admin.attendanceFor") for attendance header', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.attendanceFor', {username: 'testuser'});
    });

    it('should use t("admin.dateLabel") for date labels', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.dateLabel');
    });

    it('should use t("admin.statusLabel") for status labels', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.statusLabel');
    });

    it('should use t("admin.attended") for attended status', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.attended');
    });

    it('should use t("admin.notAttended") for not attended status', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: false, location: 'Hall A'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.notAttended');
    });

    it('should use t("admin.locationLabel") for location labels', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.locationLabel');
    });

    it('should use t("admin.mealTypeLabel") for meal type labels', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A', mealType: 'Dinner'},
        ];
        render(<DinnerAttendance username="testuser" data={data}/>);
        expect(mockT).toHaveBeenCalledWith('admin.mealTypeLabel');
    });

    it('should not contain hardcoded English strings', () => {
        const data = [
            {dinnerDate: '2026-01-01', attended: true, location: 'Hall A', mealType: 'Dinner'},
        ];
        const {queryByText} = render(<DinnerAttendance username="testuser" data={data}/>);
        expect(queryByText('Attendance for:')).toBeNull();
        expect(queryByText('Date:')).toBeNull();
        expect(queryByText('Status:')).toBeNull();
        expect(queryByText('Attended')).toBeNull();
        expect(queryByText('Location:')).toBeNull();
        expect(queryByText('Meal Type:')).toBeNull();
    });
});
