import React from 'react';
import {fireEvent, render} from '@testing-library/react-native';
import {DinnerIdSearch} from '../dinner-id-search';
import * as useColorSchemeModule from '../../hooks/use-color-scheme';

jest.mock('../../hooks/use-color-scheme', () => ({
    useColorScheme: jest.fn(() => 'light'),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('DinnerIdSearch', () => {
    const mockOnDinnerIdChange = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should render with testID', () => {
        const {getByTestId} = render(
            <DinnerIdSearch
                onDinnerIdChange={mockOnDinnerIdChange}
                testID="dinner-id-search"
            />
        );

        expect(getByTestId('dinner-id-search')).toBeTruthy();
        expect(getByTestId('dinner-id-input')).toBeTruthy();
    });

    it('should call onDinnerIdChange with parsed number for valid input', () => {
        const {getByTestId} = render(
            <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
        );

        const input = getByTestId('dinner-id-input');
        fireEvent.changeText(input, '42');

        expect(mockOnDinnerIdChange).toHaveBeenCalledWith(42);
    });

    it('should call onDinnerIdChange with null for empty input', () => {
        const {getByTestId} = render(
            <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
        );

        const input = getByTestId('dinner-id-input');
        fireEvent.changeText(input, '');

        expect(mockOnDinnerIdChange).toHaveBeenCalledWith(null);
    });

    it('should call onDinnerIdChange with null for whitespace-only input', () => {
        const {getByTestId} = render(
            <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
        );

        const input = getByTestId('dinner-id-input');
        fireEvent.changeText(input, '   ');

        expect(mockOnDinnerIdChange).toHaveBeenCalledWith(null);
    });

    it('should not call onDinnerIdChange for invalid number input', () => {
        const {getByTestId} = render(
            <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
        );

        const input = getByTestId('dinner-id-input');
        fireEvent.changeText(input, 'abc');

        expect(mockOnDinnerIdChange).not.toHaveBeenCalled();
    });

    it('should not call onDinnerIdChange for zero or negative numbers', () => {
        const {getByTestId} = render(
            <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
        );

        const input = getByTestId('dinner-id-input');
        fireEvent.changeText(input, '0');

        expect(mockOnDinnerIdChange).not.toHaveBeenCalled();

        fireEvent.changeText(input, '-5');

        expect(mockOnDinnerIdChange).not.toHaveBeenCalled();
    });

    describe('Theme support', () => {
        it('should render in light theme', () => {
            jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('light');

            const {getByTestId} = render(
                <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
            );

            expect(getByTestId('dinner-id-input')).toBeTruthy();
        });

        it('should render in dark theme', () => {
            jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('dark');

            const {getByTestId} = render(
                <DinnerIdSearch onDinnerIdChange={mockOnDinnerIdChange} />
            );

            expect(getByTestId('dinner-id-input')).toBeTruthy();
        });
    });
});
