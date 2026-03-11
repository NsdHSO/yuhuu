import {useEffect, useState} from 'react';
import {getBiometricPreference, isBiometricAvailable} from '@yuhuu/auth';

export function useBiometricSetup() {
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const [available, enabled] = await Promise.all([
          isBiometricAvailable(),
          getBiometricPreference(),
        ]);
        setBiometricAvailable(available && enabled);
      } catch {
        setBiometricAvailable(false);
      }
    })();
  }, []);

  return {biometricAvailable};
}
