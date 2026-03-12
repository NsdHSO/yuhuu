import React, {useRef, useCallback, useEffect} from 'react';
import {View, Pressable, StyleSheet} from 'react-native';
import {useTranslation} from 'react-i18next';
import type {BottomSheetModal} from '@gorhom/bottom-sheet';
import {ThemedText} from '../themed-text';
import {GenderAvatar} from '../atoms/gender-avatar';
import {GlassBottomSheet} from '../atoms/glass/GlassBottomSheet';
import {useColorScheme} from '../hooks/use-color-scheme';
import {useGlowVariant} from '../hooks/useGlowVariant';
import {getGlowColor} from '../constants/glowColors';
import {Colors} from '../constants/theme';
import {IconSymbol} from '../ui/icon-symbol';

/**
 * Gender selection component with dropdown modal interface.
 * Displays trigger button with selected gender, opens modal for selection.
 */
export type GenderPickerProps = {
  /** Current gender value ('male', 'female', or null for unselected) */
  value: 'male' | 'female' | null;
  /** Callback when gender selection changes */
  onChange: (value: 'male' | 'female') => void;
  /** Test identifier for automated testing */
  testID?: string;
};

export function GenderPicker({value, onChange, testID}: GenderPickerProps) {
  const {t} = useTranslation();
  const bottomSheetRef = useRef<BottomSheetModal>(null);
  const scheme = useColorScheme() ?? 'light';
  const {glowVariant} = useGlowVariant();
  const activeColor = getGlowColor(glowVariant, scheme);
  const neutralGray = scheme === 'dark' ? '#6B7280' : '#9CA3AF';

  // Dismiss bottom sheet when glow variant changes to force re-render with new colors
  useEffect(() => {
    bottomSheetRef.current?.dismiss();
  }, [glowVariant, scheme]);

  const handleOpenModal = useCallback(() => {
    bottomSheetRef.current?.present();
  }, []);

  const handleCloseModal = useCallback(() => {
    bottomSheetRef.current?.dismiss();
  }, []);

  const handleSelect = useCallback(
    (gender: 'male' | 'female') => {
      if (gender !== value) {
        onChange(gender);
      }
      handleCloseModal();
    },
    [value, onChange, handleCloseModal]
  );

  const triggerBorderColor = value ? activeColor : neutralGray;
  const triggerBackgroundColor = value
    ? `${activeColor}0D`
    : 'transparent';

  const triggerLabel = value
    ? `Gender: ${t('genderPicker.' + value)}. Tap to change.`
    : `${t('genderPicker.placeholder')}. Tap to select.`;

  return (
    <View testID={testID}>
      <Pressable
        testID={testID ? `${testID}-trigger` : undefined}
        onPress={handleOpenModal}
        style={({pressed}) => [
          styles.trigger,
          {
            borderColor: triggerBorderColor,
            backgroundColor: triggerBackgroundColor,
            opacity: pressed ? 0.7 : 1,
            transform: [{scale: pressed ? 0.98 : 1}],
          },
        ]}
        accessible={true}
        accessibilityRole="button"
        accessibilityLabel={triggerLabel}
        accessibilityHint="Opens gender selection menu"
      >
        {value && (
          <GenderAvatar
            testID={testID ? `${testID}-trigger-avatar` : undefined}
            gender={value}
            size={32}
            isSelected={true}
          />
        )}
        <ThemedText style={styles.triggerText}>
          {value ? t('genderPicker.' + value) : t('genderPicker.placeholder')}
        </ThemedText>
        <IconSymbol
          name="chevron.down"
          size={20}
          color={Colors[scheme].text}
          style={styles.chevron}
        />
      </Pressable>

      <GlassBottomSheet
        key={`${glowVariant}-${scheme}`}
        ref={bottomSheetRef}
        snapPoints={['60%']}
        testID={testID ? `${testID}-bottom-sheet` : undefined}
      >
        <View style={styles.bottomSheetContent}>
          <ThemedText style={styles.modalTitle}>
            {t('genderPicker.modalTitle')}
          </ThemedText>

          <View style={styles.avatarGrid}>
            <Pressable
              testID={testID ? `${testID}-bottom-sheet-male-button` : undefined}
              onPress={() => handleSelect('male')}
              style={({pressed}) => [
                styles.avatarButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={t('genderPicker.male')}
              accessibilityState={{
                selected: value === 'male',
                checked: value === 'male',
              }}
              accessibilityHint="Select male gender"
            >
              <GenderAvatar
                testID={testID ? `${testID}-bottom-sheet-male` : undefined}
                gender="male"
                size={120}
                isSelected={value === 'male'}
              />
              <ThemedText style={styles.avatarLabel}>
                {t('genderPicker.male')}
              </ThemedText>
            </Pressable>

            <Pressable
              testID={testID ? `${testID}-bottom-sheet-female-button` : undefined}
              onPress={() => handleSelect('female')}
              style={({pressed}) => [
                styles.avatarButton,
                {
                  opacity: pressed ? 0.7 : 1,
                },
              ]}
              accessible={true}
              accessibilityRole="radio"
              accessibilityLabel={t('genderPicker.female')}
              accessibilityState={{
                selected: value === 'female',
                checked: value === 'female',
              }}
              accessibilityHint="Select female gender"
            >
              <GenderAvatar
                testID={testID ? `${testID}-bottom-sheet-female` : undefined}
                gender="female"
                size={120}
                isSelected={value === 'female'}
              />
              <ThemedText style={styles.avatarLabel}>
                {t('genderPicker.female')}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </GlassBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    paddingHorizontal: 12,
    gap: 10,
  },
  triggerText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
  },
  chevron: {
    marginLeft: 'auto',
  },
  bottomSheetContent: {
    paddingTop: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  avatarGrid: {
    flexDirection: 'row',
    gap: 32,
    justifyContent: 'center',
  },
  avatarButton: {
    alignItems: 'center',
    gap: 12,
  },
  avatarLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
