import React, {useState} from 'react';
import {TextInput, TextInputProps, View, Pressable, StyleSheet} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {useColorScheme} from '@yuhuu/components';
import {getInputStyles} from '../styles/input-styles';

interface PasswordInputProps extends Omit<TextInputProps, 'secureTextEntry'> {
  inputRef?: React.RefObject<View | null>;
  onFocusCallback?: () => void;
}

export function PasswordInput({inputRef, onFocusCallback, testID, ...props}: PasswordInputProps) {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const scheme = useColorScheme() ?? 'light';
  const inputStyles = getInputStyles(scheme);

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(prev => !prev);
  };

  const iconColor = scheme === 'dark' ? '#9CA3AF' : '#6B7280';

  const content = (
    <View style={styles.container}>
      <TextInput
        {...props}
        secureTextEntry={!isPasswordVisible}
        placeholderTextColor={inputStyles.placeholderColor}
        selectionColor={inputStyles.selectionColor}
        style={[inputStyles.container as any, styles.input]}
        onFocus={onFocusCallback}
        testID={testID}
      />
      <Pressable
        onPress={togglePasswordVisibility}
        style={styles.iconButton}
        testID={testID ? `${testID}-toggle` : undefined}
        hitSlop={8}
      >
        <MaterialIcons
          name={isPasswordVisible ? 'visibility' : 'visibility-off'}
          size={24}
          color={iconColor}
          testID={testID ? `${testID}-icon` : undefined}
        />
      </Pressable>
    </View>
  );

  return inputRef ? <View ref={inputRef}>{content}</View> : content;
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    paddingRight: 48,
  },
  iconButton: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
});
