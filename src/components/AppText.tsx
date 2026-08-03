import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { TYPOGRAPHY, TypographyToken, COLORS } from '../constants/token';

interface AppTextProps extends TextProps {
  /** token.ts 의 TYPOGRAPHY 키 */
  variant: TypographyToken;
  /** token 색상값 (기본 textMain). hex 직접 입력 금지 */
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** 타이포/색상을 토큰으로만 받는 공통 텍스트 */
export default function AppText({
  variant,
  color = COLORS.textMain,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[TYPOGRAPHY[variant], { color }, style]} />;
}
