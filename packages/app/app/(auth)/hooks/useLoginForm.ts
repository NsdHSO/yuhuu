import {useState} from 'react';
import {Alert} from 'react-native';
import {useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {useAuth} from '@/providers/AuthProvider';

export function useLoginForm() {
  const {t} = useTranslation();
  const router = useRouter();
  const {signIn, signInWithBiometrics, status} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleBiometricLogin() {
    setSubmitting(true);
    try {
      await signInWithBiometrics();
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.message || t('auth.login.biometricError');
      Alert.alert(t('common.error'), msg);
    } finally {
      setSubmitting(false);
    }
  }

  async function onSubmit() {
    if (!email || !password) {
      Alert.alert(t('common.missingFields'), t('auth.login.missingFields'));
      return;
    }
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
      router.replace('/(tabs)');
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('auth.login.error');
      Alert.alert(t('common.error'), msg);
    } finally {
      setSubmitting(false);
    }
  }

  return {
    email,
    setEmail,
    password,
    setPassword,
    submitting,
    status,
    handleBiometricLogin,
    onSubmit,
  };
}
