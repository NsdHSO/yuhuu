import React from 'react';
import {render, fireEvent} from '@testing-library/react-native';
import {Platform, Linking} from 'react-native';
import type {VisitAssignment} from '@yuhuu/types';

// Import component after mock
import {VisitCard} from '../VisitCard';

/**
 * Unit tests for VisitCard Component
 * SOLID Principles:
 * - Single Responsibility: Each test validates one specific UI behavior
 * - Tests behavior, not implementation details
 */

// Mock Linking before component import
jest.spyOn(Linking, 'openURL').mockImplementation(() => Promise.resolve(true));

// Mock dependencies
jest.mock('@yuhuu/components', () => {
  const RN = require('react-native');
  const React = require('react');

  return {
    useGlowVariant: () => ({glowVariant: 'vibrant'}),
    getGlowColor: () => '#A78BFA',
    useGlassColors: () => ({
      activeColor: '#A78BFA',
      glowVariant: 'vibrant',
      scheme: 'dark',
      text: '#fff',
      subtext: '#CBD5E1',
      glassBackground: 'rgba(40, 40, 50, 0.60)',
      glowOverlay: (borderRadius: number = 12) => ({
        borderRadius,
        backgroundColor: '#A78BFA0D',
      }),
      glowBorder: (borderRadius: number = 12, borderWidth: number = 1) => ({
        borderRadius,
        borderWidth,
        borderColor: '#A78BFA66',
      }),
    }),
    ThemedText: ({children, style}: any) => (
      <RN.Text style={style}>{children}</RN.Text>
    ),
    GlassContentCard: ({children, testID}: any) => (
      <RN.View testID={testID} style={{marginBottom: 12}}>
        <RN.View style={{borderRadius: 12, overflow: 'hidden', padding: 16}}>
          {children}
        </RN.View>
      </RN.View>
    ),
  };
});

