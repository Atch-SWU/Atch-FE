import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS } from '../constants/token';

interface CompletedTaskRowProps {
  title: string;
  /** 보조 텍스트 (예: '30분 집중') */
  subText?: string;
  /** 체크 원을 눌러 완료 취소 */
  onPressCheck?: () => void;
}

/** 투두리스트 '완료 작업' 행 (피그마 6:7903: 360x73, 체크 원 24) */
export default function CompletedTaskRow({ title, subText, onPressCheck }: CompletedTaskRowProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.check} disabled={!onPressCheck} hitSlop={12} onPress={onPressCheck}>
        <CheckIcon width={14} height={14} color={COLORS.textInverse} />
      </Pressable>
      <View style={styles.texts}>
        <AppText variant="todoItemTitleText" color={COLORS.textBody}>{title}</AppText>
        {subText ? (
          <AppText variant="todoParent" color={COLORS.textWeak} style={styles.sub}>{subText}</AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surface, borderRadius: 14,
    paddingHorizontal: 20, paddingVertical: 16,
  },
  check: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: COLORS.fillBlack, alignItems: 'center', justifyContent: 'center',
  },
  texts: { marginLeft: 14 },
  sub: { marginTop: 6 },
});
