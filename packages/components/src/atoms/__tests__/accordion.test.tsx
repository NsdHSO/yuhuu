import React from 'react';
import {Text} from 'react-native';
import {fireEvent, render} from '@testing-library/react-native';
import {Accordion} from '../accordion';

describe('Accordion (atoms)', () => {
    describe('Basic Rendering', () => {
        it('should render accordion with title', () => {
            const {getByText} = render(
                <Accordion title="Test Section">
                    <Text>Content</Text>
                </Accordion>
            );

            expect(getByText('Test Section')).toBeTruthy();
        });

        it('should render accordion header button', () => {
            const {getByTestId} = render(
                <Accordion title="Test Section" testID="test-accordion">
                    <Text>Content</Text>
                </Accordion>
            );

            expect(getByTestId('test-accordion-header')).toBeTruthy();
        });
    });

    describe('Expand/Collapse Behavior', () => {
        it('should start collapsed by default', () => {
            const {queryByText} = render(
                <Accordion title="Section">
                    <Text>Content inside accordion</Text>
                </Accordion>
            );

            expect(queryByText('Content inside accordion')).toBeNull();
        });

        it('should start expanded when initialExpanded is true', () => {
            const {getByText} = render(
                <Accordion title="Section" initialExpanded={true}>
                    <Text>Content inside accordion</Text>
                </Accordion>
            );

            expect(getByText('Content inside accordion')).toBeTruthy();
        });

        it('should expand when header is clicked', () => {
            const {getByTestId, getByText} = render(
                <Accordion title="Section" testID="test-accordion">
                    <Text>Expandable content</Text>
                </Accordion>
            );

            fireEvent.press(getByTestId('test-accordion-header'));

            expect(getByText('Expandable content')).toBeTruthy();
        });

        it('should collapse when header is clicked again', () => {
            const {getByTestId, queryByText} = render(
                <Accordion title="Section" initialExpanded={true} testID="test-accordion">
                    <Text>Collapsible content</Text>
                </Accordion>
            );

            fireEvent.press(getByTestId('test-accordion-header'));

            expect(queryByText('Collapsible content')).toBeNull();
        });

        it('should toggle multiple times correctly', () => {
            const {getByTestId, getByText, queryByText} = render(
                <Accordion title="Section" testID="test-accordion">
                    <Text>Toggle content</Text>
                </Accordion>
            );

            const header = getByTestId('test-accordion-header');

            fireEvent.press(header);
            expect(getByText('Toggle content')).toBeTruthy();

            fireEvent.press(header);
            expect(queryByText('Toggle content')).toBeNull();

            fireEvent.press(header);
            expect(getByText('Toggle content')).toBeTruthy();
        });
    });

    describe('Admin Use Cases', () => {
        it('should work with admin-style content (skills, milestones, etc.)', () => {
            const {getByTestId, getByText} = render(
                <Accordion title="Skills" testID="skills-accordion" initialExpanded={true}>
                    <Text>Skill 1</Text>
                    <Text>Skill 2</Text>
                </Accordion>
            );

            expect(getByTestId('skills-accordion')).toBeTruthy();
            expect(getByText('Skill 1')).toBeTruthy();
            expect(getByText('Skill 2')).toBeTruthy();
        });

        it('should handle multiple independent accordions for admin sections', () => {
            const {getByTestId, getByText, queryByText} = render(
                <>
                    <Accordion title="Skills" testID="skills">
                        <Text>Skills content</Text>
                    </Accordion>
                    <Accordion title="Milestones" testID="milestones">
                        <Text>Milestones content</Text>
                    </Accordion>
                    <Accordion title="Membership" testID="membership">
                        <Text>Membership content</Text>
                    </Accordion>
                </>
            );

            fireEvent.press(getByTestId('skills-header'));
            expect(getByText('Skills content')).toBeTruthy();
            expect(queryByText('Milestones content')).toBeNull();
            expect(queryByText('Membership content')).toBeNull();
        });
    });

    describe('Accessibility', () => {
        it('should have accessible role for header button', () => {
            const {getByTestId} = render(
                <Accordion title="Section" testID="test-accordion">
                    <Text>Content</Text>
                </Accordion>
            );

            const header = getByTestId('test-accordion-header');
            expect(header.props.accessible).toBe(true);
        });
    });

    describe('Custom testID', () => {
        it('should apply custom testID to container and header', () => {
            const {getByTestId} = render(
                <Accordion title="Section" testID="custom-accordion">
                    <Text>Content</Text>
                </Accordion>
            );

            expect(getByTestId('custom-accordion')).toBeTruthy();
            expect(getByTestId('custom-accordion-header')).toBeTruthy();
        });
    });
});