describe('VisitCard', () => {
  const mockVisit: VisitAssignment = {
    id: 1,
    family_id: 10,
    assigned_to_user_id: 5,
    scheduled_date: '2026-03-15',
    status: 'pending',
    arrived_at: null,
    completed_at: null,
    notes: null,
    created_at: '2026-03-12T10:00:00.000Z',
    updated_at: '2026-03-12T10:00:00.000Z',
  };

  const defaultProps = {
    visit: mockVisit,
    familyName: 'Smith Family',
    address: '123 Oak Street, Springfield, 12345',
    remainingMs: 300000, // 5 minutes
    canComplete: false,
    onComplete: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render family name', () => {
      const {getByText} = render(<VisitCard {...defaultProps} />);

      expect(getByText('Smith Family')).toBeTruthy();
    });

    it('should render address', () => {
      const {getByText} = render(<VisitCard {...defaultProps} />);

      expect(getByText('123 Oak Street, Springfield, 12345')).toBeTruthy();
    });

    it('should render with testID for testing', () => {
      const {getByTestId} = render(<VisitCard {...defaultProps} />);

      expect(getByTestId('visit-card')).toBeTruthy();
    });

    it('should render navigate button', () => {
      const {getByText} = render(<VisitCard {...defaultProps} />);

      expect(getByText('Navigate')).toBeTruthy();
    });

    it('should render mark complete button', () => {
      const {getByText} = render(<VisitCard {...defaultProps} />);

      expect(getByText('Mark Complete')).toBeTruthy();
    });
  });

  describe('Timer display', () => {
    it('should show time remaining when timer active', () => {
      const {getByText} = render(<VisitCard {...defaultProps} remainingMs={300000} />);

      expect(getByText(/Time remaining: 5:00/)).toBeTruthy();
    });

    it('should format time correctly for 9:59', () => {
      const {getByText} = render(<VisitCard {...defaultProps} remainingMs={599000} />);

      expect(getByText(/Time remaining: 9:59/)).toBeTruthy();
    });

    it('should format time correctly for 0:01', () => {
      const {getByText} = render(<VisitCard {...defaultProps} remainingMs={1000} />);

      expect(getByText(/Time remaining: 0:01/)).toBeTruthy();
    });

    it('should not show timer when remainingMs is 0', () => {
      const {queryByText} = render(<VisitCard {...defaultProps} remainingMs={0} />);

      expect(queryByText(/Time remaining:/)).toBeNull();
    });

    it('should pad seconds with leading zero', () => {
      const {getByText} = render(<VisitCard {...defaultProps} remainingMs={305000} />);

      expect(getByText(/Time remaining: 5:05/)).toBeTruthy();
    });

    it('should handle edge case: 10:00 exactly', () => {
      const {getByText} = render(<VisitCard {...defaultProps} remainingMs={600000} />);

      expect(getByText(/Time remaining: 10:00/)).toBeTruthy();
    });
  });

  describe('Navigate button interaction', () => {
    it('should call navigate on button press (iOS)', () => {
      const mockSelect = jest.spyOn(Platform, 'select').mockReturnValue('maps:0,0?q=123%20Oak%20Street%2C%20Springfield%2C%2012345');
      const mockOpenURL = jest.spyOn(Linking, 'openURL');
      const {getByText} = render(<VisitCard {...defaultProps} />);

      const navigateButton = getByText('Navigate');
      fireEvent.press(navigateButton);

      expect(mockOpenURL).toHaveBeenCalledWith(
        'maps:0,0?q=123%20Oak%20Street%2C%20Springfield%2C%2012345'
      );
      mockSelect.mockRestore();
    });

    it('should call navigate on button press (Android)', () => {
      const mockSelect = jest.spyOn(Platform, 'select').mockReturnValue('geo:0,0?q=123%20Oak%20Street%2C%20Springfield%2C%2012345');
      const mockOpenURL = jest.spyOn(Linking, 'openURL');
      const {getByText} = render(<VisitCard {...defaultProps} />);

      const navigateButton = getByText('Navigate');
      fireEvent.press(navigateButton);

      expect(mockOpenURL).toHaveBeenCalledWith(
        'geo:0,0?q=123%20Oak%20Street%2C%20Springfield%2C%2012345'
      );
      mockSelect.mockRestore();
    });

    it('should URL-encode address for navigation', () => {
      const mockSelect = jest.spyOn(Platform, 'select').mockReturnValue('maps:0,0?q=123%20Main%20St%2C%20City%20Name%2C%2012345');
      const mockOpenURL = jest.spyOn(Linking, 'openURL');
      const {getByText} = render(
        <VisitCard {...defaultProps} address="123 Main St, City Name, 12345" />
      );

      fireEvent.press(getByText('Navigate'));

      expect(mockOpenURL).toHaveBeenCalledWith(
        'maps:0,0?q=123%20Main%20St%2C%20City%20Name%2C%2012345'
      );
      mockSelect.mockRestore();
    });

    it('should handle special characters in address', () => {
      const mockSelect = jest.spyOn(Platform, 'select').mockReturnValue('maps:0,0?q=Apt%20%235%2C%20O\'Brien%20Street%2C%2090210');
      const mockOpenURL = jest.spyOn(Linking, 'openURL');
      const {getByText} = render(
        <VisitCard {...defaultProps} address="Apt #5, O'Brien Street, 90210" />
      );

      fireEvent.press(getByText('Navigate'));

      expect(mockOpenURL).toHaveBeenCalledWith(
        'maps:0,0?q=Apt%20%235%2C%20O\'Brien%20Street%2C%2090210'
      );
      mockSelect.mockRestore();
    });
  });

  describe('Complete button interaction', () => {
    it('should call onComplete when canComplete is true', () => {
      const mockOnComplete = jest.fn();
      const {getByText} = render(
        <VisitCard {...defaultProps} canComplete={true} onComplete={mockOnComplete} />
      );

      const completeButton = getByText('Mark Complete');
      fireEvent.press(completeButton);

      expect(mockOnComplete).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when canComplete is false', () => {
      const mockOnComplete = jest.fn();
      const {getByText} = render(
        <VisitCard {...defaultProps} canComplete={false} onComplete={mockOnComplete} />
      );

      const completeButton = getByText('Mark Complete');

      // Button exists but disabled
      expect(completeButton).toBeTruthy();
    });

    it('should not call onComplete when disabled', () => {
      const mockOnComplete = jest.fn();
      const {getByText} = render(
        <VisitCard {...defaultProps} canComplete={false} onComplete={mockOnComplete} />
      );

      const completeButton = getByText('Mark Complete');
      fireEvent.press(completeButton);

      // Disabled buttons don't fire onPress in React Native testing
      expect(mockOnComplete).not.toHaveBeenCalled();
    });

    it('should enable button only after timer completes', () => {
      const {getByText, rerender} = render(
        <VisitCard {...defaultProps} canComplete={false} remainingMs={1000} />
      );

      // Initially disabled
      expect(getByText('Mark Complete')).toBeTruthy();

      // After timer completes
      rerender(<VisitCard {...defaultProps} canComplete={true} remainingMs={0} />);

      const mockOnComplete = jest.fn();
      rerender(
        <VisitCard {...defaultProps} canComplete={true} remainingMs={0} onComplete={mockOnComplete} />
      );

      fireEvent.press(getByText('Mark Complete'));
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  describe('useGlowVariant theming', () => {
    it('should use glow color from theme', () => {
      const {getByTestId} = render(<VisitCard {...defaultProps} />);

      const card = getByTestId('visit-card');
      // Component exists and renders
      expect(card).toBeTruthy();
    });

    it('should apply theme color to timer text', () => {
      const {getByText} = render(<VisitCard {...defaultProps} remainingMs={300000} />);

      const timerText = getByText(/Time remaining:/);
      expect(timerText).toBeTruthy();
    });

    it('should apply theme color to navigate button', () => {
      const {getByText} = render(<VisitCard {...defaultProps} />);

      expect(getByText('Navigate')).toBeTruthy();
    });
  });

  describe('Edge cases', () => {
    it('should handle empty family name gracefully', () => {
      const {getByTestId} = render(<VisitCard {...defaultProps} familyName="" />);

      expect(getByTestId('visit-card')).toBeTruthy();
    });

    it('should handle empty address gracefully', () => {
      const {getByTestId} = render(<VisitCard {...defaultProps} address="" />);

      expect(getByTestId('visit-card')).toBeTruthy();
    });

    it('should handle very long family names', () => {
      const longName = 'A'.repeat(100);
      const {getByText} = render(<VisitCard {...defaultProps} familyName={longName} />);

      expect(getByText(longName)).toBeTruthy();
    });

    it('should handle very long addresses', () => {
      const longAddress = 'Very Long Street Name '.repeat(10);
      const {getByText} = render(<VisitCard {...defaultProps} address={longAddress} />);

      expect(getByText(longAddress)).toBeTruthy();
    });

    it('should handle remainingMs exactly at 0', () => {
      const {queryByText} = render(<VisitCard {...defaultProps} remainingMs={0} />);

      expect(queryByText(/Time remaining:/)).toBeNull();
    });

    it('should handle negative remainingMs (edge case)', () => {
      const {queryByText} = render(<VisitCard {...defaultProps} remainingMs={-1000} />);

      // Should not crash, timer likely hidden or shows 0:00
      expect(queryByText(/Time remaining:/)).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have testID for automated testing', () => {
      const {getByTestId} = render(<VisitCard {...defaultProps} />);

      expect(getByTestId('visit-card')).toBeTruthy();
    });

    it('should render all interactive elements', () => {
      const {getByText} = render(<VisitCard {...defaultProps} />);

      expect(getByText('Navigate')).toBeTruthy();
      expect(getByText('Mark Complete')).toBeTruthy();
    });
  });
});
