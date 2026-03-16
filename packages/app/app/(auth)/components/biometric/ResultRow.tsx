import React from 'react';
import {Platform, Text, View} from 'react-native';
import {StatusBadge, TestStatus} from './StatusBadge';

export interface TestResult {
  label: string;
  status: TestStatus;
  value: string;
  error?: string;
}

export function ResultRow({result, scheme}: {result: TestResult; scheme: 'light' | 'dark'}) {
  return (
    <View style={{backgroundColor: scheme === 'dark' ? '#1F2937' : '#F9FAFB', borderRadius: 8, padding: 12, marginBottom: 8, borderWidth: 1, borderColor: scheme === 'dark' ? '#374151' : '#E5E7EB'}}>
      <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4}}>
        <Text style={{color: scheme === 'dark' ? '#D1D5DB' : '#374151', fontWeight: '600', fontSize: 13, flex: 1}}>{result.label}</Text>
        <StatusBadge status={result.status} />
      </View>
      <Text style={{color: scheme === 'dark' ? '#9CA3AF' : '#6B7280', fontSize: 12, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace'}}>{result.value}</Text>
      {result.error ? <Text style={{color: '#EF4444', fontSize: 11, marginTop: 4}}>{result.error}</Text> : null}
    </View>
  );
}
