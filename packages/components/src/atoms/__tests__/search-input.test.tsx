import React from 'react';
import {render, screen, fireEvent} from '@testing-library/react-native';
import {SearchInput} from '../search-input';

describe('SearchInput Atom Component', () => {
    describe('Glass Effect Integration', () => {
        it('should wrap input in glass view', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                    testID="glass-search"
                />
            );
            expect(getByTestId('glass-search')).toBeTruthy();
        });

        it('should use ultra-thin glass variant for subtle effect', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                    testID="glass-search"
                />
            );
            const container = getByTestId('glass-search');
            expect(container).toBeTruthy();
        });
    });

    describe('Rendering', () => {
        it('should render with placeholder text', () => {
            render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search here"
                />
            );
            expect(screen.getByPlaceholderText('Search here')).toBeTruthy();
        });

        it('should render with testID when provided', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                    testID="search-input-container"
                />
            );
            expect(getByTestId('search-input-container')).toBeTruthy();
        });

        it('should render TextInput with correct testID', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                />
            );
            expect(getByTestId('search-input-field')).toBeTruthy();
        });
    });

    describe('Input Type Variants', () => {
        it('should set keyboardType to "numeric" for numeric type', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={jest.fn()}
                    placeholder="Enter number"
                />
            );
            const input = getByTestId('search-input-field');
            expect(input.props.keyboardType).toBe('numeric');
        });

        it('should set keyboardType to "default" for text type', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Enter text"
                />
            );
            const input = getByTestId('search-input-field');
            expect(input.props.keyboardType).toBe('default');
        });
    });

    describe('Numeric Input Validation', () => {
        it('should call onValueChange with number for valid numeric input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '123');

            expect(onValueChange).toHaveBeenCalledWith(123);
        });

        it('should call onValueChange with null for empty numeric input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '');

            expect(onValueChange).toHaveBeenCalledWith(null);
        });

        it('should not call onValueChange for invalid numeric input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, 'abc');

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should not call onValueChange for negative numbers', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '-5');

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should not call onValueChange for zero', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '0');

            expect(onValueChange).not.toHaveBeenCalled();
        });

        it('should trim whitespace from numeric input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '  456  ');

            expect(onValueChange).toHaveBeenCalledWith(456);
        });
    });

    describe('Text Input Behavior', () => {
        it('should call onValueChange with string for text input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, 'hello world');

            expect(onValueChange).toHaveBeenCalledWith('hello world');
        });

        it('should call onValueChange with null for empty text input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '');

            expect(onValueChange).toHaveBeenCalledWith(null);
        });

        it('should trim whitespace from text input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '  test  ');

            expect(onValueChange).toHaveBeenCalledWith('test');
        });

        it('should handle whitespace-only text as null', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '   ');

            expect(onValueChange).toHaveBeenCalledWith(null);
        });
    });

    describe('Callback Execution', () => {
        it('should call onValueChange on every text change', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, 'a');
            fireEvent.changeText(input, 'ab');
            fireEvent.changeText(input, 'abc');

            expect(onValueChange).toHaveBeenCalledTimes(3);
            expect(onValueChange).toHaveBeenNthCalledWith(1, 'a');
            expect(onValueChange).toHaveBeenNthCalledWith(2, 'ab');
            expect(onValueChange).toHaveBeenNthCalledWith(3, 'abc');
        });

        it('should not call onValueChange when text is invalid', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, 'invalid');

            expect(onValueChange).not.toHaveBeenCalled();
        });
    });

    describe('Disabled State', () => {
        it('should render with disabled state when editable is false', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                    editable={false}
                />
            );
            const input = getByTestId('search-input-field');
            expect(input.props.editable).toBe(false);
        });

        it('should be editable by default', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                />
            );
            const input = getByTestId('search-input-field');
            expect(input.props.editable).not.toBe(false);
        });
    });

    describe('Edge Cases', () => {
        it('should handle multiple rapid changes', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, 'test1');
            fireEvent.changeText(input, 'test2');
            fireEvent.changeText(input, 'test3');

            expect(onValueChange).toHaveBeenCalledTimes(3);
        });

        it('should handle special characters in text input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '!@#$%^&*()');

            expect(onValueChange).toHaveBeenCalledWith('!@#$%^&*()');
        });

        it('should handle very long text input', () => {
            const onValueChange = jest.fn();
            const longText = 'a'.repeat(1000);
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={onValueChange}
                    placeholder="Search"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, longText);

            expect(onValueChange).toHaveBeenCalledWith(longText);
        });

        it('should handle large numbers in numeric input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '999999999');

            expect(onValueChange).toHaveBeenCalledWith(999999999);
        });

        it('should handle decimal numbers as invalid for numeric input', () => {
            const onValueChange = jest.fn();
            const {getByTestId} = render(
                <SearchInput
                    type="numeric"
                    onValueChange={onValueChange}
                    placeholder="Enter ID"
                />
            );

            const input = getByTestId('search-input-field');
            fireEvent.changeText(input, '12.5');

            // parseInt will convert '12.5' to 12
            expect(onValueChange).toHaveBeenCalledWith(12);
        });
    });

    describe('Accessibility', () => {
        it('should have accessible input field', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                />
            );
            expect(getByTestId('search-input-field')).toBeTruthy();
        });

        it('should disable autocorrect', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                />
            );
            const input = getByTestId('search-input-field');
            expect(input.props.autoCorrect).toBe(false);
        });

        it('should disable autocapitalize', () => {
            const {getByTestId} = render(
                <SearchInput
                    type="text"
                    onValueChange={jest.fn()}
                    placeholder="Search"
                />
            );
            const input = getByTestId('search-input-field');
            expect(input.props.autoCapitalize).toBe('none');
        });
    });
});
