import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { GlassView } from './GlassView';
import type { GlassVariant } from '../../types/glass';

type GlassHeaderProps = {
  title: string;
  variant?: GlassVariant;
  style?: ViewStyle;
  testID?: string;
};

export function GlassHeader({
  title,
  variant = 'frosted',
  style,
  testID,
}: GlassHeaderProps) {
  return (
    <GlassView
      variant={variant}
      borderRadius={0}
      enableShadow={true}
      shadowLevel="subtle"
      style={[styles.header, style]}
      testID={testID}
    >
      <Text style={styles.title}>{title}</Text>
    </GlassView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
  },
});
