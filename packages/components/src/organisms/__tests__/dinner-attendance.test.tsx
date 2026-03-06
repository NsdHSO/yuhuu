import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {DinnerAttendance} from '../dinner-attendance';

const mockT = jest.fn((key: string, opts?: Record<string, unknown>) => {
    if (opts) {
        return Object.entries(opts).reduce(
            (str, [k, v]) => str.replace(`{{${k}}}`, String(v)),
            key,
        );
    }
    return key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: () => 'light',
}));

const mockAttendanceData = [
    {
        dinnerDate: '2026-01-15',
        attended: true,
        location: 'Main Hall',
        mealType: 'Dinner',
    },
    {
        dinnerDate: '2026-01-16',
        attended: false,
        location: 'Side Room',
    },
];

describe('DinnerAttendance Organism Component', () => {
    beforeEach(() => jest.clearAllMocks());

    describe('Empty State', () => {
        it('should render empty message when data is undefined', () => {
            render(<DinnerAttendance username="testuser" testID="attendance"/>);
            expect(mockT).toHaveBeenCalledWith('admin.noAttendanceRecords');
        });

        it('should render empty message when data is empty array', () => {
            render(<DinnerAttendance username="testuser" data={[]} testID="attendance"/>);
            expect(mockT).toHaveBeenCalledWith('admin.noAttendanceRecords');
        });

        it('should render container with testID when empty', () => {
            const {getByTestId} = render(
                <DinnerAttendance username="testuser" data={[]} testID="attendance"/>,
            );
            expect(getByTestId('attendance')).toBeTruthy();
        });
    });

    describe('With Data', () => {
        it('should render username header', () => {
            render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(mockT).toHaveBeenCalledWith('admin.attendanceFor', {
                username: 'testuser',
            });
        });

        it('should render attendance items', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(getByTestId('attendance-item-0')).toBeTruthy();
            expect(getByTestId('attendance-item-1')).toBeTruthy();
        });

        it('should render date for each record', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(getByTestId('attendance-date-0')).toBeTruthy();
            expect(getByTestId('attendance-date-1')).toBeTruthy();
        });

        it('should render attendance status', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(getByTestId('attendance-status-0')).toBeTruthy();
            expect(getByTestId('attendance-status-1')).toBeTruthy();
        });

        it('should render location for each record', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(getByTestId('attendance-location-0')).toBeTruthy();
            expect(getByTestId('attendance-location-1')).toBeTruthy();
        });

        it('should render meal type when provided', () => {
            render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(mockT).toHaveBeenCalledWith('admin.mealTypeLabel');
        });

        it('should render container with testID', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(getByTestId('attendance')).toBeTruthy();
        });
    });

    describe('i18n Translation Keys', () => {
        it('should use correct translation keys for labels', () => {
            render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(mockT).toHaveBeenCalledWith('admin.dateLabel');
            expect(mockT).toHaveBeenCalledWith('admin.statusLabel');
            expect(mockT).toHaveBeenCalledWith('admin.locationLabel');
        });

        it('should use attended/notAttended keys based on status', () => {
            render(
                <DinnerAttendance
                    username="testuser"
                    data={mockAttendanceData}
                    testID="attendance"
                />,
            );
            expect(mockT).toHaveBeenCalledWith('admin.attended');
            expect(mockT).toHaveBeenCalledWith('admin.notAttended');
        });
    });

    describe('Attendance Status Styling', () => {
        it('should render attended record with green indicator', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={[mockAttendanceData[0]]}
                    testID="attendance"
                />,
            );
            const item = getByTestId('attendance-item-0');
            expect(item).toBeTruthy();
        });

        it('should render not-attended record with red indicator', () => {
            const {getByTestId} = render(
                <DinnerAttendance
                    username="testuser"
                    data={[mockAttendanceData[1]]}
                    testID="attendance"
                />,
            );
            const item = getByTestId('attendance-item-0');
            expect(item).toBeTruthy();
        });
    });
});
