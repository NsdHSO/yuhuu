import { PlatformPressable } from '@react-navigation/elements';
import * as Haptics from 'expo-haptics';
import type { ComponentProps } from 'react';

type PressableProps = ComponentProps<typeof PlatformPressable>;
// Make children optional to satisfy tests that render without children
export type HapticTabProps = Omit<PressableProps, 'onPressIn' | 'children'> & {
  children?: PressableProps['children'];
  onPressIn?: PressableProps['onPressIn'];
};

export function HapticTab(props: HapticTabProps) {
  const { children, onPressIn, ...rest } = props;
  return (
    <PlatformPressable
      {...(rest as Omit<PressableProps, 'children'>)}
      onPressIn={(ev) => {
        if (process.env.EXPO_OS === 'ios') {
          // Add a soft haptic feedback when pressing down on the tabs.
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPressIn?.(ev);
      }}
    >
      {children ?? null}
    </PlatformPressable>
  );
}
