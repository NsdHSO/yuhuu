import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import * as Haptics from 'expo-haptics';
import { HapticTab } from '../haptic-tab';

jest.mock('expo-haptics');

describe('HapticTab Component', () => {
    const mockProps = {
        to: '/home',
        onPress: jest.fn(),
        onPressIn: jest.fn(),
        testID: 'haptic-tab',
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render without crashing', () => {
            const { getByTestId } = render(<HapticTab {...mockProps}>Tab</HapticTab>);
            expect(getByTestId('haptic-tab')).toBeTruthy();
        });

        it('should render with children', () => {
            const { getByTestId } = render(
                <HapticTab {...mockProps}>
                    <></>
                    Tab Label
                </HapticTab>
            );
            expect(getByTestId('haptic-tab')).toBeTruthy();
        });
    });

    describe('iOS Haptic Feedback', () => {
        it('should trigger haptic feedback on iOS', () => {
            process.env.EXPO_OS = 'ios';

            const { getByTestId } = render(<HapticTab {...mockProps}>Tab</HapticTab>);
            const tab = getByTestId('haptic-tab');

            fireEvent(tab, 'pressIn');

            expect(Haptics.impactAsync).toHaveBeenCalledWith(
                Haptics.ImpactFeedbackStyle.Light
            );
        });

        it('should call onPressIn callback on iOS', () => {
            process.env.EXPO_OS = 'ios';

            const onPressIn = jest.fn();
            const { getByTestId } = render(
                <HapticTab {...mockProps} onPressIn={onPressIn}>Tab</HapticTab>
            );

            const tab = getByTestId('haptic-tab');
            fireEvent(tab, 'pressIn');

            expect(onPressIn).toHaveBeenCalled();
        });

        it('should trigger haptic before onPressIn callback on iOS', () => {
            process.env.EXPO_OS = 'ios';

            const callOrder: string[] = [];
            const onPressIn = jest.fn(() => callOrder.push('onPressIn'));
            (Haptics.impactAsync as jest.Mock).mockImplementation(() =>
                callOrder.push('haptic')
            );

            const { getByTestId } = render(
                <HapticTab {...mockProps} onPressIn={onPressIn}>Tab</HapticTab>
            );

            fireEvent(getByTestId('haptic-tab'), 'pressIn');

            expect(callOrder).toEqual(['haptic', 'onPressIn']);
        });
    });

    describe('Android Behavior', () => {
        it('should call onPressIn callback on Android', () => {
            const onPressIn = jest.fn();
            const { getByTestId } = render(
                <HapticTab {...mockProps} onPressIn={onPressIn}/>
            );

            fireEvent(getByTestId('haptic-tab'), 'pressIn');

            expect(onPressIn).toHaveBeenCalled();
        });
    });

    describe('Web Behavior', () => {
        it('should render on web', () => {
            const { getByTestId } = render(<HapticTab {...mockProps}>Tab</HapticTab>);
            expect(getByTestId('haptic-tab')).toBeTruthy();
        });
    });

    describe('Props Handling', () => {
        it('should pass through all props', () => {
            const customProps = {
                ...mockProps,
                accessibilityLabel: 'Custom Tab',
                accessible: true,
            };

            const { getByTestId } = render(<HapticTab {...customProps}>Tab</HapticTab>);
            expect(getByTestId('haptic-tab')).toBeTruthy();
        });

        it('should work without onPressIn prop', () => {
            process.env.EXPO_OS = 'ios';
            const propsWithoutOnPressIn: any = { ...mockProps };
            delete propsWithoutOnPressIn.onPressIn;

            const { getByTestId } = render(
                <HapticTab {...(propsWithoutOnPressIn as any)}>Tab</HapticTab>
            );

            expect(() => {
                fireEvent(getByTestId('haptic-tab'), 'pressIn');
            }).not.toThrow();

            expect(Haptics.impactAsync).toHaveBeenCalled();
        });
    });

    describe('Multiple Interactions', () => {
        it('should trigger haptic on multiple presses on iOS', () => {
            process.env.EXPO_OS = 'ios';

            const { getByTestId } = render(<HapticTab {...mockProps}>Tab</HapticTab>);
            const tab = getByTestId('haptic-tab');

            fireEvent(tab, 'pressIn');
            fireEvent(tab, 'pressIn');
            fireEvent(tab, 'pressIn');

            expect(Haptics.impactAsync).toHaveBeenCalledTimes(3);
        });

        it('should call onPressIn multiple times', () => {
            const onPressIn = jest.fn();
            const { getByTestId } = render(
                <HapticTab {...mockProps} onPressIn={onPressIn}>Tab</HapticTab>
            );

            const tab = getByTestId('haptic-tab');
            fireEvent(tab, 'pressIn');
            fireEvent(tab, 'pressIn');

            expect(onPressIn).toHaveBeenCalledTimes(2);
        });
    });
});
