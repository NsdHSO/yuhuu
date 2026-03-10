import React from 'react';
import {View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassInput, useColorScheme, Colors} from '@yuhuu/components';

type PersonalInfoAccordionProps = {
    firstName: string;
    lastName: string;
    phone: string;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    testID?: string;
};

export function PersonalInfoAccordion({
    firstName,
    lastName,
    phone,
    onFirstNameChange,
    onLastNameChange,
    onPhoneChange,
    testID,
}: PersonalInfoAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';

    return (
        <GlassAccordion
            title={t('profile.personalInfo')}
            variant="frosted"
            defaultExpanded={true}
            enableElectric={true}
            enableWaves={false}
            testID={testID}
        >
            <View style={{gap: 12}}>
                <GlassInput
                    testID={testID ? `${testID}-first-name` : undefined}
                    value={firstName}
                    onChangeText={onFirstNameChange}
                    placeholder={t('profile.firstNamePlaceholder')}
                    selectionColor={Colors[scheme].tint}
                    variant="tinted"
                />
                <GlassInput
                    testID={testID ? `${testID}-last-name` : undefined}
                    value={lastName}
                    onChangeText={onLastNameChange}
                    placeholder={t('profile.lastNamePlaceholder')}
                    selectionColor={Colors[scheme].tint}
                    variant="tinted"
                />
                <GlassInput
                    testID={testID ? `${testID}-phone` : undefined}
                    value={phone}
                    onChangeText={onPhoneChange}
                    placeholder={t('profile.phonePlaceholder')}
                    keyboardType="phone-pad"
                    selectionColor={Colors[scheme].tint}
                    variant="tinted"
                />
            </View>
        </GlassAccordion>
    );
}
