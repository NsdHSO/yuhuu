import { Badge } from '@/components/atoms/badge';

export interface CategoryBadgeProps {
  category: string;
  size?: 'xs' | 'sm' | 'md';
}

/**
 * CategoryBadge Molecule Component
 * Displays a category badge with predefined colors from theme
 *
 * @example
 * <CategoryBadge category="INCIDENT" size="sm" />
 * <CategoryBadge category="economie" />
 */
export function CategoryBadge({ category, size = 'xs' }: CategoryBadgeProps) {
  const getCategoryClass = (cat: string): string => {
    const normalizedCategory = cat.toLowerCase();

    const categoryClassMap: Record<string, string> = {
      'marius tucă show': 'bg-category-incident dark:bg-category-incident-dark',
      finanțe: 'bg-category-economie dark:bg-category-economie-dark',
      'știri politice': 'bg-category-politic dark:bg-category-politic-dark',
      sport: 'bg-category-sport dark:bg-category-sport-dark',
      'știri externe': 'bg-category-international dark:bg-category-international-dark',
      social: 'bg-category-social dark:bg-category-social-dark',
      actualitate: 'bg-category-tech dark:bg-category-tech-dark',
      culturǎ: 'bg-category-cultura dark:bg-category-cultura-dark',
    };

    return categoryClassMap[normalizedCategory] || 'bg-category-default dark:bg-category-default-dark';
  };

  return (
    <Badge size={size} className={getCategoryClass(category)}>
      {category}
    </Badge>
  );
}
