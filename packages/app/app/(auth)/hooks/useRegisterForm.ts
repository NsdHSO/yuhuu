import {useState} from 'react';
import {Alert} from 'react-native';
import {useRouter} from 'expo-router';
import {useTranslation} from 'react-i18next';
import {authApi, setTokensFromLogin} from '@yuhuu/auth';

export function useRegisterForm() {
  const {t} = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [accept, setAccept] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit() {
    if (!email || !password) return Alert.alert(t('common.missingFields'), t('auth.register.missingFields'));
    if (password !== confirm) return Alert.alert(t('auth.register.passwordMismatchTitle'), t('auth.register.passwordMismatch'));
    if (!accept) return Alert.alert(t('auth.register.termsTitle'), t('auth.register.termsRequired'));

    setSubmitting(true);
    try {
      const body: any = {
        email: email.trim(),
        password,
        username: email.trim(),
        first_name: firstName || undefined,
        last_name: lastName || undefined,
        terms: true,
      };
      const {data} = await authApi.post<any>('/auth/register', body);
      const at = data?.accessToken ?? data?.access_token ?? data?.token ?? data?.message?.access_token;
      const rt = data?.refreshToken ?? data?.refresh_token ?? data?.message?.refresh_token;

      if (at) await setTokensFromLogin(at, rt);
      Alert.alert(t('common.success'), t('auth.register.success'));
      router.replace('/(auth)/login');
    } catch (e: any) {
      const msg = e?.response?.data?.message || t('auth.register.error');
      Alert.alert(t('common.error'), typeof msg === 'string' ? msg : t('auth.register.errorGeneric'));
    } finally {
      setSubmitting(false);
    }
  }

  return {email, setEmail, password, setPassword, confirm, setConfirm, firstName, setFirstName, lastName, setLastName, accept, setAccept, submitting, onSubmit};
}
