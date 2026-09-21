import { Pressable, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/token';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  /** on 상태 트랙 색상 오버라이드 (기본값 COLORS.toggleTrackOn) */
  activeColor?: string;
}

/** 커스텀 토글 스위치 */
export default function ToggleSwitch({ value, onValueChange, activeColor }: ToggleSwitchProps) {
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value ? (activeColor ?? COLORS.toggleTrackOn) : COLORS.toggleTrackOff,
          alignItems: value ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={styles.knob} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 59,
    height: 28,
    borderRadius: 14,
    paddingHorizontal: 4,
    justifyContent: 'center',
  },
  knob: {
    width: 30,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.toggleKnob,
  },
});
