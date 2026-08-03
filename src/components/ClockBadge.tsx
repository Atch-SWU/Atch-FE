import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import ClockIcon from '../assets/icon/clock.svg';
import { COLORS } from '../constants/token';

interface ClockBadgeProps {
  time: string;
  circleColor: string;
  timeColor: string;
  iconColor?: string;
}

/** 시계 원형 아이콘 + 시간 라벨 */
export default function ClockBadge({
  time, circleColor, timeColor, iconColor = COLORS.onAccent,
}: ClockBadgeProps) {
  return (
    <View style={styles.wrap}>
      <View style={[styles.circle, { backgroundColor: circleColor }]}>
        <ClockIcon width={19} height={19} color={iconColor} />
      </View>
      <AppText variant="todoTime" color={timeColor} style={styles.time}>{time}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', width: 34 },
  circle: { width: 26, height: 26, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  time: { marginTop: 4 },
});
