import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import AppText from './AppText';
import { COLORS, SPACING, TypographyToken } from '../constants/token';

type Variant = 'primary' | 'secondary' | 'soft';

interface AppButtonProps {
  label: string;
  variant?: Variant;
  textVariant?: TypographyToken;
  textColor?: string;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  /** true면 눌리지 않고 gray300 배경 + 흰색 글자로 표시 */
  disabled?: boolean;
  /** true면 모양은 그대로 두고 눌리기만 막는다 */
  locked?: boolean;
}

const VARIANT = {
  primary: { bg: COLORS.gray800, text: COLORS.white },
  secondary: { bg: COLORS.gray800, text: COLORS.white },
  soft: { bg: COLORS.gray800, text: COLORS.white },
};

/** 공통 버튼 (색상/타이포 전부 토큰) */
export default function AppButton({
  label,
  variant = 'primary',
  textVariant,
  textColor,
  onPress,
  style,
  disabled = false,
  locked = false,
}: AppButtonProps) {
  const v = VARIANT[variant];
  const defaultText: TypographyToken = variant === 'soft' ? 'subtleBtn' : 'primaryBtn';

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || locked}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        variant === 'soft' && styles.soft,
        { backgroundColor: v.bg },
        pressed && !disabled && !locked && styles.pressed,
        style,
        disabled && { backgroundColor: COLORS.gray300 },
      ]}
    >
      <AppText
        variant={textVariant ?? defaultText}
        color={disabled ? COLORS.white : textColor ?? v.text}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 52,
    borderRadius: SPACING.cardRadius,
    alignItems: 'center',
    justifyContent: 'center',
  },
  soft: { height: 50, borderRadius: 15 },
  pressed: { opacity: 0.85 },
});
