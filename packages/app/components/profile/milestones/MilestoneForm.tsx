import React from 'react';
import {Pressable, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {Colors, getGlowColor, GlassInput, ThemedText, useColorScheme, useGlowVariant} from '@yuhuu/components';
import {AccordionFormActions} from '../shared';
import {getMilestoneIcon, getMilestoneLabel, MILESTONE_TYPES} from './milestonesHelpers';
import type {MilestoneFormData} from './milestonesHelpers';

interface MilestoneFormProps {
    formData: MilestoneFormData;
    onChangeFormData: (data: MilestoneFormData) => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
    isEditMode?: boolean;
}

export function MilestoneForm({
    formData,
    onChangeFormData,
    onCancel,
    onSubmit,
    isSubmitting,
    isEditMode = false,
}: MilestoneFormProps) {
    const {t} = useTranslation();
    const scheme = useColorScheme() ?? 'light';
    const {glowVariant} = useGlowVariant();
    const activeColor = getGlowColor(glowVariant, scheme);

    return (
        <View testID="milestone-form" style={{gap: 12, marginTop: 8}}>
            {!isEditMode && (
                <>
                    <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                        {t('milestones.fields.milestoneType')}
                    </ThemedText>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4}}>
                        {MILESTONE_TYPES.map((type) => (
                            <Pressable
                                key={type}
                                onPress={() => onChangeFormData({...formData, milestone_type: type})}
                                style={({pressed}) => ({
                                    paddingHorizontal: 18,
                                    paddingVertical: 12,
                                    borderRadius: 24,
                                    borderWidth: 2.5,
                                    borderColor:
                                        formData.milestone_type === type
                                            ? activeColor
                                            : scheme === 'dark'
                                              ? '#6B7280'
                                              : '#9CA3AF',
                                    backgroundColor:
                                        formData.milestone_type === type
                                            ? `${activeColor}${scheme === 'dark' ? '4D' : '33'}`
                                            : scheme === 'dark'
                                              ? 'rgba(75, 85, 99, 0.5)'
                                              : 'rgba(255, 255, 255, 0.9)',
                                    shadowColor: formData.milestone_type === type ? activeColor : '#000',
                                    shadowOffset: {width: 0, height: 3},
                                    shadowOpacity: formData.milestone_type === type ? 0.4 : 0.15,
                                    shadowRadius: formData.milestone_type === type ? 6 : 3,
                                    elevation: formData.milestone_type === type ? 6 : 3,
                                    transform: [{scale: pressed ? 0.92 : 1}],
                                    opacity: pressed ? 0.7 : 1,
                                })}
                            >
                                <ThemedText
                                    style={{
                                        fontSize: 15,
                                        fontWeight: formData.milestone_type === type ? '700' : '600',
                                        letterSpacing: 0.3,
                                        color:
                                            formData.milestone_type === type
                                                ? scheme === 'dark'
                                                    ? '#FFFFFF'
                                                    : activeColor
                                                : scheme === 'dark'
                                                  ? '#D1D5DB'
                                                  : '#374151',
                                    }}
                                >
                                    {t(`milestones.milestoneTypes.${type}`)}
                                </ThemedText>
                            </Pressable>
                        ))}
                    </View>
                </>
            )}

            {isEditMode && (
                <ThemedText style={{fontSize: 14, fontWeight: '600', color: Colors[scheme].tabIconDefault}}>
                    {getMilestoneIcon(formData.milestone_type)} {getMilestoneLabel(formData.milestone_type)}
                </ThemedText>
            )}

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('milestones.fields.location')}
            </ThemedText>
            <GlassInput
                testID="milestone-location-input"
                value={formData.location}
                onChangeText={(text) => onChangeFormData({...formData, location: text})}
                placeholder={t('milestones.fields.locationPlaceholder')}
                editable={!isSubmitting}
                variant="tinted"
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('milestones.fields.officiant')}
            </ThemedText>
            <GlassInput
                testID="milestone-officiant-input"
                value={formData.officiant}
                onChangeText={(text) => onChangeFormData({...formData, officiant: text})}
                placeholder={t('milestones.fields.officiantPlaceholder')}
                editable={!isSubmitting}
                variant="tinted"
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('milestones.fields.notes')}
            </ThemedText>
            <GlassInput
                testID="milestone-notes-input"
                value={formData.notes}
                onChangeText={(text) => onChangeFormData({...formData, notes: text})}
                placeholder={t('milestones.fields.notesPlaceholder')}
                style={{minHeight: 80, textAlignVertical: 'top'}}
                multiline
                editable={!isSubmitting}
                variant="tinted"
            />

            <AccordionFormActions
                onCancel={onCancel}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                cancelLabel={t('common.cancel')}
                submitLabel={t('common.save')}
                testIDPrefix="milestone-form"
            />
        </View>
    );
}
