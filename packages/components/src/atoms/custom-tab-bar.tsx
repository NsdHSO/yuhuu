import React, { useEffect } from 'react';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { View, Pressable, StyleSheet, Platform, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';
// import { BlurView } from 'expo-blur'; // TEMPORARILY DISABLED - expo-blur broken
import { useColorScheme } from '../hooks/use-color-scheme';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const scheme = useColorScheme() ?? 'light';

  // Filter visible routes (exclude href: null)
  const visibleRoutes = state.routes.filter((route) => {
    const { options } = descriptors[route.key];
    return (options as any).href !== null;
  });

  // Find active tab index in visible routes
  const activeRoute = state.routes[state.index];
  const activeVisibleIndex = visibleRoutes.findIndex((route) => route.key === activeRoute.key);

  // Pill animation
  const pillPosition = useSharedValue(0);
  const tabCount = visibleRoutes.length;
  const tabWidth = 100 / tabCount; // Percentage width

  useEffect(() => {
    // Animate pill to active visible tab
    if (activeVisibleIndex >= 0) {
      pillPosition.value = withSpring(activeVisibleIndex, {
        damping: 25,
        stiffness: 180,
        mass: 0.4,
      });
    }
  }, [activeVisibleIndex]);

  const pillStyle = useAnimatedStyle(() => ({
    left: `${pillPosition.value * tabWidth}%`,
  }));

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom }]}>
      {/* Glass background */}
      <View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: scheme === 'dark'
              ? 'rgba(50, 50, 60, 0.95)'
              : 'rgba(250, 250, 255, 0.95)',
          },
        ]}
      />

      {/* Sliding pill indicator - ON TOP */}
      <Animated.View
        style={[
          styles.pillContainer,
          {
            width: `${tabWidth * 0.75}%`,
            marginLeft: `${tabWidth * 0.125}%`,
          },
          pillStyle,
        ]}
      >
        <View
          style={[
            styles.pill,
            {
              backgroundColor: scheme === 'dark'
                ? 'rgba(100, 120, 140, 0.95)'
                : 'rgba(255, 255, 255, 0.95)',
              borderWidth: 1,
              borderColor: scheme === 'dark'
                ? 'rgba(255, 255, 255, 0.1)'
                : 'rgba(0, 0, 0, 0.05)',
            },
          ]}
        />
      </Animated.View>

      {/* Tab buttons - ABOVE the pill */}
      <View style={styles.tabsContainer}>
        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const isFocused = route.key === activeRoute.key;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={(options as any).tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tab}
            >
              {options.tabBarIcon ? (
                options.tabBarIcon({
                  focused: isFocused,
                  color: isFocused
                    ? (scheme === 'dark' ? '#60A5FA' : '#3B82F6')
                    : (scheme === 'dark' ? '#9CA3AF' : '#6B7280'),
                  size: 28,
                })
              ) : null}
              {options.tabBarLabel && typeof options.tabBarLabel === 'string' && (
                <Animated.Text
                  style={[
                    styles.label,
                    {
                      color: isFocused
                        ? (scheme === 'dark' ? '#60A5FA' : '#3B82F6')
                        : (scheme === 'dark' ? '#9CA3AF' : '#6B7280'),
                    },
                  ]}
                >
                  {options.tabBarLabel}
                </Animated.Text>
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 65,
    overflow: 'hidden',
  },
  tabsContainer: {
    flex: 1,
    flexDirection: 'row',
    zIndex: 100,
  },
  tab: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 8,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  pillContainer: {
    position: 'absolute',
    bottom: 8,
    height: 38,
    zIndex: 50,
  },
  pill: {
    flex: 1,
    borderRadius: 19,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 5,
  },
});
