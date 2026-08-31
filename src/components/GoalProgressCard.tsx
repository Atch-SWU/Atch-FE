import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import { COLORS } from '../constants/token';

interface GoalProgressCardProps {
  /** "주간 목표" / "일간 목표" 등 카드 좌측 라벨 */
  title: string;
  /** 달성률 (0~100) */
  percent: number;
}

/** 리포트 상단 목표 달성률 카드 (주간/일간 공용) */
export default function GoalProgressCard({
  title,
  percent,
}: GoalProgressCardProps) {
  return (
    <View style={styles.goalCard}>

      <View style={styles.goalHeader}>
        <AppText variant="bodyTask" color={COLORS.white}>
          {title}
        </AppText>

        <View style={styles.goalPercentRow}>
          <AppText variant="reportGoalPercent" color={COLORS.white}>
            {percent}%
          </AppText>

          <AppText variant="reportGoalAchieved" color={COLORS.white}>
            {' '}달성!
          </AppText>
        </View>
      </View>

      <View style={styles.goalTrack}>
        <View
          style={[
            styles.goalProgress,
            { width: `${percent}%` },
          ]}
        />
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  goalCard: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.main40,
    paddingHorizontal: 23,
    paddingVertical: 18,
  },

  goalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },

  goalPercentRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },

  goalTrack: {
    height: 12,
    borderRadius: 4,
    backgroundColor: COLORS.white,
    overflow: 'hidden',
  },

  goalProgress: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: COLORS.main40,
  },
});
