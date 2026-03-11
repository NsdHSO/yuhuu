import { ViewProps } from 'react-native';

export type GlassVariant = 'frosted' | 'tinted' | 'vibrant' | 'ultra-thin' | 'prominent';

export type GlassViewProps = ViewProps & {
  variant?: GlassVariant;
  intensity?: number;
  borderRadius?: number;
  enableShadow?: boolean;
  shadowLevel?: 'subtle' | 'medium' | 'elevated';
  enableBorder?: boolean;
};

export type GlassBottomSheetProps = {
  children?: React.ReactNode;
  variant?: GlassVariant;
  enableWaves?: boolean;
  snapPoints?: (string | number)[];
  enableBackdropDismiss?: boolean;
  testID?: string;
};
