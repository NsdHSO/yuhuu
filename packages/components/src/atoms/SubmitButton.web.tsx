import React from 'react';
import {Text} from 'react-native';

interface SubmitButtonProps {
  onPress: () => void;
  disabled: boolean;
  style: any;
  textStyle: any;
  children: React.ReactNode;
  activeOpacity?: number;
}

/**
 * Web-specific submit button using semantic HTML <button> element.
 * This fixes Safari autofill trying to focus the submit button after filling fields.
 */
export function SubmitButton({onPress, disabled, style, textStyle, children}: SubmitButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!disabled) {
      onPress();
    }
  };

  return (
    <button
      type="submit"
      onClick={handleClick}
      disabled={disabled}
      style={{
        ...style,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <Text style={textStyle}>{children}</Text>
    </button>
  );
}
