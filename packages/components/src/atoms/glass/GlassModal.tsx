import { Modal, ModalProps, StyleSheet } from 'react-native';
import { GlassView } from './GlassView';
import type { GlassVariant } from '../../types/glass';

type GlassModalProps = ModalProps & {
  variant?: GlassVariant;
  testID?: string;
};

export function GlassModal({
  variant = 'prominent',
  children,
  testID,
  ...props
}: GlassModalProps) {
  return (
    <Modal transparent {...props}>
      <GlassView
        variant={variant}
        style={StyleSheet.absoluteFill}
        enableBorder={false}
        testID={testID}
      >
        {children}
      </GlassView>
    </Modal>
  );
}
