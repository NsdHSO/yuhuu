import React from 'react';
import {KeyboardAvoidingView, Platform} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Stack} from 'expo-router';
import {ThemedView} from '@yuhuu/components';
import {useTranslation} from 'react-i18next';
import {useLoginForm} from './hooks/useLoginForm';
import {useBiometricSetup} from './hooks/useBiometricSetup';
import {LoginForm} from './components/LoginForm';

export default function LoginScreen() {
  const {t} = useTranslation();
  const {email, setEmail, password, setPassword, submitting, status, handleBiometricLogin, onSubmit} = useLoginForm();
  const {biometricAvailable} = useBiometricSetup();

  return (
    <ThemedView style={{flex: 1}}>
      <Stack.Screen options={{title: t('auth.login.title')}} />
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{flex: 1}}>
          <LoginForm
            email={email}
            setEmail={setEmail}
            password={password}
            setPassword={setPassword}
            submitting={submitting}
            status={status}
            onSubmit={onSubmit}
            biometricAvailable={biometricAvailable}
            handleBiometricLogin={handleBiometricLogin}
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
  );
}
