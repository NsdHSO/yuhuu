import React, {useMemo} from 'react';
import {View, StyleSheet} from 'react-native';
import {useColorScheme} from '../hooks/use-color-scheme';
import {useGlowVariant} from '../hooks/useGlowVariant';
import {getGlowColor} from '../constants/glowColors';
import ManAvatar from './avatars/ManAvatar';
import WomanAvatar from './avatars/WomanAvatar';

/**
 * Circular avatar component displaying gender-specific SVG illustration.
 * Supports dynamic color tinting via overlay wrapper based on selection state and theme.
 */
export type GenderAvatarProps = {
  /** Gender to display ('male' or 'female') */
  gender: 'male' | 'female';
  /** Avatar diameter in pixels (32 for trigger, 120 for modal) */
  size: number;
  /** Whether this gender is currently selected */
  isSelected: boolean;
  /** Test identifier for automated testing */
  testID?: string;
};

export const GenderAvatar = ({gender, size, isSelected, testID}: GenderAvatarProps) => {
  const scheme = useColorScheme() ?? 'light';
  const {glowVariant} = useGlowVariant();

  const activeColor = useMemo(
    () => getGlowColor(glowVariant, scheme),
    [glowVariant, scheme]
  );

  const neutralGray = useMemo(
    () => (scheme === 'dark' ? '#6B7280' : '#9CA3AF'),
    [scheme]
  );

  const SvgComponent = gender === 'male' ? ManAvatar : WomanAvatar;

    const borderWidth = isSelected ? 3 : 2;
    const borderColor = isSelected ? activeColor : neutralGray;
    const backgroundColor = isSelected
      ? `${activeColor}33` // 20% opacity - more vibrant for selected
      : `${activeColor}14`; // 8% opacity - subtle glow for unselected

    const tintOverlayColor = isSelected
      ? `${activeColor}1A` // 10% overlay tint when selected
      : 'rgba(0,0,0,0)';

    const containerStyle = {
      ...styles.container,
      width: size,
      height: size,
      borderRadius: size / 2,
      borderWidth,
      borderColor,
      backgroundColor,
      opacity: isSelected ? 1 : 0.6,
      transform: [{scale: isSelected ? 1 : 0.95}],
    };

    return (
      <View
        testID={testID}
        // @ts-ignore - Custom prop for testing
        isSelected={isSelected}
        style={containerStyle}
        accessible={true}
        accessibilityRole="image"
        accessibilityLabel={`${gender === 'male' ? 'Male' : 'Female'} avatar`}
        accessibilityState={{selected: isSelected}}
      >
        <View style={styles.svgContainer}>
          <SvgComponent
            width={size - borderWidth * 2}
            height={size - borderWidth * 2}
          />
          <View
            testID={testID ? `${testID}-wrapper` : undefined}
            style={{
              ...styles.tintOverlay,
              width: size - borderWidth * 2,
              height: size - borderWidth * 2,
              borderRadius: (size - borderWidth * 2) / 2,
              backgroundColor: tintOverlayColor,
            }}
          />
        </View>
      </View>
    );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'relative',
  },
  tintOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
