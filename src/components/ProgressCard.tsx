import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import PlayIcon from '../assets/icon/play.svg';
import { COLORS, SPACING } from '../constants/token';

interface ProgressCardProps {
  badgeLabel: string;
  title: string;
  /** 상위 작업명 (배지 옆, 예: '팀 주간 보고') */
  parent?: string;
  estimateText: string;
  progressText: string;
  /** 0~100 */
  percent: number;
  onPlay?: () => void;
}

/** 투두리스트 '진행중' 카드 (피그마 6:7883: 360x134, r16) */
export default function ProgressCard({
  badgeLabel, title, parent, estimateText, progressText, percent, onPlay,
}: ProgressCardProps) {
  const pct = Math.min(Math.max(percent, 0), 100);

  return (
    <View style={styles.card}>
      <View style={styles.top}>
        <View>
          <View style={styles.badgeRow}>
            <View style={styles.badge}>
              <AppText variant="progressBadge" color={COLORS.primary}>{badgeLabel}</AppText>
            </View>
            {parent ? <AppText variant="progressMeta" color={COLORS.textWeak}>{parent}</AppText> : null}
          </View>
          <AppText variant="progressTitle" color={COLORS.textMain} style={styles.title}>{title}</AppText>
        </View>
        <Pressable onPress={onPlay} style={styles.play}>
          <PlayIcon width={20} height={20} color={COLORS.textInverse} />
        </Pressable>
      </View>

      <View style={styles.meta}>
        <AppText variant="progressMeta" color={COLORS.textSub}>{estimateText}</AppText>
        <AppText variant="progressMetaBold" color={COLORS.textSub}>{progressText}</AppText>
      </View>

      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 134,
    borderRadius: 16,
    backgroundColor: COLORS.fillMuted,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    paddingTop: 18,
    paddingHorizontal: 18,
  },
  top: {
    height: 58,
    marginHorizontal: 4,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  badge: {
    alignSelf: 'flex-start',
    marginLeft: SPACING.chipInset,
    height: 25,
    paddingHorizontal: 8,
    borderRadius: 10,
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
  },
  title: { marginTop: 8, marginLeft: SPACING.glyphInset },
  play: {
    width: 45, height: 45, borderRadius: 23,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.fillBlack,
  },
  meta: {
    marginTop: 6,
    marginHorizontal: 4,
    height: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  track: {
    marginTop: 8,
    height: 8,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.surface,
  },
  fill: { height: 8, borderRadius: 10, backgroundColor: COLORS.primaryBright },
});
