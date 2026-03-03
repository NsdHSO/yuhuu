/**
 * TDD tests for admin sub-component i18n migration.
 *
 * DinnerAttendance (7 strings):
 *   "No attendance records found for this user" -> admin.noAttendanceRecords
 *   "Attendance for:"                           -> admin.attendanceFor
 *   "Date:"                                     -> admin.dateLabel
 *   "Status:"                                   -> admin.statusLabel
 *   "Attended" / "Not Attended"                  -> admin.attended / admin.notAttended
 *   "Location:"                                 -> admin.locationLabel
 *   "Meal Type:"                                -> admin.mealTypeLabel
 *
 * DinnerGraph (4 strings):
 *   "No dinner statistics available"             -> admin.noStatsAvailable
 *   "Total Dinners"                              -> admin.totalDinners
 *   "Total Participants"                         -> admin.totalParticipants
 *   "Average Attendance"                         -> admin.averageAttendance
 *
 * ParticipantsList (5 strings):
 *   "No participants found for this dinner"      -> admin.noParticipantsFound
 *   "Username:"                                  -> admin.usernameLabel
 *   "Notes:"                                     -> admin.notesLabel
 *   "Added:"                                     -> admin.addedLabel
 *   "Total: X participant(s)"                    -> admin.participantCount (with i18next count)
 */

import React from 'react';
import {render} from '@testing-library/react-native';
import {DinnerAttendance} from '../dinner-attendance';
import {DinnerGraph} from '../dinner-graph';
import {ParticipantsList} from '../participants-list';
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

// --- DinnerAttendance ---

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

// --- DinnerGraph ---

describe('DinnerGraph - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.noStats") for empty state', () => {
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

// --- ParticipantsList ---

describe('ParticipantsList - i18n', () => {
    beforeEach(() => jest.clearAllMocks());

    it('should use t("admin.noParticipantsFound") for empty state', () => {
        render(<ParticipantsList participants={[]}/>);
        expect(mockT).toHaveBeenCalledWith('admin.noParticipantsFound');
    });

    it('should use t("admin.usernameLabel") for username labels', () => {
        const participants = [
            {
                id: 1,
                dinnerId: 1,
                username: 'john',
                notes: '',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
        ];
        render(<ParticipantsList participants={participants}/>);
        expect(mockT).toHaveBeenCalledWith('admin.usernameLabel');
    });

    it('should use t("admin.notesLabel") for notes labels', () => {
        const participants = [
            {
                id: 1,
                dinnerId: 1,
                username: 'john',
                notes: 'Some note',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
        ];
        render(<ParticipantsList participants={participants}/>);
        expect(mockT).toHaveBeenCalledWith('admin.notesLabel');
    });

    it('should use t("admin.addedLabel") for added date labels', () => {
        const participants = [
            {
                id: 1,
                dinnerId: 1,
                username: 'john',
                notes: '',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
        ];
        render(<ParticipantsList participants={participants}/>);
        expect(mockT).toHaveBeenCalledWith('admin.addedLabel');
    });

    it('should use t("admin.participantCount") for total count', () => {
        const participants = [
            {
                id: 1,
                dinnerId: 1,
                username: 'john',
                notes: '',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
        ];
        render(<ParticipantsList participants={participants}/>);
        expect(mockT).toHaveBeenCalledWith('admin.participantCount', {count: 1});
    });

    it('should pass correct count for multiple participants', () => {
        const participants = [
            {
                id: 1,
                dinnerId: 1,
                username: 'john',
                notes: '',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
            {
                id: 2,
                dinnerId: 1,
                username: 'jane',
                notes: '',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
            {
                id: 3,
                dinnerId: 1,
                username: 'bob',
                notes: '',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
        ];
        render(<ParticipantsList participants={participants}/>);
        expect(mockT).toHaveBeenCalledWith('admin.participantCount', {count: 3});
    });

    it('should not contain hardcoded English strings', () => {
        const participants = [
            {
                id: 1,
                dinnerId: 1,
                username: 'john',
                notes: 'A note',
                createdAt: '2026-01-01T00:00:00Z',
                updatedAt: '2026-01-01T00:00:00Z'
            },
        ];
        const {queryByText} = render(<ParticipantsList participants={participants}/>);
        expect(queryByText('Username:')).toBeNull();
        expect(queryByText('Notes:')).toBeNull();
        expect(queryByText('Added:')).toBeNull();
        expect(queryByText(/Total: \d+ participant/)).toBeNull();
    });
});
