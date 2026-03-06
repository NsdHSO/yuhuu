import React from 'react';
import {fireEvent, render, screen} from '@testing-library/react-native';
import {UserSearch} from '../user-search';
import * as useColorSchemeModule from '../../hooks/use-color-scheme';

const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
        'admin.searchPlaceholder': 'Search username...',
        'common.search': 'Search',
    };
    return translations[key] ?? key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
        i18n: {language: 'en', changeLanguage: jest.fn()},
    }),
}));

jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('light');

describe('UserSearch Molecule Component', () => {
    const mockOnSearch = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render search input and button', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            expect(screen.getByTestId('search-input')).toBeTruthy();
            expect(screen.getByTestId('search-button')).toBeTruthy();
        });

        it('should render search button text', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            expect(screen.getByText('Search')).toBeTruthy();
        });

        it('should render with custom testID', () => {
            render(<UserSearch onSearch={mockOnSearch} testID="custom-search"/>);
            expect(screen.getByTestId('custom-search')).toBeTruthy();
        });
    });

    describe('Search Input Behavior', () => {
        it('should call onSearch when text changes with non-empty value', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            const input = screen.getByTestId('search-input');
            fireEvent.changeText(input, 'testuser');
            expect(mockOnSearch).toHaveBeenCalledWith('testuser');
        });

        it('should trim whitespace from search text', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            const input = screen.getByTestId('search-input');
            fireEvent.changeText(input, '  testuser  ');
            expect(mockOnSearch).toHaveBeenCalledWith('testuser');
        });

        it('should not call onSearch when text is empty', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            const input = screen.getByTestId('search-input');
            fireEvent.changeText(input, '');
            expect(mockOnSearch).not.toHaveBeenCalled();
        });

        it('should not call onSearch when text is only whitespace', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            const input = screen.getByTestId('search-input');
            fireEvent.changeText(input, '   ');
            expect(mockOnSearch).not.toHaveBeenCalled();
        });
    });

    describe('Search Button Behavior', () => {
        it('should call onSearch when button is pressed with non-empty input', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            const input = screen.getByTestId('search-input');
            const button = screen.getByTestId('search-button');
            fireEvent.changeText(input, 'testuser');
            mockOnSearch.mockClear();
            fireEvent.press(button);
            expect(mockOnSearch).toHaveBeenCalledWith('testuser');
        });

        it('should not call onSearch when button is pressed with empty input', () => {
            render(<UserSearch onSearch={mockOnSearch}/>);
            const button = screen.getByTestId('search-button');
            fireEvent.press(button);
            expect(mockOnSearch).not.toHaveBeenCalled();
        });
    });

    describe('Dark Mode', () => {
        it('should render in dark mode without errors', () => {
            jest.spyOn(useColorSchemeModule, 'useColorScheme').mockReturnValue('dark');
            render(<UserSearch onSearch={mockOnSearch}/>);
            expect(screen.getByTestId('search-input')).toBeTruthy();
            expect(screen.getByTestId('search-button')).toBeTruthy();
        });
    });
});
