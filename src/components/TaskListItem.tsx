import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AppText from './AppText';
import CategoryBadge from './CategoryBadge';
import ClockBadge from './ClockBadge';
import { COLORS, SPACING } from '../constants/token';

interface TaskListItemProps {
  statusLabel: string;
  title: string;
  time: string;
}

const CHECK_SIZE = 22;
const CHECK_STROKE = 1.8;
// 대시 길이/간격 (px) — 피그마 촘촘함에 맞춰 조정 가능
const DASH = 3;
const GAP = 3;

/** 투두리스트 '오늘 할 일' 항목 */
export default function TaskListItem({ statusLabel, title, time }: TaskListItemProps) {
  const r = (CHECK_SIZE - CHECK_STROKE) / 2;
  const c = CHECK_SIZE / 2;

  return (
    <View style={styles.card}>
      <Svg width={CHECK_SIZE} height={CHECK_SIZE}>
        <Circle
          cx={c}
          cy={c}
          r={r}
          fill={COLORS.todoCheckBg}
          stroke={COLORS.todoCheckBorder}
          strokeWidth={CHECK_STROKE}
          strokeDasharray={[DASH, GAP]}
          strokeLinecap="round"
        />
      </Svg>
      <View style={styles.mid}>
        <View style={styles.badgeRow}><CategoryBadge label={statusLabel} bgColor={COLORS.todoBadgeBg} textColor={COLORS.todoBadgeText} /></View>
        <AppText variant="todoTitle" color={COLORS.todoItemTitle} style={styles.title}>{title}</AppText>
      </View>
      <ClockBadge
        time={time}
        circleColor={COLORS.todoClockCircle}
        timeColor={COLORS.todoTimeText}
        iconColor={COLORS.todoClockIcon}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.todoItemBg,
    borderColor: COLORS.todoItemBorder,
    borderWidth: 1,
    borderRadius: SPACING.cardRadius,
    paddingHorizontal: 21,
    paddingVertical: 14,
  },
  mid: { flex: 1, marginLeft: 16 },
  badgeRow: { flexDirection: 'row' },
  title: { marginTop: 8 },
});
