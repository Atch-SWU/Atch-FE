import { View, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import AppText from './AppText';
import Character from './Character';
import { COLORS } from '../constants/token';

interface CircularTimerProps {
  /** 표시 시간 텍스트 (예: "25 : 00") */
  timeText: string;
  /** 진행률 0~1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
}

/** 원형 진행바 + 중앙 캐릭터 + 시간 */
export default function CircularTimer({
  timeText, progress, size = 268, strokeWidth = 14,
}: CircularTimerProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const p = Math.min(Math.max(progress, 0), 1);
  const center = size / 2;

  return (
    <View style={styles.wrap}>
      <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
        <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
          <Circle
            cx={center} cy={center} r={radius}
            stroke={COLORS.ringTrack} strokeWidth={strokeWidth} fill="none"
          />
          <Circle
            cx={center} cy={center} r={radius}
            stroke={COLORS.ringProgress} strokeWidth={strokeWidth} fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - p)}
            strokeLinecap="round"
            transform={`rotate(-90 ${center} ${center})`}
          />
        </Svg>
        <Character size={150} />
      </View>
      <AppText variant="timerTime" color={COLORS.cardTitle} style={styles.time}>
        {timeText}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center' },
  time: { marginTop: 10, textAlign: 'center' },
});
