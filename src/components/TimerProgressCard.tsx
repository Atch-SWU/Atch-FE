import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import ChevronRight from '../assets/icon/chevron-right-thin.svg';
import { COLORS } from '../constants/token';

interface TimerProgressCardProps {
  /** 예: "45분" */
  estimateLabel: string;
  /** 0~1 */
  progress: number;
  onPressInfo: () => void;
}

/** 예상 소요시간 진행 카드(70h) + 작업 정보 보기 행(48h) — 피그마 6:5444 */
export default function TimerProgressCard({ estimateLabel, progress, onPressInfo }: TimerProgressCardProps) {
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);
  return (
    <View style={styles.wrap}>
      <View style={styles.card}>
        <View style={styles.row}>
          <AppText variant="progressMetaBold" color={COLORS.textWeak}>예상 소요시간 {estimateLabel}</AppText>
          <AppText variant="timerPercent" color={COLORS.primary}>{pct}% 소요</AppText>
        </View>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%` }]} />
        </View>
      </View>
      <Pressable style={styles.infoRow} onPress={onPressInfo}>
        <AppText variant="progressMetaBold" color={COLORS.textWeak}>작업 정보 보기</AppText>
        <ChevronRight width={16} height={16} color={COLORS.iconWeak} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 10 },
  card: { height: 70, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, paddingHorizontal: 18, paddingTop: 15 },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  track: { height: 10, borderRadius: 10, backgroundColor: COLORS.fillMuted, marginTop: 12, overflow: 'hidden' },
  fill: { height: 10, borderRadius: 10, backgroundColor: COLORS.primary },
  infoRow: {
    height: 48, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface,
    paddingLeft: 19, paddingRight: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
});
