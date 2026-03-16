import React from 'react';
import {View, Pressable} from 'react-native';
import {useTranslation} from 'react-i18next';
import {GlassAccordion, GlassInput, useColorScheme, Colors, ThemedText, getGlowColor, useGlowVariant, GenderPicker} from '@yuhuu/components';

type PersonalInfoAccordionProps = {
    firstName: string;
    lastName: string;
    phone: string;
    gender: 'male' | 'female' | null;
    onFirstNameChange: (value: string) => void;
    onLastNameChange: (value: string) => void;
    onPhoneChange: (value: string) => void;
    onGenderChange: (value: 'male' | 'female') => void;
    onSave: () => void;
    isSaving: boolean;
    testID?: string;
};

export function PersonalInfoAccordion({
    firstName,
    lastName,
    phone,
    gender,
    onFirstNameChange,
    onLastNameChange,
    onPhoneChange,
    onGenderChange,
    onSave,
    isSaving,
    testID,
}: PersonalInfoAccordionProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

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

                <GenderPicker
                    testID={testID ? `${testID}-gender-picker` : undefined}
                    value={gender}
                    onChange={onGenderChange}
                />

                <Pressable
                    onPress={onSave}
                    disabled={isSaving}
                    style={({ pressed }) => ({
                        backgroundColor: isSaving
                            ? (scheme === 'dark' ? '#4B5563' : '#D1D5DB')
                            : activeColor,
                        borderRadius: 12,
                        paddingVertical: 14,
                        paddingHorizontal: 16,
                        alignItems: "center",
                        marginTop: 8,
                        shadowColor: activeColor,
                        shadowOffset: { width: 0, height: 3 },
                        shadowOpacity: isSaving ? 0 : 0.3,
                        shadowRadius: 6,
                        elevation: isSaving ? 0 : 4,
                        transform: [{ scale: pressed ? 0.97 : 1 }],
                        opacity: isSaving ? 0.6 : 1,
                    })}
                    testID={testID ? `${testID}-save-button` : undefined}
                >
                    <ThemedText
                        style={{
                            color: "#FFFFFF",
                            fontWeight: "700",
                            fontSize: 16,
                            letterSpacing: 0.5,
                        }}
                    >
                        {isSaving ? t("profile.saving") : t("profile.save")}
                    </ThemedText>
                </Pressable>
            </View>
        </GlassAccordion>
    );
}
