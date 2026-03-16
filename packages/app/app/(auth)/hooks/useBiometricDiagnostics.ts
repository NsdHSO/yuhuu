import {useState, useCallback} from 'react';
import * as LocalAuth from 'expo-local-authentication';
import {TestResult} from '../components/biometric/ResultRow';
import {runPlatformCheck, runNativeModuleCheck, runJSModuleCheck, runNativeMethodCheck} from '../utils/biometric-diagnostics';

export function useBiometricDiagnostics() {
  const [results, setResults] = useState<TestResult[]>([]);
  const [running, setRunning] = useState(false);
  const [authTestRunning, setAuthTestRunning] = useState(false);

  const runDiagnostics = useCallback(async () => {
    setRunning(true);
    console.log('========================================');
    console.log('[BiometricTest] Starting diagnostic suite');
    console.log('========================================');

    const initial: TestResult[] = Array(8).fill(null).map((_, i) => ({label: ['Platform Info', 'Native Module Bridge', 'JS Module Import', 'Native Method Availability', 'hasHardwareAsync()', 'isEnrolledAsync()', 'supportedAuthenticationTypesAsync()', 'getEnrolledLevelAsync()'][i], status: i === 0 ? 'running' : 'idle', value: i === 0 ? 'Checking...' : 'Waiting...'})) as TestResult[];
    setResults(initial);

    const update = (index: number, patch: Partial<TestResult>) => {
      setResults(prev => prev.map((r, i) => (i === index ? {...r, ...patch} : r)));
    };

    update(0, await runPlatformCheck());
    update(1, {...(await runNativeModuleCheck()), status: 'running'});
    update(2, {...(await runJSModuleCheck()), status: 'running'});
    const methodCheck = await runNativeMethodCheck();
    update(3, {...methodCheck, status: 'running'});

    if (methodCheck.status === 'fail') {
      for (let i = 4; i < 8; i++) update(i, {status: 'fail', value: 'Skipped (native methods missing)', error: 'Native module not properly linked'});
      setRunning(false);
      return;
    }

    for (let i = 4; i < 8; i++) {
      update(i, {status: 'running', value: 'Checking...'});
      if (i === 4) {
        try {
          const hasHardware = await LocalAuth.hasHardwareAsync();
          console.log('[BiometricTest] hasHardwareAsync():', hasHardware);
          const isUndefined = hasHardware === undefined;
          update(4, {status: isUndefined ? 'fail' : hasHardware === true ? 'pass' : 'warn', value: `${String(hasHardware)} (type: ${typeof hasHardware})`, error: isUndefined ? 'CRITICAL: Returned undefined. Native bridge may be broken.' : undefined});
        } catch (err: any) {
          update(4, {status: 'fail', value: 'Error', error: err?.message || String(err)});
        }
      } else if (i === 5) {
        try {
          const isEnrolled = await LocalAuth.isEnrolledAsync();
          console.log('[BiometricTest] isEnrolledAsync():', isEnrolled);
          update(5, {status: isEnrolled === undefined ? 'fail' : isEnrolled === true ? 'pass' : 'warn', value: `${String(isEnrolled)} (type: ${typeof isEnrolled})`, error: isEnrolled === undefined ? 'CRITICAL: Returned undefined.' : undefined});
        } catch (err: any) {
          update(5, {status: 'fail', value: 'Error', error: err?.message || String(err)});
        }
      } else if (i === 6) {
        try {
          const types = await LocalAuth.supportedAuthenticationTypesAsync();
          console.log('[BiometricTest] supportedAuthenticationTypesAsync():', types);
          if (!Array.isArray(types)) {
            update(6, {status: 'fail', value: `NOT AN ARRAY: ${String(types)}`, error: 'CRITICAL: Expected array but got non-array.'});
          } else {
            const typeNames = types.map((t: number) => ({1: 'FINGERPRINT', 2: 'FACIAL_RECOGNITION', 3: 'IRIS'}[t] || `UNKNOWN(${t})`));
            update(6, {status: types.length > 0 ? 'pass' : 'warn', value: `Raw: [${types.join(', ')}]\nMapped: [${typeNames.join(', ')}]`});
          }
        } catch (err: any) {
          update(6, {status: 'fail', value: 'Error', error: err?.message || String(err)});
        }
      } else if (i === 7) {
        try {
          const level = await LocalAuth.getEnrolledLevelAsync();
          console.log('[BiometricTest] getEnrolledLevelAsync():', level);
          const levelNames: Record<number, string> = {0: 'NONE', 1: 'SECRET (PIN/Pattern/Password)', 2: 'BIOMETRIC'};
          const levelName = levelNames[level as number] ?? `UNKNOWN(${level})`;
          update(7, {status: level === 2 ? 'pass' : level === 1 ? 'warn' : 'fail', value: `${level} -> ${levelName}`});
        } catch (err: any) {
          update(7, {status: 'fail', value: 'Error', error: err?.message || String(err)});
        }
      }
    }

    console.log('[BiometricTest] Diagnostic suite complete');
    setRunning(false);
  }, []);

  const runAuthTest = useCallback(async (withFallback: boolean) => {
    setAuthTestRunning(true);
    const label = withFallback ? 'authenticateAsync (with fallback)' : 'authenticateAsync (biometric only)';
    const newResult: TestResult = {label, status: 'running', value: 'Prompting user...'};
    setResults(prev => [...prev, newResult]);
    const idx = results.length;

    try {
      const options: LocalAuth.LocalAuthenticationOptions = {promptMessage: 'Biometric Test - Verify your identity', cancelLabel: 'Cancel', disableDeviceFallback: !withFallback};
      if (!withFallback) options.fallbackLabel = '';
      const result = await LocalAuth.authenticateAsync(options);
      setResults(prev => prev.map((r, i) => (i === idx ? {...r, status: result?.success ? 'pass' : 'fail', value: JSON.stringify(result, null, 2), error: !result.success ? `Error code: ${result.error}` : undefined} : r)));
    } catch (err: any) {
      setResults(prev => prev.map((r, i) => (i === idx ? {...r, status: 'fail', value: 'Exception thrown', error: err?.message || String(err)} : r)));
    }

    setAuthTestRunning(false);
  }, [results.length]);

  const clearResults = useCallback(() => setResults([]), []);

  return {results, running, authTestRunning, runDiagnostics, runAuthTest, clearResults};
}
