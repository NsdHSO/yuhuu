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

  // Calculate top padding: safe area for notch/status bar
  const topPadding = insets.top;

  // Merge user styles with required safe area padding
  const mergedStyle: ViewStyle = {
    paddingTop: topPadding,
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
          android: 'padding',
          web: undefined,
        })}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={mergedStyle}
          scrollEnabled={scrollEnabled}
          nestedScrollEnabled={true}
          keyboardShouldPersistTaps="handled"
          testID={testID ? `${testID}-scroll` : undefined}
        >
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
