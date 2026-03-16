import React, {useMemo} from 'react';
import {Pressable, Switch, TextInput, View} from 'react-native';
import {useTranslation} from 'react-i18next';
import {ThemedText, useColorScheme, Colors, getGlowColor, useGlowVariant} from '@yuhuu/components';
import {AccordionFormActions} from '../shared';
import {TRANSFER_TYPES, type MembershipFormData} from './membershipHelpers';

interface MembershipFormProps {
    formData: MembershipFormData;
    onChangeFormData: (data: MembershipFormData) => void;
    onCancel: () => void;
    onSubmit: () => void;
    isSubmitting: boolean;
}

export function MembershipForm({
    formData,
    onChangeFormData,
    onCancel,
    onSubmit,
    isSubmitting,
}: MembershipFormProps) {
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
        <View testID="membership-form" style={{gap: 12, marginTop: 8}}>
            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.churchName')}
            </ThemedText>
            <TextInput
                testID="membership-church-input"
                value={formData.church_name}
                onChangeText={(text) => onChangeFormData({...formData, church_name: text})}
                placeholder={t('membership.fields.churchNamePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.transferType')}
            </ThemedText>
            <View style={{flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 4}}>
                {TRANSFER_TYPES.map((type) => (
                    <Pressable
                        key={type}
                        onPress={() => onChangeFormData({
                            ...formData,
                            transfer_type: formData.transfer_type === type ? '' : type,
                        })}
                        style={({pressed}) => ({
                            paddingHorizontal: 18,
                            paddingVertical: 12,
                            borderRadius: 24,
                            borderWidth: 2.5,
                            borderColor: formData.transfer_type === type
                                ? activeColor
                                : (scheme === 'dark' ? '#6B7280' : '#9CA3AF'),
                            backgroundColor: formData.transfer_type === type
                                ? `${activeColor}${scheme === 'dark' ? '4D' : '33'}`
                                : (scheme === 'dark' ? 'rgba(75, 85, 99, 0.5)' : 'rgba(255, 255, 255, 0.9)'),
                            shadowColor: formData.transfer_type === type ? activeColor : '#000',
                            shadowOffset: {width: 0, height: 3},
                            shadowOpacity: formData.transfer_type === type ? 0.4 : 0.15,
                            shadowRadius: formData.transfer_type === type ? 6 : 3,
                            elevation: formData.transfer_type === type ? 6 : 3,
                            transform: [{scale: pressed ? 0.92 : 1}],
                            opacity: pressed ? 0.7 : 1,
                        })}
                    >
                        <ThemedText style={{
                            fontSize: 15,
                            fontWeight: formData.transfer_type === type ? '700' : '600',
                            letterSpacing: 0.3,
                            color: formData.transfer_type === type
                                ? (scheme === 'dark' ? '#FFFFFF' : activeColor)
                                : (scheme === 'dark' ? '#D1D5DB' : '#374151'),
                        }}>
                            {t(`membership.transferTypes.${type}`)}
                        </ThemedText>
                    </Pressable>
                ))}
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.previousRole')}
            </ThemedText>
            <TextInput
                testID="membership-role-input"
                value={formData.previous_role}
                onChangeText={(text) => onChangeFormData({...formData, previous_role: text})}
                placeholder={t('membership.fields.previousRolePlaceholder')}
                style={inputStyles.container}
                placeholderTextColor={inputStyles.placeholderColor}
                editable={!isSubmitting}
            />

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                    {t('membership.fields.transferLetterReceived')}
                </ThemedText>
                <Switch
                    testID="membership-letter-switch"
                    value={formData.transfer_letter_received}
                    onValueChange={(val) => onChangeFormData({...formData, transfer_letter_received: val})}
                    disabled={isSubmitting}
                />
            </View>

            <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                <View>
                    <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                        {t('membership.fields.endDate')}
                    </ThemedText>
                    <ThemedText style={{fontSize: 12, color: Colors[scheme].tabIconDefault}}>
                        {t('membership.fields.endDateHint')}
                    </ThemedText>
                </View>
                <Switch
                    testID="membership-has-end-date-switch"
                    value={formData.hasEndDate}
                    onValueChange={(val) => onChangeFormData({...formData, hasEndDate: val})}
                    disabled={isSubmitting}
                />
            </View>

            <ThemedText style={{fontSize: 14, fontWeight: '600'}}>
                {t('membership.fields.notes')}
            </ThemedText>
            <TextInput
                testID="membership-notes-input"
                value={formData.notes}
                onChangeText={(text) => onChangeFormData({...formData, notes: text})}
                placeholder={t('membership.fields.notesPlaceholder')}
                style={[inputStyles.container, {minHeight: 80, textAlignVertical: 'top'}]}
                placeholderTextColor={inputStyles.placeholderColor}
                multiline
                editable={!isSubmitting}
            />

            <AccordionFormActions
                onCancel={onCancel}
                onSubmit={onSubmit}
                isSubmitting={isSubmitting}
                cancelLabel={t('common.cancel')}
                submitLabel={t('common.save')}
                testIDPrefix="membership-form"
            />
        </View>
    );
}
