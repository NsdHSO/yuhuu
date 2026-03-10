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
      enableElectric={true}
      enableWaves={false}
      testID="church-information-accordion"
    >
      <View style={{ gap: 12 }}>
        <FamilyAccordion userId={userId} />
        <MilestonesAccordion userId={userId} />
        <MembershipAccordion userId={userId} />
        <SkillsAccordion userId={userId} />
      </View>
    </GlassAccordion>
  );
}
