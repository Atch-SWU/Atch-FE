import { View, TextInput, StyleSheet, KeyboardTypeOptions } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/token';

type FormInputVariant = 'outlined' | 'filled';

interface FormInputProps {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  multiline?: boolean;
  secureTextEntry?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  // 입력창 스타일 — outlined(기본, 테두리형) / filled(배경 채움형, 로그인 화면 등에서 사용)
  variant?: FormInputVariant;
  // 플레이스홀더 색상 — 지정 없으면 기본 COLORS.placeholderText 사용
  placeholderColor?: string;
}

/** 라운드 입력 필드 — outlined(테두리) 또는 filled(배경 채움) */
export default function FormInput({
  value,
  onChangeText,
  placeholder,
  multiline,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  variant = 'outlined',
  placeholderColor,
}: FormInputProps) {
  return (
    <View style={[styles.box, variant === 'filled' && styles.boxFilled]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderColor ?? COLORS.placeholderText}
        multiline={multiline}
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
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
  boxFilled: {
    borderWidth: 0,
    backgroundColor: COLORS.surface,
    height: 50,
  },
  input: {
    color: COLORS.textMain,
    paddingVertical: 0,
  },
});
