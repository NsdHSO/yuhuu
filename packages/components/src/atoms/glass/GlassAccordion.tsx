import React, { useState, useEffect } from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, View } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { GlassView } from './GlassView';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { useElectricBorder } from '../../hooks/useElectricBorder';
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
  enableElectric?: boolean;
  enableWaves?: boolean;
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
  enableElectric = false,
  enableWaves = false,
  style,
  testID,
}: GlassAccordionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const scheme = useColorScheme() ?? 'light';
  const textColor = Colors[scheme].text;
  const iconColor = Colors[scheme].icon;

  // Electric border animation - using shared hook
  const electricStyle = useElectricBorder(enableElectric && isExpanded);

  // Border width animation
  const borderWidth = useSharedValue(defaultExpanded ? 4 : 0);

  // Content height animation
  const contentHeight = useSharedValue(defaultExpanded ? 1 : 0);

  // Wave animations
  const wave1 = useSharedValue(0);
  const wave2 = useSharedValue(0);
  const wave3 = useSharedValue(0);

  useEffect(() => {
    // Animate border width on expand/collapse
    if (isExpanded) {
      borderWidth.value = withSequence(
        withTiming(0, { duration: 0 }),
        withTiming(4, { duration: 500, easing: Easing.out(Easing.cubic) })
      );
    } else {
      borderWidth.value = withTiming(0, {
        duration: 300,
        easing: Easing.in(Easing.cubic),
      });
    }

    // Animate content height
    contentHeight.value = withTiming(isExpanded ? 1 : 0, {
      duration: 350,
      easing: Easing.out(Easing.cubic),
    });
  }, [isExpanded]);

  useEffect(() => {
    if (enableWaves && isExpanded) {
      wave1.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      wave2.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );

      wave3.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 3000, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: 3000, easing: Easing.inOut(Easing.sin) })
        ),
        -1,
        true
      );
    } else if (!isExpanded) {
      // Stop wave animations when collapsed
      wave1.value = 0;
      wave2.value = 0;
      wave3.value = 0;
    }
  }, [enableWaves, isExpanded]);

  const wave1Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};
    const scale = 1 + (wave1.value * 0.08);
    const opacity = 0.4 + (wave1.value * 0.4);
    return { transform: [{ scale }], opacity };
  });

  const wave2Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};
    const scale = 1 + (wave2.value * 0.06);
    const opacity = 0.3 + (wave2.value * 0.4);
    return { transform: [{ scale }], opacity };
  });

  const wave3Style = useAnimatedStyle(() => {
    if (!enableWaves) return {};
    const scale = 1 + (wave3.value * 0.10);
    const opacity = 0.35 + (wave3.value * 0.45);
    return { transform: [{ scale }], opacity };
  });

  const borderStyle = useAnimatedStyle(() => ({
    borderWidth: borderWidth.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentHeight.value,
    transform: [{ scaleY: contentHeight.value }],
  }));

  const electricColor1 = scheme === 'dark' ? '#60A5FA' : '#2563EB';
  const electricColor2 = scheme === 'dark' ? '#C084FC' : '#A855F7';
  const electricColor3 = scheme === 'dark' ? '#34D399' : '#059669';

  if (!enableElectric && !enableWaves) {
    return (
      <View style={[{ borderRadius, overflow: 'visible' }, styles.container, style]}>
        <GlassView
          variant={variant}
          borderRadius={borderRadius}
          enableShadow={enableShadow}
          shadowLevel={shadowLevel}
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
            <Animated.View style={[styles.content, contentStyle]}>
              {children}
            </Animated.View>
          )}
        </GlassView>

        {/* Animated border */}
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              borderRadius,
              borderColor: scheme === 'dark' ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.35)',
            },
            borderStyle,
          ]}
          pointerEvents="none"
        />
      </View>
    );
  }

  return (
    <View style={[{ borderRadius, overflow: 'visible' }, styles.container, style]}>
      <GlassView
        variant={variant}
        borderRadius={borderRadius}
        enableShadow={enableShadow}
        shadowLevel={shadowLevel}
      >
        {/* Wave effect layers - only when expanded */}
        {enableWaves && isExpanded && (
          <>
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius,
                  backgroundColor: scheme === 'dark' ? 'rgba(96, 165, 250, 0.35)' : 'rgba(59, 130, 246, 0.25)',
                },
                wave1Style,
              ]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius,
                  backgroundColor: scheme === 'dark' ? 'rgba(167, 139, 250, 0.30)' : 'rgba(139, 92, 246, 0.22)',
                },
                wave2Style,
              ]}
              pointerEvents="none"
            />
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                {
                  borderRadius,
                  backgroundColor: scheme === 'dark' ? 'rgba(52, 211, 153, 0.32)' : 'rgba(16, 185, 129, 0.23)',
                },
                wave3Style,
              ]}
              pointerEvents="none"
            />
          </>
        )}

        {/* Content */}
        <View style={{ zIndex: 5 }}>
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
            <Animated.View style={[styles.content, contentStyle]}>
              {children}
            </Animated.View>
          )}
        </View>
      </GlassView>

      {/* Animated border - always visible */}
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            borderRadius,
            borderColor: scheme === 'dark' ? 'rgba(96, 165, 250, 0.4)' : 'rgba(59, 130, 246, 0.35)',
          },
          borderStyle,
        ]}
        pointerEvents="none"
      />

      {/* Electric border - traveling snake effect, only when expanded */}
      {enableElectric && isExpanded && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { pointerEvents: 'none' },
          ]}
        >
          {/* Traveling electric segment */}
          <Animated.View
            style={[
              electricStyle,
              {
                position: 'absolute',
                backgroundColor: electricColor1,
                shadowColor: electricColor1,
                shadowOffset: { width: 0, height: 0 },
                shadowOpacity: 1,
                shadowRadius: 12,
                elevation: 25,
                borderRadius: 1.5,
              },
            ]}
            pointerEvents="none"
          />
        </Animated.View>
      )}
    </View>
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
