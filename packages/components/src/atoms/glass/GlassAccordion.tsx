import { useState } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import { GlassView } from './GlassView';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';
import type { GlassVariant } from '../../types/glass';

type GlassAccordionProps = {
  title: string;
  children?: React.ReactNode;
  variant?: GlassVariant;
  borderRadius?: number;
  defaultExpanded?: boolean;
  enableShadow?: boolean;
  shadowLevel?: 'subtle' | 'medium' | 'elevated';
  style?: ViewStyle;
  testID?: string;
};

export function GlassAccordion({
  title,
  children,
  variant = 'frosted',
  borderRadius = 12,
  defaultExpanded = false,
  enableShadow = true,
  shadowLevel = 'subtle',
  style,
  testID,
}: GlassAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const scheme = useColorScheme() ?? 'light';
  const textColor = Colors[scheme].text;
  const iconColor = Colors[scheme].icon;

  return (
    <GlassView
      variant={variant}
      borderRadius={borderRadius}
      enableShadow={enableShadow}
      shadowLevel={shadowLevel}
      style={[styles.container, style]}
      testID={testID}
    >
      <Pressable
        onPress={() => setIsExpanded(!isExpanded)}
        style={styles.header}
        testID={testID ? `${testID}-header` : undefined}
      >
        <Text style={[styles.title, { color: textColor }]}>{title}</Text>
        <Text style={[styles.chevron, { color: iconColor }]}>
          {isExpanded ? '▼' : '▶'}
        </Text>
      </Pressable>
      {isExpanded && children && (
        <View style={styles.content}>
          {children}
        </View>
      )}
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
  },
  chevron: {
    fontSize: 14,
    marginLeft: 8,
    opacity: 0.8,
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
  },
});
