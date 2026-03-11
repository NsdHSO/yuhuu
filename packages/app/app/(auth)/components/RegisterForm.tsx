import React from 'react';
import {Pressable, Switch, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {AuthInput} from './AuthInput';
import {buttonStyles} from '../styles/input-styles';

interface RegisterFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirm: string;
  setConfirm: (v: string) => void;
  firstName: string;
  setFirstName: (v: string) => void;
  lastName: string;
  setLastName: (v: string) => void;
  accept: boolean;
  setAccept: (v: boolean) => void;
  submitting: boolean;
  onSubmit: () => void;
}

export function RegisterForm(props: RegisterFormProps) {
  const {t} = useTranslation();
  const router = useRouter();

  return (
    <View>
      <ThemedText type="title" style={{marginBottom: 24}}>{t('auth.register.createAccount')}</ThemedText>
      <AuthInput value={props.email} onChangeText={props.setEmail} placeholder={t('auth.register.emailPlaceholder')} autoCapitalize="none" keyboardType="email-address" textContentType="username" autoComplete="username-new" importantForAutofill="yes" autoCorrect={false} />
      <View style={{height: 12}} />
      <AuthInput value={props.password} onChangeText={props.setPassword} placeholder={t('auth.register.passwordPlaceholder')} secureTextEntry textContentType="newPassword" autoComplete="password-new" importantForAutofill="yes" />
      <View style={{height: 12}} />
      <AuthInput value={props.confirm} onChangeText={props.setConfirm} placeholder={t('auth.register.confirmPassword')} secureTextEntry textContentType="newPassword" autoComplete="password-new" importantForAutofill="yes" />
      <View style={{height: 12}} />
      <AuthInput value={props.firstName} onChangeText={props.setFirstName} placeholder={t('auth.register.firstNamePlaceholder')} />
      <View style={{height: 12}} />
      <AuthInput value={props.lastName} onChangeText={props.setLastName} placeholder={t('auth.register.lastNamePlaceholder')} />
      <View style={{height: 16}} />
      <View style={{flexDirection: 'row', alignItems: 'center', gap: 8}}>
        <Switch value={props.accept} onValueChange={props.setAccept} />
        <ThemedText>{t('auth.register.acceptTerms')}</ThemedText>
      </View>
      <View style={{height: 16}} />
      <TouchableOpacity onPress={props.onSubmit} disabled={props.submitting} activeOpacity={0.7} style={buttonStyles.primary}>
        <Text style={buttonStyles.text}>{props.submitting ? t('auth.register.submitting') : t('auth.register.submit')}</Text>
      </TouchableOpacity>
      <View style={{height: 16}} />
      <Pressable onPress={() => router.replace('/(auth)/login')} style={({pressed}) => ({opacity: pressed ? 0.7 : 1, alignItems: 'center', paddingVertical: 8})}>
        <ThemedText lightColor="#6B7280" darkColor="#9CA3AF">{t('auth.register.hasAccount')}</ThemedText>
      </Pressable>
    </View>
  );
}
