import {DinnerGraphSection} from './dinner-graph-section';
import {DinnerCreationSection} from './dinner-creation-section';
import {UserAttendanceSection} from './user-attendance-section';
import {DinnerParticipantsSection} from './dinner-participants-section';
import {GlassAccordion} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {View, StyleSheet} from 'react-native';

interface DinnerManagementContainerProps {
  testID?: string;
}

/**
 * Dinner Management Container - Orchestrates 4 dinner management sections
 * SOLID Principles:
 * - Single Responsibility: Composes dinner management sections only
 * - Open/Closed: Can add new sections without modifying existing ones
 * - Follows ChurchInformationAccordion orchestrator pattern
 */
export function DinnerManagementContainer({
  testID,
}: DinnerManagementContainerProps) {
  const {t} = useTranslation();

  return (
    <View testID={testID} style={styles.container}>
      <GlassAccordion
        title={t('admin.dinnerManagement')}
        variant="frosted"
        defaultExpanded={true}
        enableElectric={true}
        enableWaves={false}
        testID={`${testID}-accordion`}
      >
        <DinnerGraphSection testID="dinner-graph-section" />
        <DinnerCreationSection testID="dinner-creation-section" />
        <UserAttendanceSection testID="user-search-section" />
        <DinnerParticipantsSection testID="dinner-participants-section" />
      </GlassAccordion>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
});
