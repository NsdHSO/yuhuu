import React from 'react';
import {View, Text, Pressable, Platform, Linking} from 'react-native';
import {useGlowVariant, getGlowColor} from '@yuhuu/components';
import {useColorScheme} from 'react-native';
import type {VisitAssignment} from '@yuhuu/types';

type Props = {
  visit: VisitAssignment;
  familyName: string;
  address: string;
  remainingMs: number;
  canComplete: boolean;
  onComplete: () => void;
};

export function VisitCard({familyName, address, remainingMs, canComplete, onComplete}: Props) {
  const {glowVariant} = useGlowVariant();
  const scheme = useColorScheme() ?? 'light';
  const activeColor = getGlowColor(glowVariant, scheme);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    return `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  };

  const handleNavigate = () => {
    const url = Platform.select({
      ios: `maps:0,0?q=${encodeURIComponent(address)}`,
      android: `geo:0,0?q=${encodeURIComponent(address)}`,
    });
    if (url) Linking.openURL(url);
  };

  const cardBg = scheme === 'dark' ? '#1a1a1a' : '#fff';
  const textColor = scheme === 'dark' ? '#fff' : '#000';
  const subtextColor = scheme === 'dark' ? '#aaa' : '#666';

  return (
    <View testID="visit-card" style={{backgroundColor: cardBg, borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: activeColor + '20'}}>
      <Text style={{fontSize: 18, fontWeight: '600', color: textColor}}>{familyName}</Text>
      <Text style={{fontSize: 14, color: subtextColor, marginTop: 4}}>{address}</Text>

      {remainingMs > 0 && (
        <Text style={{fontSize: 16, color: activeColor, marginTop: 8}}>
          Time remaining: {formatTime(remainingMs)}
        </Text>
      )}

      <View style={{flexDirection: 'row', gap: 8, marginTop: 12}}>
        <Pressable
          onPress={handleNavigate}
          style={{flex: 1, backgroundColor: activeColor + '20', borderRadius: 8, padding: 12, alignItems: 'center'}}
        >
          <Text style={{color: activeColor, fontWeight: '600'}}>Navigate</Text>
        </Pressable>

        <Pressable
          onPress={onComplete}
          disabled={!canComplete}
          style={{flex: 1, backgroundColor: canComplete ? activeColor : '#ccc', borderRadius: 8, padding: 12, alignItems: 'center'}}
        >
          <Text style={{color: '#fff', fontWeight: '600'}}>Mark Complete</Text>
        </Pressable>
      </View>
    </View>
  );
}
