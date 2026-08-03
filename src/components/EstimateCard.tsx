import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { CATEGORY_COLORS, CategoryKey, SPACING } from '../constants/token';

interface EstimateCardProps {
  category: CategoryKey;
  /** 예상 시간 라벨 (예: "45분") */
  estimateLabel: string;
  /** 경과 라벨 (예: "16분 소요") */
  elapsedLabel: string;
  /** 진행률 0~1 */
  progress: number;
}

/** 타이머 화면의 예상 시간/진행률 카드 (카테고리 색상) */
export default function EstimateCard({ category, estimateLabel, elapsedLabel, progress }: EstimateCardProps) {
  const c = CATEGORY_COLORS[category].estimate;
  const pct = Math.round(Math.min(Math.max(progress, 0), 1) * 100);

  return (
    <View style={[styles.card, { backgroundColor: c.cardBg, borderColor: c.cardBorder }]}>
      <View style={styles.row}>
        <View style={styles.inline}>
          <AppText variant="estLabel" color={c.strong}>예상 시간</AppText>
          <AppText variant="estLabelNum" color={c.strong} style={styles.gap}>{estimateLabel}</AppText>
        </View>
        <View style={styles.inline}>
          <AppText variant="estPercent" color={c.strong}>{pct}%</AppText>
          <View style={[styles.dot, { backgroundColor: c.soft }]} />
          <AppText variant="estSoft" color={c.soft}>{elapsedLabel}</AppText>
        </View>
      </View>
      <View style={[styles.track, { backgroundColor: c.barTrack }]}>
        <View style={[styles.fill, { backgroundColor: c.barFill, width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: SPACING.cardRadius,
    borderWidth: 1,
    paddingHorizontal: 23,
    paddingVertical: 18,
  },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  inline: { flexDirection: 'row', alignItems: 'center' },
  gap: { marginLeft: 6 },
  dot: { width: 4, height: 4, borderRadius: 2, marginHorizontal: 6 },
  track: { height: 12, borderRadius: 4, marginTop: 10, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 4 },
});
