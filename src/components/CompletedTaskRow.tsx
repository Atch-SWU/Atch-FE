import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS } from '../constants/token';

interface CompletedTaskRowProps {
  title: string;
}

/** 투두리스트 완료 행 (체크 원 + 취소선 제목) */
export default function CompletedTaskRow({ title }: CompletedTaskRowProps) {
  return (
    <View style={styles.row}>
      <View style={styles.check}>
        <CheckIcon width={13} height={13} color={COLORS.onAccent} />
      </View>
      <AppText variant="doneRowText" color={COLORS.doneRowTextColor} style={styles.title}>{title}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.doneRowBg,
    borderRadius: 16,
    paddingHorizontal: 21,
    paddingVertical: 14,
  },
  check: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.doneCheckBg,
    alignItems: 'center', justifyContent: 'center',
  },
  title: { marginLeft: 16, textDecorationLine: 'line-through' },
});
