import React, {useMemo} from 'react';
import {Pressable, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemedText, useColorScheme, Colors, getGlowColor, useGlowVariant} from '@yuhuu/components';
import type {RelationshipType} from '@/features/family/api';
import {AccordionFormActions} from '../shared';

const RELATIONSHIP_TYPES: RelationshipType[] = ['spouse', 'child', 'parent', 'sibling'];

interface FamilyFormData {
    relationship_type: RelationshipType;
    related_person_name: string;
    related_person_dob: string;
    related_person_phone: string;
    related_person_email: string;
}

interface FamilyFormProps {
    formData: FamilyFormData;
    onChangeFormData: (data: FamilyFormData) => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function FamilyForm({
    formData,
    onChangeFormData,
    onCancel,
    onSubmit,
    isSubmitting,
}: FamilyFormProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    const inputStyles = useMemo(
        () => ({
            container: {
                borderWidth: 1,
                borderColor: scheme === 'dark' ? '#2A2A2A' : '#ccc',
                borderRadius: 8,
                padding: 12,
                color: Colors[scheme].text,
                backgroundColor: scheme === 'dark' ? '#1F2937' : '#fff',
            } as const,
            placeholderColor: scheme === 'dark' ? '#9CA3AF' : '#6B7280',
        }),
        [scheme]
    );

    return (
        <View testID="family-form" style={{gap: 12, marginTop: 8}}>
            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relationshipType')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4}}>
                {RELATIONSHIP_TYPES.map((type) => (
                    <Pressable
                        key={type}
                        onPress={() => onChangeFormData({...formData, relationship_type: type})}
                        style={({pressed}) => ({
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 24,
                            borderWidth: 2.5,
                            borderColor:
                                formData.relationship_type === type
                                    ? activeColor
                                    : scheme === 'dark'
                                      ? '#6B7280'
                                      : '#9CA3AF',
                            backgroundColor:
                                formData.relationship_type === type
                                    ? `${activeColor}${scheme === 'dark' ? '4D' : '33'}`
                                    : scheme === 'dark'
                                      ? 'rgba(75, 85, 99, 0.5)'
                                      : 'rgba(255, 255, 255, 0.9)',
                            shadowColor: formData.relationship_type === type ? activeColor : '#000',
                            shadowOffset: {width: 0, height: 3},
                            shadowOpacity: formData.relationship_type === type ? 0.4 : 0.15,
                            shadowRadius: formData.relationship_type === type ? 6 : 3,
                            elevation: formData.relationship_type === type ? 6 : 3,
                            transform: [{scale: pressed ? 0.92 : 1}],
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <ThemedText
                            style={{
                                fontSize: 15,
                                fontWeight: formData.relationship_type === type ? '700' : '600',
                                letterSpacing: 0.3,
                                color:
                                    formData.relationship_type === type
                                        ? scheme === 'dark'
                                            ? '#FFFFFF'
                                            : activeColor
                                        : scheme === 'dark'
                                          ? '#D1D5DB'
                                          : '#374151',
                            }}
                        >
                            {t(`family.relationshipTypes.${type}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relatedPersonName')}
            </ThemedText>
            <TextInput
                testID="family-name-input"
                value={formData.related_person_name}
                onChangeText={(text) => onChangeFormData({...formData, related_person_name: text})}
                placeholder={t('family.fields.relatedPersonNamePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relatedPersonPhone')}
            </ThemedText>
            <TextInput
                testID="family-phone-input"
                value={formData.related_person_phone}
                onChangeText={(text) => onChangeFormData({...formData, related_person_phone: text})}
                placeholder={t('family.fields.relatedPersonPhonePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                keyboardType="phone-pad"
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('family.fields.relatedPersonEmail')}
            </ThemedText>
            <TextInput
                testID="family-email-input"
                value={formData.related_person_email}
                onChangeText={(text) => onChangeFormData({...formData, related_person_email: text})}
                placeholder={t('family.fields.relatedPersonEmailPlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!isSubmitting}
            />

            <AccordionFormActions
                onCancel={onCancel}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                cancelLabel={t('common.cancel')}
                submitLabel={t('common.save')}
                testIDPrefix="family-form"
            />
        </View>
    );
}
