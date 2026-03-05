import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {MembershipAccordion} from '../membership-accordion';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

const mockDeleteMutate = jest.fn();
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();

jest.mock('@/features/membership/api', () => ({
    useMyMembershipHistoryQuery: jest.fn(() => ({
        data: [
            {
                id: 1,
                user_id: 10,
                church_name: 'First Baptist',
                start_date: '2020-01-01',
                end_date: null,
                transfer_type: 'new_member',
                previous_role: 'Deacon',
                transfer_letter_received: true,
                notes: 'Active member',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ],
        isLoading: false,
    })),
    useUserMembershipHistoryQuery: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
    useDeleteMyMembershipHistoryMutation: jest.fn(() => ({
        mutate: mockDeleteMutate,
        isPending: false,
    })),
    useCreateMyMembershipHistoryMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateMyMembershipHistoryMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useCreateUserMembershipHistoryMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateUserMembershipHistoryMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useDeleteUserMembershipHistoryMutation: jest.fn(() => ({
        mutate: mockDeleteMutate,
        isPending: false,
    })),
}));

jest.mock('@/lib/dates', () => ({
    formatDateForDisplay: jest.fn((date: string) => date),
}));

jest.spyOn(Alert, 'alert');

function renderWithQueryClient(ui: React.ReactElement) {
    const queryClient = new QueryClient({
        defaultOptions: {queries: {retry: false}, mutations: {retry: false}},
    });
    return render(
        <QueryClientProvider client={queryClient}>
            {ui}
        </QueryClientProvider>
    );
}

describe('MembershipAccordion - Create/Edit Forms', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockT.mockImplementation((key: string) => key);
    });

    describe('Add Button', () => {
        it('should render add button when accordion is expanded', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            expect(getByText('membership.addButton')).toBeTruthy();
        });
    });

    describe('Create Form', () => {
        it('should show create form when add button clicked', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getByText('membership.addButton'));
            expect(getByTestId('membership-form')).toBeTruthy();
        });

        it('should validate required church_name before submission', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getByText('membership.addButton'));
            fireEvent.press(getByTestId('membership-form-submit'));
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'membership.errors.churchNameRequired',
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should validate active membership constraint', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getByText('membership.addButton'));
            fireEvent.changeText(getByTestId('membership-church-input'), 'Second Church');
            // end_date is null by default = active membership
            // There's already an active membership (end_date: null)
            fireEvent.press(getByTestId('membership-form-submit'));
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'membership.duplicateActiveError',
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should call create mutation with correct data when adding ended membership', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getByText('membership.addButton'));
            fireEvent.changeText(getByTestId('membership-church-input'), 'Second Church');
            // Toggle hasEndDate to true using onValueChange
            fireEvent(getByTestId('membership-has-end-date-switch'), 'onValueChange', true);
            fireEvent.press(getByTestId('membership-form-submit'));
            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    church_name: 'Second Church',
                }),
                expect.any(Object),
            );
        });
    });

    describe('Edit Form', () => {
        it('should show edit button next to delete button', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            expect(getAllByText('common.edit').length).toBeGreaterThan(0);
        });

        it('should show edit form with pre-filled data', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            const churchInput = getByTestId('membership-church-input');
            expect(churchInput.props.value).toBe('First Baptist');
        });

        it('should call update mutation with correct data', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            fireEvent.changeText(getByTestId('membership-church-input'), 'Updated Church');
            fireEvent.press(getByTestId('membership-form-submit'));
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    data: expect.objectContaining({church_name: 'Updated Church'}),
                }),
                expect.any(Object),
            );
        });
    });

    describe('Cancel', () => {
        it('should cancel create form and return to view mode', () => {
            const {getByTestId, getByText, queryByTestId} = renderWithQueryClient(<MembershipAccordion />);
            fireEvent.press(getByTestId('membership-accordion-header'));
            fireEvent.press(getByText('membership.addButton'));
            expect(getByTestId('membership-form')).toBeTruthy();
            fireEvent.press(getByTestId('membership-form-cancel'));
            expect(queryByTestId('membership-form')).toBeNull();
            expect(getByText('membership.addButton')).toBeTruthy();
        });
    });
});
