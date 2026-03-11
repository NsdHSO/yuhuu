import React from 'react';
import {KeyboardAvoidingView, Platform, ScrollView} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Stack} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {ThemedView} from '@yuhuu/components';
import {useRegisterForm} from './hooks/useRegisterForm';
import {RegisterForm} from './components/RegisterForm';

export default function RegisterScreen() {
  const {t} = useTranslation();
  const {email, setEmail, password, setPassword, confirm, setConfirm, firstName, setFirstName, lastName, setLastName, accept, setAccept, submitting, onSubmit} = useRegisterForm();

  return (
    <ThemedView className="flex-1">
      <Stack.Screen options={{title: t('auth.register.title')}} />
      <SafeAreaView style={{flex: 1}} edges={['top', 'left', 'right']}>
        <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16, paddingBottom: 40}} keyboardShouldPersistTaps="handled">
          <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <RegisterForm
              email={email}
              setEmail={setEmail}
              password={password}
              setPassword={setPassword}
              confirm={confirm}
              setConfirm={setConfirm}
              firstName={firstName}
              setFirstName={setFirstName}
              lastName={lastName}
              setLastName={setLastName}
              accept={accept}
              setAccept={setAccept}
              submitting={submitting}
              onSubmit={onSubmit}
            />
          </KeyboardAvoidingView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}
