import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import PlusIcon from '../assets/icon/plus.svg';
import { COLORS } from '../constants/token';

interface AddButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** 우상단 일정 추가(+) 버튼 — 피그마: 38x38 원, 다크 */
export default function AddButton({ onPress, style }: AddButtonProps) {
  return (
    <Pressable onPress={onPress} hitSlop={8} style={[styles.btn, style]}>
      <PlusIcon width={20} height={20} color={COLORS.textInverse} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 38, height: 38, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.fillDark,
  },
});
