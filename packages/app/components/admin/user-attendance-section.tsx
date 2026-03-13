import {useState} from 'react';
import {UserSearch} from '@/components/admin/user-search';
import {useUserAttendanceQuery} from '@/features/admin/hooks';
import {
  GlassAccordion,
  DinnerAttendance,
  Colors,
  useColorScheme,
} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Text, View, StyleSheet} from 'react-native';

interface UserAttendanceSectionProps {
  testID?: string;
}

export function UserAttendanceSection({testID}: UserAttendanceSectionProps) {
  const {t} = useTranslation();
  const scheme = useColorScheme();
  const [searchedUser, setSearchedUser] = useState<{
    id: number;
    username: string;
  } | null>(null);

  const {
    data: userAttendance,
    isLoading,
    error,
  } = useUserAttendanceQuery(searchedUser?.username ?? '');

  return (
    <View testID={testID} style={styles.container}>
      <GlassAccordion
        title={t('admin.searchUser')}
        variant="frosted"
        defaultExpanded={true}
        enableElectric={true}
        enableWaves={false}
        testID={`${testID}-accordion`}
      >
        <UserSearch testID={`${testID}-search`} onSearch={setSearchedUser} />

        {searchedUser && (
          <View style={styles.attendanceContainer}>
            {isLoading ? (
              <View
                style={styles.loadingContainer}
                testID={`${testID}-loading`}
              >
                <ActivityIndicator
                  size="large"
                  color={Colors[scheme ?? 'light'].tint}
                />
              </View>
            ) : error ? (
              <Text style={styles.errorText}>{t('admin.userNotFound')}</Text>
            ) : userAttendance && userAttendance.length === 0 ? (
              <Text
                style={[
                  styles.emptyText,
                  {color: Colors[scheme ?? 'light'].icon},
                ]}
              >
                {t('admin.noAttendanceRecords')}
              </Text>
            ) : (
              <DinnerAttendance
                testID={`${testID}-attendance`}
                username={searchedUser.username}
                data={userAttendance}
              />
            )}
          </View>
        )}
      </GlassAccordion>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  attendanceContainer: {
    marginTop: 16,
  },
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  errorText: {
    fontSize: 14,
    marginVertical: 8,
    color: '#EF4444',
  },
  emptyText: {
    fontSize: 14,
    marginVertical: 8,
    fontStyle: 'italic',
  },
});
