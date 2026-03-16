import React from 'react';
import {TextInput, TextInputProps, View} from 'react-native';
import {useColorScheme} from '@yuhuu/components';
import {getInputStyles} from '../styles/input-styles';

interface AuthInputProps extends TextInputProps {
  inputRef?: React.RefObject<View | null>;
  onFocusCallback?: () => void;
}

export function AuthInput({inputRef, onFocusCallback, ...props}: AuthInputProps) {
  const scheme = useColorScheme() ?? 'light';
  const inputStyles = getInputStyles(scheme);

  const content = (
    <TextInput
      {...props}
      placeholderTextColor={inputStyles.placeholderColor}
      selectionColor={inputStyles.selectionColor}
      style={inputStyles.container as any}
      onFocus={onFocusCallback}
    />
  );

  return inputRef ? <View ref={inputRef}>{content}</View> : content;
}
