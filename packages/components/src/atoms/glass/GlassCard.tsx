import { GlassView } from './GlassView';
import type { GlassViewProps } from '../../types/glass';

export function GlassCard({
  variant = 'tinted',
  borderRadius = 12,
  ...props
}: GlassViewProps) {
  return <GlassView variant={variant} borderRadius={borderRadius} {...props} />;
}
