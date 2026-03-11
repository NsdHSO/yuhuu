import React, {useRef} from 'react';
import {Dimensions, Pressable, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {useRouter} from 'expo-router';
import {ThemedText} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {AuthInput} from './AuthInput';
import {BiometricButton} from './BiometricButton';
import {buttonStyles} from '../styles/input-styles';

const {height: SCREEN_HEIGHT} = Dimensions.get('window');

interface LoginFormProps {
  email: string;
  setEmail: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  submitting: boolean;
  status: string;
  onSubmit: () => void;
  biometricAvailable: boolean;
  handleBiometricLogin: () => void;
}

export function LoginForm({email, setEmail, password, setPassword, submitting, status, onSubmit, biometricAvailable, handleBiometricLogin}: LoginFormProps) {
  const {t} = useTranslation();
  const router = useRouter();
  const scrollViewRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<View>(null);
  const passwordInputRef = useRef<View>(null);

  const scrollToInput = (inputRef: React.RefObject<View | null>) => {
    if (inputRef.current && scrollViewRef.current) {
      inputRef.current.measureLayout(scrollViewRef.current as any, (x, y, width, height) => {
        const inputCenterY = y + height / 2;
        const screenCenterY = SCREEN_HEIGHT / 2;
        const scrollToY = inputCenterY - screenCenterY + 100;
        scrollViewRef.current?.scrollTo({y: Math.max(0, scrollToY), animated: true});
      }, () => {});
    }
  };

  return (
    <ScrollView ref={scrollViewRef} style={{flex: 1}} contentContainerStyle={{padding: 16, paddingBottom: 40}} keyboardShouldPersistTaps="handled">
      <ThemedText type="title" style={{marginBottom: 24}}>{t('auth.login.welcome')}</ThemedText>
      <AuthInput inputRef={emailInputRef} value={email} onChangeText={setEmail} placeholder={t('auth.login.emailPlaceholder')} autoCapitalize="none" keyboardType="email-address" textContentType="username" autoComplete="username" importantForAutofill="yes" autoCorrect={false} onFocusCallback={() => scrollToInput(emailInputRef)} />
      <View style={{height: 12}} />
      <AuthInput inputRef={passwordInputRef} value={password} onChangeText={setPassword} placeholder={t('auth.login.passwordPlaceholder')} secureTextEntry textContentType="password" autoComplete="password" importantForAutofill="yes" onFocusCallback={() => scrollToInput(passwordInputRef)} />
      <View style={{height: 16}} />
      <TouchableOpacity onPress={onSubmit} disabled={submitting || status === 'loading'} activeOpacity={0.7} style={buttonStyles.primary}>
        <Text style={buttonStyles.text}>{submitting ? t('auth.login.submitting') : t('auth.login.submit')}</Text>
      </TouchableOpacity>
      {biometricAvailable && <BiometricButton onPress={handleBiometricLogin} disabled={submitting || status === 'loading'} />}
      <View style={{height: 16}} />
      <Pressable onPress={() => router.push('/(auth)/register')} style={({pressed}) => ({opacity: pressed ? 0.7 : 1, alignItems: 'center', paddingVertical: 8})}>
        <ThemedText lightColor="#6B7280" darkColor="#9CA3AF">{t('auth.login.noAccount')}</ThemedText>
      </Pressable>
    </ScrollView>
  );
}
