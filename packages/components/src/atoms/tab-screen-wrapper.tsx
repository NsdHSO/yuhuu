import React from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export interface TabScreenWrapperProps {
  children: React.ReactNode;
  contentContainerStyle?: ViewStyle;
  scrollEnabled?: boolean;
  testID?: string;
}

const TAB_BAR_HEIGHT = 65;
const BREATHING_ROOM = 40;

export function TabScreenWrapper({
  children,
  contentContainerStyle,
  scrollEnabled = true,
  testID,
}: TabScreenWrapperProps) {
  const insets = useSafeAreaInsets();

  // Calculate bottom padding: safe area + tab bar height + breathing room
  const bottomPadding = insets.bottom + TAB_BAR_HEIGHT + BREATHING_ROOM;

  // Merge user styles with required bottom padding
  const mergedStyle: ViewStyle = {
    ...contentContainerStyle,
    paddingBottom: bottomPadding,
  };

  return (
    <SafeAreaView
      style={{ flex: 1 }}
      edges={['top', 'left', 'right']}
      testID={testID}
    >
      <KeyboardAvoidingView
        behavior={Platform.select({
          ios: 'padding',
          android: undefined,
          web: undefined,
        })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={mergedStyle}
          scrollEnabled={scrollEnabled}
          testID={testID ? `${testID}-scroll` : undefined}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
