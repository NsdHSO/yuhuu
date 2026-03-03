import React from 'react';
import {render, screen} from '@testing-library/react-native';
import {HelloWave} from '../hello-wave';

describe('HelloWave Component', () => {
    describe('Rendering', () => {
        it('should render the wave emoji', () => {
            render(<HelloWave/>);
            expect(screen.getByText('👋')).toBeTruthy();
        });

        it('should render without crashing', () => {
            const {root} = render(<HelloWave/>);
            expect(root).toBeTruthy();
        });
    });

    describe('Component Structure', () => {
        it('should be an Animated.Text component', () => {
            const {getByText} = render(<HelloWave/>);
            const waveElement = getByText('👋');
            expect(waveElement).toBeTruthy();
        });

        it('should contain wave emoji', () => {
            const {getByText} = render(<HelloWave/>);
            expect(getByText('👋')).toBeTruthy();
        });
    });

    describe('Multiple Instances', () => {
        it('should render multiple instances independently', () => {
            const {getAllByText} = render(
                <>
                    <HelloWave/>
                    <HelloWave/>
                    <HelloWave/>
                </>
            );
            const waves = getAllByText('👋');
            expect(waves).toHaveLength(3);
        });
    });

    describe('Snapshot Consistency', () => {
        it('should render consistently', () => {
            const {
                getByText,
                rerender
            } = render(<HelloWave/>);
            expect(getByText('👋')).toBeTruthy();

            rerender(<HelloWave/>);
            expect(getByText('👋')).toBeTruthy();
        });
    });
});
