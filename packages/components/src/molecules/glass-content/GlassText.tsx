import { Text, TextProps, StyleSheet } from 'react-native';
import { useColorScheme } from '../../hooks/use-color-scheme';
import { Colors } from '../../constants/theme';

type GlassTextProps = TextProps & {
  variant?: 'title' | 'body' | 'caption';
  lightColor?: string;
  darkColor?: string;
};

export function GlassText({
  variant = 'body',
  style,
  lightColor,
  darkColor,
  ...props
}: GlassTextProps) {
  const scheme = useColorScheme() ?? 'light';
  const color = lightColor && scheme === 'light'
    ? lightColor
    : darkColor && scheme === 'dark'
    ? darkColor
    : Colors[scheme].text;

  const variantStyles = {
    title: styles.title,
    body: styles.body,
    caption: styles.caption,
  };

  return (
    <Text
      style={[
        styles.base,
        variantStyles[variant],
        { color },
        style,
      ]}
      {...props}
    />
  );
}

const styles = StyleSheet.create({
  base: {
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    textShadowRadius: 3,
  },
  body: {
    fontSize: 15,
    fontWeight: '500',
  },
  caption: {
    fontSize: 13,
    fontWeight: '400',
    textShadowColor: 'rgba(0, 0, 0, 0.2)',
  },
});
