import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import AppText from './AppText';
import { COLORS, SPACING, TypographyToken } from '../constants/token';

type Variant = 'primary' | 'secondary' | 'soft';

interface AppButtonProps {
  label: string;
  variant?: Variant;
  textVariant?: TypographyToken;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

const VARIANT = {
  primary: { bg: COLORS.primaryBtnBg, text: COLORS.primaryBtnText },
  secondary: { bg: COLORS.secondaryBtnBg, text: COLORS.secondaryBtnText },
  soft: { bg: COLORS.softBtnBg, text: COLORS.softBtnText },
};

/** 공통 버튼 (색상/타이포 전부 토큰) */
export default function AppButton({
  label,
  variant = 'primary',
  textVariant,
  onPress,
  style,
}: AppButtonProps) {
  const v = VARIANT[variant];
  const defaultText: TypographyToken = variant === 'soft' ? 'subtleBtn' : 'primaryBtn';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }: { pressed: boolean }) => [
        styles.base,
        variant === 'soft' && styles.soft,
        { backgroundColor: v.bg },
        pressed && styles.pressed,
        style,
      ]}
    >
      <AppText variant={textVariant ?? defaultText} color={v.text}>{label}</AppText>
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
