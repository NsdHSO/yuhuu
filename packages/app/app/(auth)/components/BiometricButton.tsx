import React from 'react';
import {Platform, Text, TouchableOpacity, View} from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';
import {ThemedText, useColorScheme} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';

interface BiometricButtonProps {
  onPress: () => void;
  disabled: boolean;
}

export function BiometricButton({onPress, disabled}: BiometricButtonProps) {
  const {t} = useTranslation();
  const scheme = useColorScheme() ?? 'light';

  return (
    <>
      <View testID="biometric-divider" style={{flexDirection: 'row', alignItems: 'center', marginTop: 16}}>
        <View style={{flex: 1, height: 1, backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB'}} />
        <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={{marginHorizontal: 12, fontSize: 13}}>
          {t('auth.login.biometricDivider')}
        </ThemedText>
        <View style={{flex: 1, height: 1, backgroundColor: scheme === 'dark' ? '#2A2A2A' : '#E5E7EB'}} />
      </View>
      <TouchableOpacity
        testID="biometric-login-button"
        onPress={onPress}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityLabel={Platform.OS === 'ios' ? t('auth.login.biometricAccessibilityLabel') : t('auth.login.biometricAccessibilityLabelAndroid')}
        accessibilityHint={t('auth.login.biometricAccessibilityHint')}
        style={{marginTop: 12, alignItems: 'center', justifyContent: 'center', paddingVertical: 12}}
      >
        <Ionicons name="finger-print" size={36} color={scheme === 'dark' ? '#60A5FA' : '#1e90ff'} />
        <Text style={{color: scheme === 'dark' ? '#60A5FA' : '#1e90ff', fontSize: 14, marginTop: 4}}>
          {Platform.OS === 'ios' ? t('auth.login.biometricButton') : t('auth.login.biometricButtonAndroid')}
        </Text>
      </TouchableOpacity>
    </>
  );
}
