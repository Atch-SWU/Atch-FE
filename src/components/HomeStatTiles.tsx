import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface HomeStatTilesProps {
  /** null = 아직 불러오지 못함 → '-' */
  weekDoneCount: number | null;
  /** 0~100 정수. null = 배정이 없거나 집계 전 → '-' (0%로 바꾸지 않음) */
  completionRate: number | null;
  grade: string;
  /** 아이템 보상까지 진행률(%) */
  rewardPercent: number;
  onPressWeekDone?: () => void;
}

/** 홈 하단 통계 타일 2개 (피그마 6:5668: 각 174x165, r18, 간격 12) */
export default function HomeStatTiles({ weekDoneCount, completionRate, grade, rewardPercent, onPressWeekDone }: HomeStatTilesProps) {
  return (
    <View style={styles.row}>
      <Pressable style={styles.tile} onPress={onPressWeekDone}>
        <View>
          <AppText variant="progressMeta" color={COLORS.textWeak}>일주일 간 완료 작업</AppText>
          <AppText variant="homeStatValue" color={COLORS.textStrong} style={styles.value}>{weekDoneCount == null ? '-' : `${weekDoneCount}개`}</AppText>
        </View>
        <View style={styles.right}>
          <AppText variant="homeStatRateLabel" color={COLORS.textStrong}>완료율</AppText>
          <AppText variant="homeStatBig" color={COLORS.primary}>{completionRate == null ? '-' : `${completionRate}%`}</AppText>
        </View>
      </Pressable>
      <View style={styles.tile}>
        <View>
          <AppText variant="homeStatValue" color={COLORS.textStrong}>{grade}</AppText>
          <AppText variant="progressMeta" color={COLORS.textWeak} style={styles.sub}>아이템 보상까지</AppText>
        </View>
        <View style={styles.right}>
          <AppText variant="homeStatBig" color={COLORS.textStrong}>{rewardPercent}%</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 12 },
  tile: {
    flex: 1, height: 165, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border,
    backgroundColor: COLORS.homeStatBg, paddingTop: 19, paddingBottom: 15, paddingLeft: 19, paddingRight: 17,
    justifyContent: 'space-between',
  },
  value: { marginTop: 5 },
  sub: { marginTop: 5 },
  right: { alignItems: 'flex-end' },
});
