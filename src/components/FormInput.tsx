import {
  View,
  TextInput,
  StyleSheet,
  KeyboardTypeOptions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useState } from 'react';
import { COLORS } from '../constants/token';

type FormInputVariant = 'outlined' | 'filled';

interface FormInputProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  variant?: FormInputVariant;
  placeholderColor?: string;
  textColor?: string;
  focusBorderColor?: string;
  boxStyle?: StyleProp<ViewStyle>;
}

export default function FormInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  variant = 'outlined',
  placeholderColor = COLORS.gray400,
  textColor = COLORS.gray800,
  focusBorderColor = COLORS.gray400,
  boxStyle,
}: FormInputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View
      style={[
        styles.box,
        variant === 'filled' && styles.boxFilled,
        focused && styles.boxFocused,
        focused && {
          backgroundColor: COLORS.gray300,
          borderColor: focusBorderColor,
        },
        boxStyle,
      ]}
    >
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : undefined}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,
    minHeight: 50,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },

  boxFilled: {
    backgroundColor: COLORS.gray200,
    height: 50,
  },

  boxFocused: {
    borderWidth: 1,
  },

  input: {
    fontFamily: 'SUIT-Medium',
    fontSize: 15,
    lineHeight: 20,
    color: COLORS.gray800,
    paddingVertical: 0,
  },
});