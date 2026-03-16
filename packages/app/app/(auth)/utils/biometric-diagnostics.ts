import {Platform} from 'react-native';
import * as LocalAuth from 'expo-local-authentication';
import {NativeModulesProxy, requireNativeModule} from 'expo-modules-core';
import {TestResult} from '../components/biometric/ResultRow';

export async function runPlatformCheck(): Promise<TestResult> {
  const platformInfo = `OS: ${Platform.OS}, Version: ${Platform.Version}`;
  console.log('[BiometricTest] Platform info:', platformInfo);
  return {label: 'Platform Info', status: 'pass', value: platformInfo};
}

export async function runNativeModuleCheck(): Promise<TestResult> {
  try {
    const proxy = NativeModulesProxy as any;
    const proxyKeys = proxy ? Object.keys(proxy).filter((k: string) => k.includes('Local') || k.includes('Auth') || k.includes('Biometric')).sort() : [];
    const hasExpoLocalAuth = !!proxy?.ExpoLocalAuthentication;
    const nativeModuleInfo = [`NativeModulesProxy exists: ${!!proxy}`, `ExpoLocalAuthentication in proxy: ${hasExpoLocalAuth}`, `Matching keys: [${proxyKeys.join(', ')}]`].join('\n');
    console.log('[BiometricTest] NativeModulesProxy check:', nativeModuleInfo);

    if (hasExpoLocalAuth) {
      const nativeModule = proxy.ExpoLocalAuthentication;
      const nativeMethods = typeof nativeModule === 'object' && nativeModule ? Object.keys(nativeModule).sort().join(', ') : `type: ${typeof nativeModule}`;
      console.log('[BiometricTest] Native module methods:', nativeMethods);
      return {label: 'Native Module Bridge', status: 'pass', value: `${nativeModuleInfo}\nNative methods: ${nativeMethods}`};
    } else {
      let directLoad = 'Not attempted';
      try {
        const nativeModule = requireNativeModule('ExpoLocalAuthentication');
        const directMethods = Object.keys(nativeModule).sort().join(', ');
        directLoad = `Direct load OK. Methods: ${directMethods}`;
        console.log('[BiometricTest] requireNativeModule succeeded:', directMethods);
        return {label: 'Native Module Bridge', status: 'warn', value: `${nativeModuleInfo}\nProxy missing but direct load OK\n${directLoad}`, error: 'ExpoLocalAuthentication not in NativeModulesProxy but requireNativeModule works'};
      } catch (directErr: any) {
        directLoad = `Direct load FAILED: ${directErr?.message || String(directErr)}`;
        console.error('[BiometricTest] requireNativeModule FAILED:', directErr);
        return {label: 'Native Module Bridge', status: 'fail', value: `${nativeModuleInfo}\n${directLoad}`, error: 'CRITICAL: Native module not loaded. Run: npx expo prebuild --clean && npx expo run:android'};
      }
    }
  } catch (err: any) {
    const msg = err?.message || String(err);
    console.error('[BiometricTest] Native module bridge check ERROR:', msg);
    return {label: 'Native Module Bridge', status: 'fail', value: 'Bridge check failed', error: msg};
  }
}

export async function runJSModuleCheck(): Promise<TestResult> {
  const moduleKeys = Object.keys(LocalAuth).sort().join(', ');
  console.log('[BiometricTest] JS module loaded. Exports:', moduleKeys);
  return {label: 'JS Module Import', status: 'pass', value: `Loaded. Keys: ${moduleKeys}`};
}

export async function runNativeMethodCheck(): Promise<TestResult> {
  const localAuthModule = LocalAuth as Record<string, unknown>;
  const methodChecks = ['hasHardwareAsync', 'isEnrolledAsync', 'supportedAuthenticationTypesAsync', 'getEnrolledLevelAsync', 'authenticateAsync', 'cancelAuthenticate'];
  const methodResults: string[] = [];
  let allMethodsPresent = true;
  let anyMethodMissing = false;
  for (const method of methodChecks) {
    const exists = typeof localAuthModule[method] === 'function';
    const status = exists ? 'OK' : 'MISSING';
    if (!exists) {
      allMethodsPresent = false;
      anyMethodMissing = true;
    }
    methodResults.push(`${method}: ${status} (${typeof localAuthModule[method]})`);
  }
  const methodInfo = methodResults.join('\n');
  console.log('[BiometricTest] Method availability:\n', methodInfo);
  return {label: 'Native Method Availability', status: allMethodsPresent ? 'pass' : 'fail', value: methodInfo, error: anyMethodMissing ? 'CRITICAL: Some native methods missing. Native module may not be linked. Run: npx expo prebuild --clean' : undefined};
}
