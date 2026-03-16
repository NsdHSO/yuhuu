import React from 'react';
import {Text, View} from 'react-native';

export type TestStatus = 'idle' | 'running' | 'pass' | 'fail' | 'warn';

export function StatusBadge({status}: {status: TestStatus}) {
  const colors: Record<TestStatus, {bg: string; text: string; label: string}> = {
    idle: {bg: '#6B7280', text: '#fff', label: 'IDLE'},
    running: {bg: '#F59E0B', text: '#000', label: 'RUNNING'},
    pass: {bg: '#10B981', text: '#fff', label: 'PASS'},
    fail: {bg: '#EF4444', text: '#fff', label: 'FAIL'},
    warn: {bg: '#F97316', text: '#fff', label: 'WARN'},
  };
  const c = colors[status];
  return (
    <View style={{backgroundColor: c.bg, borderRadius: 4, paddingHorizontal: 8, paddingVertical: 2}}>
      <Text style={{color: c.text, fontSize: 11, fontWeight: '700'}}>{c.label}</Text>
    </View>
  );
}
