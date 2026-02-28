import React, { useState, useCallback } from 'react';
import { Platform, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Stack } from 'expo-router';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { NativeModulesProxy, requireNativeModule } from 'expo-modules-core';
import * as LocalAuth from 'expo-local-authentication';

type TestStatus = 'idle' | 'running' | 'pass' | 'fail' | 'warn';

interface TestResult {
    label: string;
    status: TestStatus;
    value: string;
    error?: string;
}

function StatusBadge({ status }: { status: TestStatus }) {
    const colors: Record<TestStatus, { bg: string; text: string; label: string }> = {
        idle: { bg: '#6B7280', text: '#fff', label: 'IDLE' },
        running: { bg: '#F59E0B', text: '#000', label: 'RUNNING' },
        pass: { bg: '#10B981', text: '#fff', label: 'PASS' },
        fail: { bg: '#EF4444', text: '#fff', label: 'FAIL' },
        warn: { bg: '#F97316', text: '#fff', label: 'WARN' },
    };
    const c = colors[status];
    return (
        <View style={{ backgroundColor: c.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2 }}>
            <Text style={{ color: c.text, fontSize: 11, fontWeight: '700' }}>{c.label}</Text>
        </View>
    );
}

function ResultRow({ result, scheme }: { result: TestResult; scheme: 'light' | 'dark' }) {
    return (
        <View
            style={{
                backgroundColor: scheme === 'dark' ? '#1F2937' : '#F9FAFB',
                borderRadius: 8,
                padding: 12,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: scheme === 'dark' ? '#374151' : '#E5E7EB',
            }}
        >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ color: scheme === 'dark' ? '#D1D5DB' : '#374151', fontWeight: '600', fontSize: 13, flex: 1 }}>
                    {result.label}
                </Text>
                <StatusBadge status={result.status} />
            </View>
            <Text style={{ color: scheme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' }}>
                {result.value}
            </Text>
            {result.error ? (
                <Text style={{ color: '#EF4444', fontSize: 11, marginTop: 4 }}>
                    {result.error}
                </Text>
            ) : null}
        </View>
    );
}

