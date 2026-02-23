import { Text, type TextProps } from 'react-native';

import { useThemeColor } from '@/hooks/use-theme-color';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;

  // Semantic type variants (for convenience)
  type?: 'default' | 'title' | 'subtitle' | 'caption' | 'link';

  // Accessible text size props
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl' | '8xl' | '9xl';

  // Font weight props
  weight?: 'thin' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold';

  // Line height props (leading)
  leading?: 'none' | 'tight' | 'snug' | 'normal' | 'relaxed' | 'loose' | 'extra-loose';

  // Letter spacing props (tracking)
  tracking?: 'tightest' | 'tighter' | 'tight' | 'normal' | 'wide' | 'wider' | 'widest' | 'ultra-wide';

  // Font family props
  font?: 'sans' | 'serif' | 'mono';

  // Text alignment
  align?: 'left' | 'center' | 'right' | 'justify';

  // Additional utilities
  italic?: boolean;
  underline?: boolean;
  uppercase?: boolean;
  lowercase?: boolean;
  capitalize?: boolean;
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type,
  size,
  weight,
  leading,
  tracking,
  font,
  align,
  italic,
  underline,
  uppercase,
  lowercase,
  capitalize,
  className,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, 'text');

  // Build className from props
  const classes = [
    // Handle semantic types
    type === 'default' && !size && 'text-base',
    type === 'default' && !weight && 'font-normal',
    type === 'default' && !leading && 'leading-relaxed',

    type === 'title' && !size && 'text-4xl',
    type === 'title' && !weight && 'font-bold',
    type === 'title' && !leading && 'leading-tight',

    type === 'subtitle' && !size && 'text-2xl',
    type === 'subtitle' && !weight && 'font-semibold',
    type === 'subtitle' && !leading && 'leading-snug',

    type === 'caption' && !size && 'text-sm',
    type === 'caption' && !weight && 'font-normal',
    type === 'caption' && !leading && 'leading-normal',

    type === 'link' && !size && 'text-base',
    type === 'link' && !weight && 'font-medium',
    type === 'link' && 'text-blue-600 dark:text-blue-400',
    type === 'link' && !underline && 'underline',

    // Individual props override type defaults
    size && `text-${size}`,
    weight && `font-${weight}`,
    leading && `leading-${leading}`,
    tracking && `tracking-${tracking}`,
    font && `font-${font}`,
    align && `text-${align}`,

    // Utility props
    italic && 'italic',
    underline && 'underline',
    uppercase && 'uppercase',
    lowercase && 'lowercase',
    capitalize && 'capitalize',

    // User-provided className
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Text
      style={[{ color }, style]}
      className={classes}
      {...rest}
    />
  );
}
