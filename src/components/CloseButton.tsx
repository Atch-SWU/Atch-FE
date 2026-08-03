import { Pressable, StyleProp, ViewStyle } from 'react-native';
import CloseIcon from '../assets/icon/close.svg';
import { COLORS } from '../constants/token';

interface CloseButtonProps {
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
}

/** 우상단 닫기(X) 버튼 */
export default function CloseButton({ onPress, size = 24, style }: CloseButtonProps) {
  return (
    <Pressable hitSlop={12} onPress={onPress} style={style}>
      <CloseIcon width={size} height={size} color={COLORS.closeIcon} />
    </Pressable>
  );
}
