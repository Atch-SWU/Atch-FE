import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';
import { formatMinutes } from '../utils/duration';

interface TotalSummaryCardProps {
  totalMinutes: number;
  stepCount: number;
}

/** 총 소요시간 요약 (피그마 6:4625): 74h r14, 오렌지 틴트 */
export default function TotalSummaryCard({ totalMinutes, stepCount }: TotalSummaryCardProps) {
  return (
    <View style={styles.card}>
      <AppText variant="totalTitle" color={COLORS.primary}>총 {formatMinutes(totalMinutes)}</AppText>
      <AppText variant="totalSub" color={COLORS.textSub} style={styles.sub}>{stepCount}단계로 구성했어요</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 74, borderRadius: 14, borderWidth: 1, borderColor: COLORS.primaryBorder,
    backgroundColor: COLORS.primaryTint, paddingHorizontal: 21, justifyContent: 'center',
  },
  sub: { marginTop: 4 },
});
