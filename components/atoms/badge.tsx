import { View } from 'react-native';
import { ThemedText } from '@/components/themed-text';

export interface BadgeProps {
  children: string;
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

/**
 * Badge Atom Component
 * A reusable badge component for labels, tags, and categories
 *
 * @example
 * <Badge className="bg-category-incident dark:bg-category-incident-dark">Incident</Badge>
 */
export function Badge({
  children,
  size = 'sm',
  className = '',
}: BadgeProps) {
  const sizeClasses = {
    xs: 'px-1.5 py-0.5',
    sm: 'px-2 py-1',
    md: 'px-3 py-1.5',
  };

  return (
    <View className={`rounded self-start ${sizeClasses[size]} ${className}`}>
      <ThemedText
        size={size === 'xs' ? 'xs' : size === 'sm' ? 'sm' : 'base'}
        weight="bold"
        className="text-white"
      >
        {children.toUpperCase()}
      </ThemedText>
    </View>
  );
}
