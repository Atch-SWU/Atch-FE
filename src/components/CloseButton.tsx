import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import CloseIcon from '../assets/icon/close.svg';
import { COLORS } from '../constants/token';

interface CloseButtonProps {
  onPress?: () => void;
  size?: number;
  style?: StyleProp<ViewStyle>;
  /** 'circle' = 38 원형 회색 배경 (타이머 피그마) */
  variant?: 'plain' | 'circle';
}

/** 우상단 닫기(X) 버튼 */
export default function CloseButton({ onPress, size = 24, style, variant = 'plain' }: CloseButtonProps) {
  if (variant === 'circle') {
    return (
      <Pressable hitSlop={8} onPress={onPress} style={[circle.btn, style]}>
        <CloseIcon width={14} height={14} color={COLORS.textSub} />
      </Pressable>
    );
  }
  return (
    <Pressable hitSlop={12} onPress={onPress} style={style}>
      <CloseIcon width={size} height={size} color={COLORS.textWeak} />
    </Pressable>
  );
}

const circle = StyleSheet.create({
  btn: { width: 38, height: 38, borderRadius: 19, backgroundColor: COLORS.fillDisabled, alignItems: 'center', justifyContent: 'center' },
});
