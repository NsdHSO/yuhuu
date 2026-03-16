import {useState} from 'react';
import {useParticipantsByDinnerQuery} from '@/features/dinners/hooks';
import {
  GlassAccordion,
  DinnerIdSearch,
  ParticipantsList,
  Colors,
  useColorScheme,
} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Text, View, StyleSheet} from 'react-native';

interface DinnerParticipantsSectionProps {
  testID?: string;
}

export function DinnerParticipantsSection({
  testID,
}: DinnerParticipantsSectionProps) {
  const {t} = useTranslation();
  const scheme = useColorScheme();
  const [selectedDinnerId, setSelectedDinnerId] = useState<number | null>(
    null
  );

  const {
    data: participants,
    isLoading,
    error,
  } = useParticipantsByDinnerQuery(selectedDinnerId);

  return (
    <View testID={testID} style={styles.container}>
      <GlassAccordion
        title={t('admin.viewParticipants')}
        variant="frosted"
        defaultExpanded={false}
        enableElectric={true}
        enableWaves={false}
        testID={`${testID}-accordion`}
      >
        <DinnerIdSearch
          testID={`${testID}-search`}
          onDinnerIdChange={setSelectedDinnerId}
        />

        {selectedDinnerId && (
          <View style={styles.participantsContainer}>
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
              <Text style={styles.errorText}>
                {t('admin.participantsLoadError')}
              </Text>
            ) : participants ? (
              <ParticipantsList
                testID={`${testID}-list`}
                participants={participants}
              />
            ) : null}
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
  participantsContainer: {
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
});
