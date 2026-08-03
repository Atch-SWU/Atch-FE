import { View, TextInput, StyleSheet } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/token';

interface FormInputProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
}

/** 라운드 아웃라인 입력 필드 */
export default function FormInput({ value, onChangeText, placeholder, multiline }: FormInputProps) {
  return (
    <View style={styles.box}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.placeholderText}
        multiline={multiline}
        style={[TYPOGRAPHY.formText, styles.input]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    minHeight: 50,
    paddingHorizontal: 22,
    justifyContent: 'center',
  },
  input: {
    color: COLORS.textMain,
    paddingVertical: 0,
  },
});
