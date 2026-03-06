import React from 'react';
import {StyleSheet} from 'react-native';
import {Calendar} from 'react-native-calendars';
import {useColorScheme} from '../hooks/use-color-scheme';
import {GlassCard} from './glass/GlassCard';

/**
 * Props for the DatePicker component
 */
export type DatePickerProps = {
    /** Currently selected date in YYYY-MM-DD format, or null if no date selected */
    selectedDate: string | null;
    /** Callback when a date is selected */
    onDateSelect: (date: string) => void;
};

/**
 * Calendar component for selecting dinner dates
 * SOLID Principles:
 * - Single Responsibility: Only handles date selection UI
 * - Open/Closed: Open for theme extensions, closed for behavior modification
 *
 * Features:
 * - Fancy blue water theme in both dark/light modes
 * - Ocean-inspired color palette with gradients
 * - Highlights selected date with aqua/cyan colors
 * - Calls onDateSelect when user taps a date
 */
export function DatePicker({
                               selectedDate,
                               onDateSelect
                           }: DatePickerProps) {
    const scheme = useColorScheme() ?? 'light';

    // Liquid glass theme colors
    const primaryColor = scheme === 'dark' ? '#06B6D4' : '#1E3A8A';
    const bgColor = 'transparent'; // Transparent for liquid glass effect
    const textColor = scheme === 'dark' ? '#E0F2FE' : '#F1F5F9';
    const disabledColor = scheme === 'dark' ? '#64748B' : '#94A3B8';
    const todayColor = scheme === 'dark' ? '#22D3EE' : '#06B6D4';

    // Mark the selected date
    const markedDates = selectedDate
        ? {
            [selectedDate]: {
                selected: true,
                selectedColor: primaryColor
            }
        }
        : {};

    return (
        <GlassCard
            variant="frosted"
            borderRadius={12}
            style={styles.container}
        >
            <Calendar
                onDayPress={(day) => onDateSelect(day.dateString)}
                markedDates={markedDates}
                theme={{
                    backgroundColor: bgColor,
                    calendarBackground: bgColor,
                    textSectionTitleColor: textColor,
                    selectedDayBackgroundColor: primaryColor,
                    selectedDayTextColor: '#FFFFFF',
                    todayTextColor: todayColor,
                    dayTextColor: textColor,
                    textDisabledColor: disabledColor,
                    monthTextColor: textColor,
                    arrowColor: primaryColor,
                    dotColor: primaryColor,
                    selectedDotColor: '#FFFFFF',
                }}
                style={{
                    backgroundColor: bgColor,
                }}
            />
        </GlassCard>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 8,
        overflow: 'hidden',
    },
});
