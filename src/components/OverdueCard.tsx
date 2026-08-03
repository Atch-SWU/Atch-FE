import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import CategoryBadge from './CategoryBadge';
import ClockBadge from './ClockBadge';
import { COLORS, SPACING } from '../constants/token';

interface OverdueCardProps {
  overLabel: string;
  title: string;
  percent: number;
  time: string;
}

/** 마감 초과 카드 */
export default function OverdueCard({ overLabel, title, percent, time }: OverdueCardProps) {
  const pct = Math.round(Math.min(Math.max(percent, 0), 100));

  return (
    <View style={styles.card}>
      <View style={styles.check} />
      <View style={styles.mid}>
        <View style={styles.badgeRow}><CategoryBadge label={overLabel} bgColor={COLORS.overdueBadgeBg} textColor={COLORS.overdueBadgeText} /></View>
        <AppText variant="cardTitle" color={COLORS.overdueTitle} style={styles.title}>{title}</AppText>
        <View style={styles.progressRow}>
          <AppText variant="statCaption" color={COLORS.overduePercent}>{pct}%</AppText>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${pct}%` }]} />
          </View>
        </View>
      </View>
      <ClockBadge
        time={time}
        circleColor={COLORS.overdueClockCircle}
        timeColor={COLORS.overdueTime}
        iconColor={COLORS.overdueClockIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.overdueBg,
    borderRadius: SPACING.cardRadius,
    paddingHorizontal: 21,
    paddingVertical: 14,
  },
  check: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.white },
  mid: { flex: 1, marginLeft: 16 },
  badgeRow: { flexDirection: 'row' },
  title: { marginTop: 8 },
  progressRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  track: { flex: 1, height: 12, borderRadius: 4, backgroundColor: COLORS.overdueBarTrack, marginLeft: 6, overflow: 'hidden' },
  fill: { height: 12, borderRadius: 4, backgroundColor: COLORS.overdueBarFill },
});
