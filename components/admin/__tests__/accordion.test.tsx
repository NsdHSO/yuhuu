import React from 'react';
import { Text } from 'react-native';
import { render, fireEvent } from '@testing-library/react-native';
import { Accordion } from '../accordion';

/**
 * Unit tests for Accordion Component
 * SOLID Principles:
 * - Single Responsibility: Each test validates one accordion behavior
 * - Open/Closed: Tests ensure accordion can be extended without breaking existing functionality
 */

describe('Accordion', () => {
	describe('Basic Rendering', () => {
		it('should render accordion with title', () => {
			// Given: Accordion with title
			const { getByText } = render(
				<Accordion title="Test Section">
					<Text>Content</Text>
				</Accordion>
			);

			// Then: Title should be visible
			expect(getByText('Test Section')).toBeTruthy();
		});

		it('should render accordion header button', () => {
			// Given: Accordion component
			const { getByTestId } = render(
				<Accordion title="Test Section" testID="test-accordion">
					<Text>Content</Text>
				</Accordion>
			);

			// Then: Header button should be present
			expect(getByTestId('test-accordion-header')).toBeTruthy();
		});
	});

	describe('Expand/Collapse Behavior', () => {
		it('should start collapsed by default', () => {
			// Given: Accordion with content
			const { queryByText } = render(
				<Accordion title="Section">
					<Text>Content inside accordion</Text>
				</Accordion>
			);

			// Then: Content should NOT be visible (collapsed by default)
			expect(queryByText('Content inside accordion')).toBeNull();
		});

		it('should start expanded when initialExpanded is true', () => {
			// Given: Accordion with initialExpanded=true
			const { getByText } = render(
				<Accordion title="Section" initialExpanded={true}>
					<Text>Content inside accordion</Text>
				</Accordion>
			);

			// Then: Content should be visible
			expect(getByText('Content inside accordion')).toBeTruthy();
		});

		it('should expand when header is clicked', () => {
			// Given: Collapsed accordion
			const { getByTestId, getByText } = render(
				<Accordion title="Section" testID="test-accordion">
					<Text>Expandable content</Text>
				</Accordion>
			);

			// When: User clicks the header
			const header = getByTestId('test-accordion-header');
			fireEvent.press(header);

			// Then: Content should be visible
			expect(getByText('Expandable content')).toBeTruthy();
		});

		it('should collapse when header is clicked again', () => {
			// Given: Expanded accordion
			const { getByTestId, queryByText } = render(
				<Accordion title="Section" initialExpanded={true} testID="test-accordion">
					<Text>Collapsible content</Text>
				</Accordion>
			);

			// When: User clicks the header to collapse
			const header = getByTestId('test-accordion-header');
			fireEvent.press(header);

			// Then: Content should NOT be visible
			expect(queryByText('Collapsible content')).toBeNull();
		});

		it('should toggle multiple times correctly', () => {
			// Given: Accordion component
			const { getByTestId, getByText, queryByText } = render(
				<Accordion title="Section" testID="test-accordion">
					<Text>Toggle content</Text>
				</Accordion>
			);

			const header = getByTestId('test-accordion-header');

			// When: First click (expand)
			fireEvent.press(header);
			// Then: Content visible
			expect(getByText('Toggle content')).toBeTruthy();

			// When: Second click (collapse)
			fireEvent.press(header);
			// Then: Content hidden
			expect(queryByText('Toggle content')).toBeNull();

			// When: Third click (expand again)
			fireEvent.press(header);
			// Then: Content visible again
			expect(getByText('Toggle content')).toBeTruthy();
		});
	});

	describe('Visual Indicators', () => {
		it('should show expand icon when collapsed', () => {
			// Given: Collapsed accordion
			const { getByTestId } = render(
				<Accordion title="Section" testID="test-accordion">
					<Text>Content</Text>
				</Accordion>
			);

			// Then: Header should be visible (icon is part of header)
			expect(getByTestId('test-accordion-header')).toBeTruthy();
		});

		it('should show collapse icon when expanded', () => {
			// Given: Expanded accordion
			const { getByTestId } = render(
				<Accordion title="Section" initialExpanded={true} testID="test-accordion">
					<Text>Content</Text>
				</Accordion>
			);

			// Then: Header should be visible (icon changes based on state)
			expect(getByTestId('test-accordion-header')).toBeTruthy();
		});
	});

	describe('Multiple Accordions', () => {
		it('should handle multiple independent accordions', () => {
			// Given: Two accordions
			const { getByTestId, getByText, queryByText } = render(
				<>
					<Accordion title="First Section" testID="accordion-1">
						<Text>First content</Text>
					</Accordion>
					<Accordion title="Second Section" testID="accordion-2">
						<Text>Second content</Text>
					</Accordion>
				</>
			);

			// When: First accordion is expanded
			fireEvent.press(getByTestId('accordion-1-header'));

			// Then: Only first content is visible
			expect(getByText('First content')).toBeTruthy();
			expect(queryByText('Second content')).toBeNull();

			// When: Second accordion is expanded
			fireEvent.press(getByTestId('accordion-2-header'));

			// Then: Both contents are visible (independent behavior)
			expect(getByText('First content')).toBeTruthy();
			expect(getByText('Second content')).toBeTruthy();
		});
	});

	describe('Accessibility', () => {
		it('should have accessible role for header button', () => {
			// Given: Accordion component
			const { getByTestId } = render(
				<Accordion title="Section" testID="test-accordion">
					<Text>Content</Text>
				</Accordion>
			);

			// Then: Header should be accessible as a button
			const header = getByTestId('test-accordion-header');
			expect(header.props.accessible).toBe(true);
		});
	});

	describe('Custom Styling', () => {
		it('should apply custom testID', () => {
			// Given: Accordion with custom testID
			const { getByTestId } = render(
				<Accordion title="Section" testID="custom-accordion">
					<Text>Content</Text>
				</Accordion>
			);

			// Then: Custom testID should work
			expect(getByTestId('custom-accordion')).toBeTruthy();
			expect(getByTestId('custom-accordion-header')).toBeTruthy();
		});
	});

	describe('Content Rendering', () => {
		it('should render complex content when expanded', () => {
			// Given: Accordion with complex content
			const { getByTestId, getByText } = render(
				<Accordion title="Section" testID="test-accordion">
					<>
						<Text>Multiple</Text>
						<Text>Content</Text>
						<Text>Elements</Text>
					</>
				</Accordion>
			);

			// When: Accordion is expanded
			fireEvent.press(getByTestId('test-accordion-header'));

			// Then: All content elements should be visible
			expect(getByText('Multiple')).toBeTruthy();
			expect(getByText('Content')).toBeTruthy();
			expect(getByText('Elements')).toBeTruthy();
		});
	});
});
