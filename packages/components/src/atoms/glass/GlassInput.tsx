import { TextInput, TextInputProps, StyleSheet, View } from 'react-native';
import { GlassView } from './GlassView';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';
import type { GlassVariant } from '../../types/glass';

type GlassInputProps = TextInputProps & {
  variant?: GlassVariant;
  borderRadius?: number;
};

export function GlassInput({
  variant = 'ultra-thin',
  borderRadius = 8,
  style,
  placeholderTextColor,
  ...props
}: GlassInputProps) {
  const scheme = useColorScheme() ?? 'light';

  const defaultPlaceholderColor = placeholderTextColor ||
    (scheme === 'dark' ? 'rgba(156, 163, 175, 0.6)' : 'rgba(107, 114, 128, 0.6)');

  return (
    <GlassView
      variant={variant}
      borderRadius={borderRadius}
      enableShadow={false}
      enableBorder={true}
      style={styles.container}
    >
      <TextInput
        style={[
          styles.input,
          {
            color: Colors[scheme].text,
            backgroundColor: 'transparent',
          },
          style,
        ]}
        placeholderTextColor={defaultPlaceholderColor}
        {...props}
      />
    </GlassView>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  input: {
    padding: 12,
    fontSize: 16,
    fontWeight: '500',
  },
});
