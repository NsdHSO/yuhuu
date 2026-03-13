import {useDinnerStatsQuery} from '@/features/admin/hooks';
import {
  GlassAccordion,
  DinnerGraph,
  Colors,
  useColorScheme,
} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {ActivityIndicator, Text, View, StyleSheet} from 'react-native';

interface DinnerGraphSectionProps {
  testID?: string;
}

export function DinnerGraphSection({testID}: DinnerGraphSectionProps) {
  const {t} = useTranslation();
  const scheme = useColorScheme();
  const {data: dinnerStats, isLoading, error} = useDinnerStatsQuery();

  return (
    <View testID={testID} style={styles.container}>
      <GlassAccordion
        title={t('admin.dinnerParticipation')}
        variant="frosted"
        defaultExpanded={true}
        enableElectric={true}
        enableWaves={false}
        testID={`${testID}-accordion`}
      >
        {isLoading ? (
          <View style={styles.loadingContainer} testID={`${testID}-loading`}>
            <ActivityIndicator
              size="large"
              color={Colors[scheme ?? 'light'].tint}
            />
          </View>
        ) : error ? (
          <Text style={styles.errorText}>{t('admin.loadError')}</Text>
        ) : (
          <DinnerGraph testID={`${testID}-graph`} data={dinnerStats} />
        )}
      </GlassAccordion>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
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
