import { Text, TextProps, StyleProp, TextStyle } from 'react-native';
import { TYPOGRAPHY, TypographyToken, COLORS } from '../constants/token';

interface AppTextProps extends TextProps {
  /** token.ts 의 TYPOGRAPHY 키 */
  variant: TypographyToken;
  color?: string;
  style?: StyleProp<TextStyle>;
}

/** 타이포/색상을 토큰으로만 받는 공통 텍스트 */
export default function AppText({
  variant,
  color = COLORS.black,
  style,
  ...rest
}: AppTextProps) {
  return <Text {...rest} style={[TYPOGRAPHY[variant], { color, textDecorationLine: 'none' }, style]} />;
}
