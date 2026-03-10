import React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GlassAccordion } from '@yuhuu/components';
import { FamilyAccordion } from './family-accordion';
import { MilestonesAccordion } from './milestones-accordion';
import { MembershipAccordion } from './membership-accordion';
import { SkillsAccordion } from './skills-accordion';

type ChurchInformationAccordionProps = {
  userId?: number;
};

export function ChurchInformationAccordion({ userId }: ChurchInformationAccordionProps) {
  const { t } = useTranslation();

  return (
    <GlassAccordion
      title={t('church.information')}
      variant="frosted"
      enableElectric={false}
      enableWaves={false}
      headerOnly={true}
      testID="church-information-accordion"
    >
      <View style={{ gap: 8 }}>
        <View style={{ marginBottom: 4 }}>
          <FamilyAccordion userId={userId} />
        </View>
        <View style={{ marginBottom: 4 }}>
          <MilestonesAccordion userId={userId} />
        </View>
        <View style={{ marginBottom: 4 }}>
          <MembershipAccordion userId={userId} />
        </View>
        <View style={{ marginBottom: 4 }}>
          <SkillsAccordion userId={userId} />
        </View>
      </View>
    </GlassAccordion>
  );
}
