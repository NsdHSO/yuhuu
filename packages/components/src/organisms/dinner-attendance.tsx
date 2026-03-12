import {StyleSheet, Text, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {useColorScheme} from '../hooks/use-color-scheme';
import {Colors} from '../constants/theme';
import {GlassCard} from '../molecules/glass-interactive/GlassCard';

/**
 * DinnerAttendance component - Displays user's dinner attendance history
 *
 * SOLID Principles:
 * - Single Responsibility: Only handles displaying attendance records
 * - Open/Closed: Can be extended with filters/sorting without modification
 */

type AttendanceRecord = {
    dinnerDate: string;
    attended: boolean;
    location: string;
    mealType?: string;
};

type DinnerAttendanceProps = {
    username: string;
    data?: AttendanceRecord[];
    testID?: string;
};

export function DinnerAttendance({
                                     username,
                                     data,
                                     testID
                                 }: DinnerAttendanceProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme();

    if (!data || data.length === 0) {
        return (
            <View testID={testID}>
                <Text style={[styles.emptyText, {color: Colors[scheme ?? 'light'].icon}]}>
                    {t('admin.noAttendanceRecords')}
                </Text>
            </View>
        );
    }

    return (
        <View testID={testID} style={styles.container}>
            <Text testID="attendance-username" style={[styles.username, {color: Colors[scheme ?? 'light'].text}]}>
                {t('admin.attendanceFor', {username})}
            </Text>

            {data.map((record, index) => (
                <GlassCard
                    key={index}
                    testID={`attendance-item-${index}`}
                    variant="tinted"
                    borderRadius={8}
                    enableElectric={true}
                    enableWaves={true}
                    style={[
                        styles.attendanceCard,
                        {
                            borderLeftColor: record.attended ? '#10B981' : '#EF4444',
                        },
                    ]}
                >
                    <View style={styles.cardRow}>
                        <Text
                            style={[styles.label, {color: Colors[scheme ?? 'light'].icon}]}>{t('admin.dateLabel')}</Text>
                        <Text testID={`attendance-date-${index}`}
                              style={[styles.value, {color: Colors[scheme ?? 'light'].text}]}>
                            {record.dinnerDate}
                        </Text>
                    </View>

                    <View style={styles.cardRow}>
                        <Text
                            style={[styles.label, {color: Colors[scheme ?? 'light'].icon}]}>{t('admin.statusLabel')}</Text>
                        <Text
                            testID={`attendance-status-${index}`}
                            style={[
                                styles.value,
                                styles.statusText,
                                {
                                    color: record.attended ? '#10B981' : '#EF4444',
                                },
                            ]}
                        >
                            {record.attended ? t('admin.attended') : t('admin.notAttended')}
                        </Text>
                    </View>

                    <View style={styles.cardRow}>
                        <Text
                            style={[styles.label, {color: Colors[scheme ?? 'light'].icon}]}>{t('admin.locationLabel')}</Text>
                        <Text testID={`attendance-location-${index}`}
                              style={[styles.value, {color: Colors[scheme ?? 'light'].text}]}>
                            {record.location}
                        </Text>
                    </View>

                    {record.mealType && (
                        <View style={styles.cardRow}>
                            <Text
                                style={[styles.label, {color: Colors[scheme ?? 'light'].icon}]}>{t('admin.mealTypeLabel')}</Text>
                            <Text style={[styles.value, {color: Colors[scheme ?? 'light'].text}]}>
                                {record.mealType}
                            </Text>
                        </View>
                    )}
                </GlassCard>
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginVertical: 8,
    },
    username: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 12,
    },
    attendanceCard: {
        padding: 16,
        marginBottom: 12,
        borderLeftWidth: 4,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    label: {
        fontSize: 14,
    },
    value: {
        fontSize: 14,
        fontWeight: '600',
    },
    statusText: {
        fontWeight: 'bold',
    },
    emptyText: {
        fontSize: 14,
        fontStyle: 'italic',
    },
});