export default function BiometricTestScreen() {
    const scheme = useColorScheme() ?? 'light';
    const [results, setResults] = useState<TestResult[]>([]);
    const [running, setRunning] = useState(false);
    const [authTestRunning, setAuthTestRunning] = useState(false);

    const runDiagnostics = useCallback(async () => {
        setRunning(true);
        console.log('========================================');
        console.log('[BiometricTest] Starting diagnostic suite');
        console.log('[BiometricTest] Platform:', Platform.OS, Platform.Version);
        console.log('========================================');

        const initial: TestResult[] = [
            { label: 'Platform Info', status: 'running', value: 'Checking...' },
            { label: 'Native Module Bridge', status: 'idle', value: 'Waiting...' },
            { label: 'JS Module Import', status: 'idle', value: 'Waiting...' },
            { label: 'Native Method Availability', status: 'idle', value: 'Waiting...' },
            { label: 'hasHardwareAsync()', status: 'idle', value: 'Waiting...' },
            { label: 'isEnrolledAsync()', status: 'idle', value: 'Waiting...' },
            { label: 'supportedAuthenticationTypesAsync()', status: 'idle', value: 'Waiting...' },
            { label: 'getEnrolledLevelAsync()', status: 'idle', value: 'Waiting...' },
        ];
        setResults(initial);

        const update = (index: number, patch: Partial<TestResult>) => {
            setResults(prev => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
        };

        // Test 0: Platform info
        const platformInfo = `OS: ${Platform.OS}, Version: ${Platform.Version}`;
        console.log('[BiometricTest] Platform info:', platformInfo);
        update(0, { status: 'pass', value: platformInfo });

        // Test 1: Native module bridge check via NativeModulesProxy
        update(1, { status: 'running', value: 'Checking NativeModulesProxy...' });
        try {
            const proxy = NativeModulesProxy as any;
            const proxyKeys = proxy ? Object.keys(proxy).filter((k: string) => k.includes('Local') || k.includes('Auth') || k.includes('Biometric')).sort() : [];
            const hasExpoLocalAuth = !!proxy?.ExpoLocalAuthentication;
            const nativeModuleInfo = [
                `NativeModulesProxy exists: ${!!proxy}`,
                `ExpoLocalAuthentication in proxy: ${hasExpoLocalAuth}`,
                `Matching keys: [${proxyKeys.join(', ')}]`,
            ].join('\n');
            console.log('[BiometricTest] NativeModulesProxy check:', nativeModuleInfo);

            if (hasExpoLocalAuth) {
                const nativeModule = proxy.ExpoLocalAuthentication;
                const nativeMethods = typeof nativeModule === 'object' && nativeModule
                    ? Object.keys(nativeModule).sort().join(', ')
                    : `type: ${typeof nativeModule}`;
                console.log('[BiometricTest] Native module methods:', nativeMethods);
                update(1, {
                    status: 'pass',
                    value: `${nativeModuleInfo}\nNative methods: ${nativeMethods}`,
                });
            } else {
                // Also try requireNativeModule directly
                let directLoad = 'Not attempted';
                try {
                    const nativeModule = requireNativeModule('ExpoLocalAuthentication');
                    const directMethods = Object.keys(nativeModule).sort().join(', ');
                    directLoad = `Direct load OK. Methods: ${directMethods}`;
                    console.log('[BiometricTest] requireNativeModule succeeded:', directMethods);
                    update(1, {
                        status: 'warn',
                        value: `${nativeModuleInfo}\nProxy missing but direct load OK\n${directLoad}`,
                        error: 'ExpoLocalAuthentication not in NativeModulesProxy but requireNativeModule works',
                    });
                } catch (directErr: any) {
                    directLoad = `Direct load FAILED: ${directErr?.message || String(directErr)}`;
                    console.error('[BiometricTest] requireNativeModule FAILED:', directErr);
                    update(1, {
                        status: 'fail',
                        value: `${nativeModuleInfo}\n${directLoad}`,
                        error: 'CRITICAL: Native module not loaded. Run: npx expo prebuild --clean && npx expo run:android',
                    });
                }
            }
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.error('[BiometricTest] Native module bridge check ERROR:', msg);
            update(1, { status: 'fail', value: 'Bridge check failed', error: msg });
        }

        // Test 2: JS Module Import
        update(2, { status: 'running', value: 'Importing expo-local-authentication...' });
        const moduleKeys = Object.keys(LocalAuth).sort().join(', ');
        console.log('[BiometricTest] JS module loaded. Exports:', moduleKeys);
        update(2, { status: 'pass', value: `Loaded. Keys: ${moduleKeys}` });

        // Test 3: Native method availability check (detect broken bridge)
        update(3, { status: 'running', value: 'Checking native method bindings...' });
        const localAuthModule = LocalAuth as Record<string, unknown>;
        const methodChecks = [
            'hasHardwareAsync',
            'isEnrolledAsync',
            'supportedAuthenticationTypesAsync',
            'getEnrolledLevelAsync',
            'authenticateAsync',
            'cancelAuthenticate',
        ];
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
        update(3, {
            status: allMethodsPresent ? 'pass' : 'fail',
            value: methodInfo,
            error: anyMethodMissing ? 'CRITICAL: Some native methods missing. Native module may not be linked. Run: npx expo prebuild --clean' : undefined,
        });

        if (anyMethodMissing) {
            for (let i = 4; i < initial.length; i++) {
                update(i, { status: 'fail', value: 'Skipped (native methods missing)', error: 'Native module not properly linked' });
            }
            setRunning(false);
            return;
        }

        // Test 4: hasHardwareAsync
        update(4, { status: 'running', value: 'Checking...' });
        try {
            const hasHardware = await LocalAuth.hasHardwareAsync();
            console.log('[BiometricTest] hasHardwareAsync():', hasHardware, typeof hasHardware);
            const isUndefined = hasHardware === undefined;
            const isNull = hasHardware === null;
            let status: TestStatus = hasHardware === true ? 'pass' : 'warn';
            let errorMsg: string | undefined;
            if (isUndefined) {
                status = 'fail';
                errorMsg = 'CRITICAL: Returned undefined instead of boolean. Native bridge may be broken. Rebuild with: npx expo prebuild --clean && npx expo run:android';
            } else if (isNull) {
                status = 'fail';
                errorMsg = 'CRITICAL: Returned null. Native module communication failure.';
            }
            update(4, {
                status,
                value: `${String(hasHardware)} (type: ${typeof hasHardware}, strict: ${hasHardware === true ? 'true' : hasHardware === false ? 'false' : 'UNEXPECTED'})`,
                error: errorMsg,
            });
        } catch (err: any) {
            const msg = err?.message || String(err);
            const isUnavailability = msg.includes('UnavailabilityError') || msg.includes('is not available');
            console.error('[BiometricTest] hasHardwareAsync() ERROR:', msg);
            update(4, {
                status: 'fail',
                value: 'Error',
                error: isUnavailability
                    ? `Native method not available: ${msg}. Run: npx expo prebuild --clean && npx expo run:android`
                    : msg,
            });
        }

        // Test 5: isEnrolledAsync
        update(5, { status: 'running', value: 'Checking...' });
        try {
            const isEnrolled = await LocalAuth.isEnrolledAsync();
            console.log('[BiometricTest] isEnrolledAsync():', isEnrolled, typeof isEnrolled);
            const isUndefined = isEnrolled === undefined;
            let status: TestStatus = isEnrolled === true ? 'pass' : 'warn';
            let errorMsg: string | undefined;
            if (isUndefined) {
                status = 'fail';
                errorMsg = 'CRITICAL: Returned undefined. Native bridge broken.';
            }
            update(5, {
                status,
                value: `${String(isEnrolled)} (type: ${typeof isEnrolled}, strict: ${isEnrolled === true ? 'true' : isEnrolled === false ? 'false' : 'UNEXPECTED'})`,
                error: errorMsg,
            });
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.error('[BiometricTest] isEnrolledAsync() ERROR:', msg);
            update(5, { status: 'fail', value: 'Error', error: msg });
        }

        // Test 6: supportedAuthenticationTypesAsync
        update(6, { status: 'running', value: 'Checking...' });
        try {
            const types = await LocalAuth.supportedAuthenticationTypesAsync();
            console.log('[BiometricTest] supportedAuthenticationTypesAsync() raw:', JSON.stringify(types), typeof types);
            if (!Array.isArray(types)) {
                update(6, {
                    status: 'fail',
                    value: `NOT AN ARRAY: ${String(types)} (type: ${typeof types})`,
                    error: 'CRITICAL: Expected array but got non-array. Native bridge broken.',
                });
            } else {
                const typeNames = types.map((t: number) => {
                    switch (t) {
                        case 1: return 'FINGERPRINT';
                        case 2: return 'FACIAL_RECOGNITION';
                        case 3: return 'IRIS';
                        default: return `UNKNOWN(${t})`;
                    }
                });
                update(6, {
                    status: types.length > 0 ? 'pass' : 'warn',
                    value: `Raw: [${types.join(', ')}]\nMapped: [${typeNames.join(', ')}]`,
                });
            }
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.error('[BiometricTest] supportedAuthenticationTypesAsync() ERROR:', msg);
            update(6, { status: 'fail', value: 'Error', error: msg });
        }

        // Test 7: getEnrolledLevelAsync
        update(7, { status: 'running', value: 'Checking...' });
        try {
            const level = await LocalAuth.getEnrolledLevelAsync();
            console.log('[BiometricTest] getEnrolledLevelAsync():', level, typeof level);
            const levelNames: Record<number, string> = {
                0: 'NONE',
                1: 'SECRET (PIN/Pattern/Password)',
                2: 'BIOMETRIC',
            };
            if (level === undefined || level === null) {
                update(7, {
                    status: 'fail',
                    value: `${String(level)} (type: ${typeof level})`,
                    error: 'CRITICAL: Returned undefined/null. Native bridge broken.',
                });
            } else {
                const levelName = levelNames[level as number] ?? `UNKNOWN(${level})`;
                update(7, {
                    status: level === 2 ? 'pass' : level === 1 ? 'warn' : 'fail',
                    value: `${level} -> ${levelName}`,
                });
            }
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.error('[BiometricTest] getEnrolledLevelAsync() ERROR:', msg);
            update(7, { status: 'fail', value: 'Error', error: msg });
        }

        console.log('========================================');
        console.log('[BiometricTest] Diagnostic suite complete');
        console.log('========================================');
        setRunning(false);
    }, []);

    const runAuthTest = useCallback(async (withFallback: boolean) => {
        setAuthTestRunning(true);
        const label = withFallback ? 'authenticateAsync (with fallback)' : 'authenticateAsync (biometric only)';
        console.log(`[BiometricTest] ${label} - Starting...`);

        const newResult: TestResult = {
            label,
            status: 'running',
            value: 'Prompting user...',
        };
        setResults(prev => [...prev, newResult]);
        const idx = results.length;

        try {
            const options: LocalAuth.LocalAuthenticationOptions = {
                promptMessage: 'Biometric Test - Verify your identity',
                cancelLabel: 'Cancel',
                disableDeviceFallback: !withFallback,
            };
            if (!withFallback) {
                options.fallbackLabel = '';
            }
            console.log('[BiometricTest] authenticateAsync options:', JSON.stringify(options));
            const result = await LocalAuth.authenticateAsync(options);
            console.log('[BiometricTest] authenticateAsync result:', JSON.stringify(result));

            const resultStr = JSON.stringify(result, null, 2);
            setResults(prev => prev.map((r, i) => (i === idx ? {
                ...r,
                status: result?.success ? 'pass' : 'fail',
                value: resultStr,
                error: !result.success ? `Error code: ${result.error}` : undefined,
            } : r)));
        } catch (err: any) {
            const msg = err?.message || String(err);
            console.error(`[BiometricTest] ${label} ERROR:`, msg);
            setResults(prev => prev.map((r, i) => (i === idx ? { ...r, status: 'fail', value: 'Exception thrown', error: msg } : r)));
        }

        setAuthTestRunning(false);
    }, [results.length]);

    const clearResults = useCallback(() => {
        setResults([]);
    }, []);

    return (
        <ThemedView className="flex-1">
            <Stack.Screen options={{ title: 'Biometric Diagnostics' }} />
            <ScrollView
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            >
                <ThemedText type="title" style={{ marginBottom: 8 }}>
                    Biometric Diagnostics
                </ThemedText>
                <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={{ marginBottom: 20, fontSize: 13 }}>
                    Tests all expo-local-authentication APIs. Check console for detailed logs.
                </ThemedText>

                {/* Action Buttons */}
                <View style={{ gap: 8, marginBottom: 20 }}>
                    <TouchableOpacity
                        testID="run-diagnostics-button"
                        onPress={runDiagnostics}
                        disabled={running}
                        activeOpacity={0.7}
                        style={{
                            backgroundColor: running ? '#6B7280' : '#10B981',
                            borderRadius: 8,
                            paddingVertical: 14,
                            alignItems: 'center',
                        }}
                    >
                        <Text style={{ color: '#fff', fontWeight: '700', fontSize: 16 }}>
                            {running ? 'Running Diagnostics...' : 'Run Diagnostics'}
                        </Text>
                    </TouchableOpacity>

                    <View style={{ flexDirection: 'row', gap: 8 }}>
                        <TouchableOpacity
                            testID="auth-with-fallback-button"
                            onPress={() => runAuthTest(true)}
                            disabled={authTestRunning || running}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                backgroundColor: authTestRunning || running ? '#6B7280' : '#3B82F6',
                                borderRadius: 8,
                                paddingVertical: 12,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                                Auth + Fallback
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            testID="auth-biometric-only-button"
                            onPress={() => runAuthTest(false)}
                            disabled={authTestRunning || running}
                            activeOpacity={0.7}
                            style={{
                                flex: 1,
                                backgroundColor: authTestRunning || running ? '#6B7280' : '#8B5CF6',
                                borderRadius: 8,
                                paddingVertical: 12,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 13 }}>
                                Auth Biometric Only
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {results.length > 0 && (
                        <TouchableOpacity
                            testID="clear-results-button"
                            onPress={clearResults}
                            activeOpacity={0.7}
                            style={{
                                backgroundColor: scheme === 'dark' ? '#374151' : '#E5E7EB',
                                borderRadius: 8,
                                paddingVertical: 10,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{ color: scheme === 'dark' ? '#D1D5DB' : '#374151', fontWeight: '600', fontSize: 13 }}>
                                Clear Results
                            </Text>
                        </TouchableOpacity>
                    )}
                </View>

                {/* Results */}
                {results.length > 0 && (
                    <View>
                        <ThemedText type="subtitle" style={{ marginBottom: 8 }}>
                            Results
                        </ThemedText>
                        {results.map((result, index) => (
                            <ResultRow key={`${result.label}-${index}`} result={result} scheme={scheme} />
                        ))}
                    </View>
                )}

                {/* Usage Instructions */}
                {results.length === 0 && (
                    <View
                        style={{
                            backgroundColor: scheme === 'dark' ? '#1F2937' : '#F0F9FF',
                            borderRadius: 8,
                            padding: 16,
                            borderWidth: 1,
                            borderColor: scheme === 'dark' ? '#374151' : '#BAE6FD',
                        }}
                    >
                        <Text style={{ color: scheme === 'dark' ? '#93C5FD' : '#1E40AF', fontWeight: '600', marginBottom: 8 }}>
                            How to use
                        </Text>
                        <Text style={{ color: scheme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 13, lineHeight: 20 }}>
                            1. Tap &quot;Run Diagnostics&quot; to check hardware and enrollment status{'\n'}
                            2. Use &quot;Auth + Fallback&quot; to test authentication with PIN/pattern fallback{'\n'}
                            3. Use &quot;Auth Biometric Only&quot; to test biometric-only authentication{'\n'}
                            4. Check Metro/Logcat console for detailed logs prefixed with [BiometricTest]
                        </Text>
                    </View>
                )}
            </ScrollView>
        </ThemedView>
    );
}
