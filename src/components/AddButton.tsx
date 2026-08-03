import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import PlusIcon from '../assets/icon/plus.svg';
import { COLORS } from '../constants/token';

interface AddButtonProps {
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

/** 우상단 일정 추가(+) 버튼 */
export default function AddButton({ onPress, style }: AddButtonProps) {
  return (
    <Pressable onPress={onPress} style={[styles.btn, style]}>
      <PlusIcon width={28} height={28} color={COLORS.addBtnIcon} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: {
    width: 54, height: 54, borderRadius: 27,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.addBtnBg,
  },
});
