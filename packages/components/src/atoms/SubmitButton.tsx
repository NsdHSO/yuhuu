import React from 'react';
import {Text, TouchableOpacity} from 'react-native';

interface SubmitButtonProps {
  onPress: () => void;
  disabled: boolean;
  style: any;
  textStyle: any;
  children: React.ReactNode;
  activeOpacity?: number;
}

/**
 * Native submit button using TouchableOpacity.
 * Web uses SubmitButton.web.tsx with semantic <button> element.
 */
export function SubmitButton({onPress, disabled, style, textStyle, children, activeOpacity = 0.7}: SubmitButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={activeOpacity}
      style={style}
    >
      <Text style={textStyle}>{children}</Text>
    </TouchableOpacity>
  );
}
