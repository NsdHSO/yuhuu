import React, {useMemo} from 'react';
import {Pressable, Switch, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemedText, useColorScheme, Colors, getGlowColor, useGlowVariant} from '@yuhuu/components';
import {AccordionFormActions} from '../shared';
import {CATEGORIES, PROFICIENCY_LEVELS, getProficiencyColor} from './skillsHelpers';
import type {SkillFormData} from './skillsHelpers';

interface SkillFormProps {
    formData: SkillFormData;
    onChangeFormData: (data: SkillFormData) => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function SkillForm({formData, onChangeFormData, onCancel, onSubmit, isSubmitting}: SkillFormProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const inputStyles = useMemo(() => ({
        container: {
            borderWidth: 1,
            borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
            borderRadius: 8,
            padding: 12,
            color: Colors[scheme].text,
            backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
        } as const,
        placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
    }), [scheme]);

    return (
        <View testID="skill-form" style={{gap: 12, marginTop: 8}}>
            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.skillName')}
            </ThemedText>
            <TextInput
                testID="skill-name-input"
                value={formData.skill_name}
                onChangeText={(text) => onChangeFormData({...formData, skill_name: text})}
                placeholder={t('skills.fields.skillNamePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.skillCategory')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4}}>
                {CATEGORIES.map(cat => (
                    <Pressable
                        key={cat}
                        onPress={() => onChangeFormData({
                            ...formData,
                            skill_category: formData.skill_category === cat ? '' : cat,
                        })}
                        style={({pressed}) => ({
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 24,
                            borderWidth: 2.5,
                            borderColor: formData.skill_category === cat
                                ? activeColor
                                : (scheme === 'dark' ? '#6B7280' : '#9CA3AF'),
                            backgroundColor: formData.skill_category === cat
                                ? `${activeColor}${scheme === 'dark' ? '4D' : '33'}`
                                : (scheme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.9)'),
                            shadowColor: formData.skill_category === cat ? activeColor : '#000',
                            shadowOffset: {width: 0, height: 3},
                            shadowOpacity: formData.skill_category === cat ? 0.4 : 0.15,
                            shadowRadius: formData.skill_category === cat ? 6 : 3,
                            elevation: formData.skill_category === cat ? 6 : 3,
                            transform: [{scale: pressed ? 0.92 : 1}],
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <ThemedText style={{
                            fontSize: 15,
                            fontWeight: formData.skill_category === cat ? '700' : '600',
                            letterSpacing: 0.3,
                            color: formData.skill_category === cat
                                ? (scheme === 'dark' ? '#FFFFFF' : activeColor)
                                : (scheme === 'dark' ? '#D1D5DB' : '#374151')
                        }}>
                            {t(`skills.categories.${cat}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.proficiencyLevel')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 8}}>
                {PROFICIENCY_LEVELS.map(level => (
                    <Pressable
                        key={level}
                        onPress={() => onChangeFormData({
                            ...formData,
                            proficiency_level: formData.proficiency_level === level ? '' : level,
                        })}
                        style={{
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 16,
                            borderWidth: 1,
                            borderColor: formData.proficiency_level === level
                                ? getProficiencyColor(level)
                                : (scheme === 'dark' ? '#374151' : '#D1D5DB'),
                            backgroundColor: formData.proficiency_level === level
                                ? getProficiencyColor(level) + '33'
                                : 'transparent',
                        }}
                    >
                        <ThemedText style={{fontSize: 13}}>
                            {t(`skills.proficiencyLevels.${level}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('skills.fields.yearsOfExperience')}
            </ThemedText>
            <TextInput
                testID="skill-years-input"
                value={formData.years_of_experience}
                onChangeText={(text) => onChangeFormData({...formData, years_of_experience: text.replace(/[^0-9]/g, '')})}
                placeholder={t('skills.fields.yearsOfExperiencePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                keyboardType="numeric"
                editable={!isSubmitting}
            />

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                    {t('skills.fields.isWillingToServe')}
                </ThemedText>
                <Switch
                    testID="skill-willing-switch"
                    value={formData.is_willing_to_serve}
                    onValueChange={(val) => onChangeFormData({...formData, is_willing_to_serve: val})}
                    disabled={isSubmitting}
                />
            </View>

            <AccordionFormActions
                onCancel={onCancel}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                cancelLabel={t('common.cancel')}
                submitLabel={t('common.save')}
                testIDPrefix="skill-form"
            />
        </View>
    );
}
