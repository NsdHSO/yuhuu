import React from 'react';
import {Alert} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SkillsAccordion} from '../skills-accordion';

const mockT = jest.fn((key: string) => key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

const mockMutate = jest.fn();
const mockCreateMutate = jest.fn();
const mockUpdateMutate = jest.fn();

jest.mock('@/features/skills/api', () => ({
    useMySkillsQuery: jest.fn(() => ({
        data: [
            {
                id: 1,
                user_id: 10,
                skill_name: 'Piano',
                skill_category: 'Music',
                proficiency_level: 'advanced',
                years_of_experience: 5,
                is_willing_to_serve: true,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ],
        isLoading: false,
    })),
    useUserSkillsQuery: jest.fn(() => ({
        data: [],
        isLoading: false,
    })),
    useDeleteMySkillMutation: jest.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
    useCreateMySkillMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateMySkillMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useCreateUserSkillMutation: jest.fn(() => ({
        mutate: mockCreateMutate,
        isPending: false,
    })),
    useUpdateUserSkillMutation: jest.fn(() => ({
        mutate: mockUpdateMutate,
        isPending: false,
    })),
    useDeleteUserSkillMutation: jest.fn(() => ({
        mutate: mockMutate,
        isPending: false,
    })),
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

describe('SkillsAccordion - Create/Edit Forms', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockT.mockImplementation((key: string) => key);
    });

    describe('Add Button', () => {
        it('should render add button when accordion is expanded', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            expect(getByText('skills.addButton')).toBeTruthy();
        });

        it('should render add button in admin mode', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<SkillsAccordion userId={5} />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            expect(getByText('skills.addButton')).toBeTruthy();
        });
    });

    describe('Create Form', () => {
        it('should show create form when add button clicked', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getByText('skills.addButton'));
            expect(getByTestId('skill-form')).toBeTruthy();
        });

        it('should validate required skill_name before submission', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getByText('skills.addButton'));
            fireEvent.press(getByTestId('skill-form-submit'));
            expect(Alert.alert).toHaveBeenCalledWith(
                'common.error',
                'skills.errors.skillNameRequired',
            );
            expect(mockCreateMutate).not.toHaveBeenCalled();
        });

        it('should call create mutation with correct data', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getByText('skills.addButton'));
            fireEvent.changeText(getByTestId('skill-name-input'), 'Guitar');
            fireEvent.press(getByTestId('skill-form-submit'));
            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({skill_name: 'Guitar'}),
                expect.any(Object),
            );
        });

        it('should hide add button when in create mode', () => {
            const {getByTestId, getByText, queryByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getByText('skills.addButton'));
            expect(queryByText('skills.addButton')).toBeNull();
        });
    });

    describe('Cancel', () => {
        it('should cancel create form and return to view mode', () => {
            const {getByTestId, getByText, queryByTestId} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getByText('skills.addButton'));
            expect(getByTestId('skill-form')).toBeTruthy();
            fireEvent.press(getByTestId('skill-form-cancel'));
            expect(queryByTestId('skill-form')).toBeNull();
            expect(getByText('skills.addButton')).toBeTruthy();
        });
    });

    describe('Edit Form', () => {
        it('should show edit button next to delete button', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            expect(getAllByText('common.edit').length).toBeGreaterThan(0);
        });

        it('should show edit form with pre-filled data when edit button clicked', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            const nameInput = getByTestId('skill-name-input');
            expect(nameInput.props.value).toBe('Piano');
        });

        it('should call update mutation with correct data', () => {
            const {getByTestId, getAllByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            fireEvent.changeText(getByTestId('skill-name-input'), 'Keyboard');
            fireEvent.press(getByTestId('skill-form-submit'));
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: 1,
                    data: expect.objectContaining({skill_name: 'Keyboard'}),
                }),
                expect.any(Object),
            );
        });

        it('should return to view mode after cancel in edit mode', () => {
            const {getByTestId, getAllByText, queryByTestId, getByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getAllByText('common.edit')[0]);
            expect(getByTestId('skill-form')).toBeTruthy();
            fireEvent.press(getByTestId('skill-form-cancel'));
            expect(queryByTestId('skill-form')).toBeNull();
            expect(getByText('Piano')).toBeTruthy();
        });
    });

    describe('i18n', () => {
        it('should use correct i18n keys for form labels', () => {
            const {getByTestId, getByText} = renderWithQueryClient(<SkillsAccordion />);
            fireEvent.press(getByTestId('skills-accordion-header'));
            fireEvent.press(getByText('skills.addButton'));
            expect(mockT).toHaveBeenCalledWith('skills.fields.skillName');
        });
    });
});
