import React from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {Stack} from 'expo-router';
import {ThemedText, ThemedView, useColorScheme} from '@yuhuu/components';
import {useBiometricDiagnostics} from './hooks/useBiometricDiagnostics';
import {ResultRow} from './components/biometric/ResultRow';

export default function BiometricTestScreen() {
  const scheme = useColorScheme() ?? 'light';
  const {results, running, authTestRunning, runDiagnostics, runAuthTest, clearResults} = useBiometricDiagnostics();

  return (
    <ThemedView className="flex-1">
      <Stack.Screen options={{title: 'Biometric Diagnostics'}} />
      <ScrollView style={{flex: 1}} contentContainerStyle={{padding: 16, paddingBottom: 60}}>
        <ThemedText type="title" style={{marginBottom: 8}}>Biometric Diagnostics</ThemedText>
        <ThemedText lightColor="#6B7280" darkColor="#9CA3AF" style={{marginBottom: 20, fontSize: 13}}>Tests all expo-local-authentication APIs. Check console for detailed logs.</ThemedText>
        <View style={{gap: 8, marginBottom: 20}}>
          <TouchableOpacity testID="run-diagnostics-button" onPress={runDiagnostics} disabled={running} activeOpacity={0.7} style={{backgroundColor: running ? '#6B7280' : '#10B981', borderRadius: 8, paddingVertical: 14, alignItems: 'center'}}>
            <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>{running ? 'Running Diagnostics...' : 'Run Diagnostics'}</Text>
          </TouchableOpacity>
          <View style={{flexDirection: 'row', gap: 8}}>
            <TouchableOpacity testID="auth-with-fallback-button" onPress={() => runAuthTest(true)} disabled={authTestRunning || running} activeOpacity={0.7} style={{flex: 1, backgroundColor: authTestRunning || running ? '#6B7280' : '#3B82F6', borderRadius: 8, paddingVertical: 12, alignItems: 'center'}}>
              <Text style={{color: '#fff', fontWeight: '600', fontSize: 13}}>Auth + Fallback</Text>
            </TouchableOpacity>
            <TouchableOpacity testID="auth-biometric-only-button" onPress={() => runAuthTest(false)} disabled={authTestRunning || running} activeOpacity={0.7} style={{flex: 1, backgroundColor: authTestRunning || running ? '#6B7280' : '#8B5CF6', borderRadius: 8, paddingVertical: 12, alignItems: 'center'}}>
              <Text style={{color: '#fff', fontWeight: '600', fontSize: 13}}>Auth Biometric Only</Text>
            </TouchableOpacity>
          </View>
          {results.length > 0 && <TouchableOpacity testID="clear-results-button" onPress={clearResults} activeOpacity={0.7} style={{backgroundColor: scheme === 'dark' ? '#374151' : '#E5E7EB', borderRadius: 8, paddingVertical: 10, alignItems: 'center'}}><Text style={{color: scheme === 'dark' ? '#D1D5DB' : '#374151', fontWeight: '600', fontSize: 13}}>Clear Results</Text></TouchableOpacity>}
        </View>
        {results.length > 0 && <View><ThemedText type="subtitle" style={{marginBottom: 8}}>Results</ThemedText>{results.map((result, index) => <ResultRow key={`${result.label}-${index}`} result={result} scheme={scheme} />)}</View>}
        {results.length === 0 && <View style={{backgroundColor: scheme === 'dark' ? '#1F2937' : '#F0F9FF', borderRadius: 8, padding: 16, borderWidth: 1, borderColor: scheme === 'dark' ? '#374151' : '#BAE6FD'}}><Text style={{color: scheme === 'dark' ? '#93C5FD' : '#1E40AF', fontWeight: '600', marginBottom: 8}}>How to use</Text><Text style={{color: scheme === 'dark' ? '#D1D5DB' : '#374151', fontSize: 13, lineHeight: 20}}>1. Tap &quot;Run Diagnostics&quot; to check hardware and enrollment status{'\n'}2. Use &quot;Auth + Fallback&quot; to test authentication with PIN/pattern fallback{'\n'}3. Use &quot;Auth Biometric Only&quot; to test biometric-only authentication{'\n'}4. Check Metro/Logcat console for detailed logs prefixed with [BiometricTest]</Text></View>}
      </ScrollView>
    </ThemedView>
  );
}
