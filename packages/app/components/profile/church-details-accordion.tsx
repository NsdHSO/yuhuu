import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassCard, ThemedText, useColorScheme, Colors} from '@yuhuu/components';

type ChurchDetailsAccordionProps = {
    churchName?: string;
    memberSince?: string;
    role?: string;
    testID?: string;
};

export function ChurchDetailsAccordion({
    churchName,
    memberSince,
    role,
    testID,
}: ChurchDetailsAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';

    return (
        <GlassAccordion
            title={t('profile.churchDetails')}
            variant="frosted"
            defaultExpanded={false}
            enableElectric={true}
            enableWaves={false}
            testID={testID}
        >
            {churchName ? (
                <GlassCard
                    variant="tinted"
                    borderRadius={8}
                    style={{padding: 12}}
                >
                    <View style={{gap: 8}}>
                        <ThemedText style={{fontSize: 16, fontWeight: '600'}}>
                            {churchName}
                        </ThemedText>
                        {memberSince && (
                            <ThemedText
                                testID={testID ? `${testID}-member-since` : undefined}
                                style={{fontSize: 14, color: Colors[scheme].tabIconDefault}}
                            >
                                {memberSince}
                            </ThemedText>
                        )}
                        {role && (
                            <ThemedText
                                testID={testID ? `${testID}-role` : undefined}
                                style={{fontSize: 14, color: Colors[scheme].tabIconDefault}}
                            >
                                {role}
                            </ThemedText>
                        )}
                    </View>
                </GlassCard>
            ) : (
                <ThemedText style={{textAlign: 'center', color: Colors[scheme].tabIconDefault}}>
                    {t('profile.noChurchDetails')}
                </ThemedText>
            )}
        </GlassAccordion>
    );
}
