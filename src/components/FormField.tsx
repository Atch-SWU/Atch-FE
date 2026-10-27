import { View, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/token';

interface FormFieldProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  height?: number;
  keyboardType?: KeyboardTypeOptions;
}

/** 태스크 추가 입력 필드 (피그마: 55h r12 흰 배경 + gray200 테두리 / 메모 110h) */
export default function FormField({
  value, onChangeText, placeholder, multiline, height = 55, keyboardType,
}: FormFieldProps) {
  return (
    <View style={[styles.box, { height }, multiline && styles.boxMulti]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.textPlaceholder}
        multiline={multiline}
        textAlignVertical={multiline ? 'top' : 'center'}
        keyboardType={keyboardType}
        style={[multiline ? styles.inputMulti : styles.input, multiline && { height: height - 40 }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 21,
    justifyContent: 'center',
  },
  boxMulti: { paddingVertical: 19, justifyContent: 'flex-start' },
  input: { ...TYPOGRAPHY.formInputText, color: COLORS.textStrong, paddingVertical: 0 },
  inputMulti: { ...TYPOGRAPHY.formInputText, color: COLORS.textStrong, paddingVertical: 0 },
});
