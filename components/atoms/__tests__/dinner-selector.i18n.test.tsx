import React from 'react';
import { render, screen } from '@testing-library/react-native';
import { DinnerSelector } from '@/components/atoms/dinner-selector';
import type { Dinner } from '@/features/dinners/types';
import i18n from '@/lib/i18n';

jest.mock('expo-localization');
jest.mock('expo-secure-store');

// Mock useColorScheme hook
jest.mock('@/hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'light'),
}));

// Mock Picker to render labels as Text so we can assert on them
jest.mock('@react-native-picker/picker', () => {
    const MockPickerItem = ({ label, value }: any) => {
        const { Text } = jest.requireActual('react-native');
        return <Text testID={`picker-item-${value}`}>{label}</Text>;
    };

    const MockPicker = ({ children, onValueChange, selectedValue }: any) => {
        const { View, Text } = jest.requireActual('react-native');
        return (
            <View testID="picker">
                <Text testID="picker-value">{selectedValue}</Text>
                {children}
            </View>
        );
    };

    MockPicker.Item = MockPickerItem;
    return { Picker: MockPicker };
});

/**
 * DinnerSelector i18n integration tests
 *
 * Verifies that the DinnerSelector component uses translation keys
 * instead of hardcoded English strings:
 *   "Select a dinner..." -> supper.selectDinnerPlaceholder
 *   "Dinner"             -> supper.dinnerFallback
 */
describe('DinnerSelector i18n', () => {
    const mockOnSelect = jest.fn();

    const multipleDinners: Dinner[] = [
        {
            id: 1,
            dinnerDate: '2026-02-28',
            mealType: 'Dinner',
            location: 'Church Hall',
            description: 'Fellowship dinner',
            maxParticipants: 50,
            uuid: 'uuid-1',
            createdAt: '2026-02-25T10:00:00Z',
            updatedAt: '2026-02-25T10:00:00Z',
        },
        {
            id: 2,
            dinnerDate: '2026-02-28',
            mealType: 'Lunch',
            location: '',
            description: '',
            maxParticipants: 30,
            uuid: 'uuid-2',
            createdAt: '2026-02-25T11:00:00Z',
            updatedAt: '2026-02-25T11:00:00Z',
        },
    ];

    beforeEach(async () => {
        jest.clearAllMocks();
        const { initI18n } = require('@/lib/i18n');
        await initI18n();
    });

    afterEach(async () => {
        await i18n.changeLanguage('en');
    });

    describe('Placeholder picker item', () => {
        it('should display English placeholder text using translation key', () => {
            render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            const placeholderItem = screen.getByTestId('picker-item-null');
            expect(placeholderItem.props.children).toBe('Select a dinner...');
        });

        it('should not contain hardcoded English placeholder when language is Romanian', async () => {
            await i18n.changeLanguage('ro');

            const { queryByText } = render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            expect(queryByText('Select a dinner...')).toBeNull();
        });

        it('should display Romanian placeholder when language is ro', async () => {
            await i18n.changeLanguage('ro');

            render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            const placeholderItem = screen.getByTestId('picker-item-null');
            // Romanian: "Selectează o cină..."
            expect(placeholderItem.props.children).toContain('cin');
        });
    });

    describe('Dinner fallback label', () => {
        it('should use English fallback when dinner has no location or description', () => {
            render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            // Dinner #2 has empty location and description, should use fallback
            const dinnerItem = screen.getByTestId('picker-item-2');
            expect(dinnerItem.props.children).toBe('Lunch - Dinner');
        });

        it('should show location when available instead of fallback', () => {
            render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            // Dinner #1 has location 'Church Hall'
            const dinnerItem = screen.getByTestId('picker-item-1');
            expect(dinnerItem.props.children).toContain('Church Hall');
        });

        it('should use Romanian fallback when language is ro', async () => {
            await i18n.changeLanguage('ro');

            render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            const dinnerItem = screen.getByTestId('picker-item-2');
            // Romanian fallback "Cină" instead of hardcoded "Dinner"
            expect(dinnerItem.props.children).not.toContain('Dinner');
            expect(dinnerItem.props.children).toContain('Cin');
        });
    });

    describe('Language switching', () => {
        it('should switch placeholder from English to Romanian', async () => {
            const { rerender } = render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            // Verify English first
            let placeholder = screen.getByTestId('picker-item-null');
            expect(placeholder.props.children).toBe('Select a dinner...');

            // Switch to Romanian
            await i18n.changeLanguage('ro');
            rerender(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            placeholder = screen.getByTestId('picker-item-null');
            expect(placeholder.props.children).not.toBe('Select a dinner...');
        });

        it('should switch fallback from English to Romanian', async () => {
            const { rerender } = render(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            // Verify English fallback
            let dinnerItem = screen.getByTestId('picker-item-2');
            expect(dinnerItem.props.children).toBe('Lunch - Dinner');

            // Switch to Romanian
            await i18n.changeLanguage('ro');
            rerender(
                <DinnerSelector
                    dinners={multipleDinners}
                    selectedDinnerId={null}
                    onSelectDinner={mockOnSelect}
                />
            );

            dinnerItem = screen.getByTestId('picker-item-2');
            expect(dinnerItem.props.children).not.toBe('Lunch - Dinner');
        });
    });
});
