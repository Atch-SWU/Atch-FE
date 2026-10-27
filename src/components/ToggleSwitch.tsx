import { Pressable, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/token';

interface ToggleSwitchProps {
  value: boolean;
  onValueChange: (v: boolean) => void;
  /** on 상태 트랙 색상 오버라이드 (기본값 COLORS.primary) */
  activeColor?: string;
  /** 'form' = 태스크 추가 폼용 (48x29, 피그마) */
  variant?: 'default' | 'form';
}

/** 커스텀 토글 스위치 */
export default function ToggleSwitch({ value, onValueChange, activeColor, variant = 'default' }: ToggleSwitchProps) {
  if (variant === 'form') {
    return (
      <Pressable
        onPress={() => onValueChange(!value)}
        style={[styles.formTrack, { backgroundColor: value ? COLORS.fillDark : COLORS.fillDisabled, alignItems: value ? 'flex-end' : 'flex-start' }]}
      >
        <View style={styles.formKnob} />
      </Pressable>
    );
  }
  return (
    <Pressable
      onPress={() => onValueChange(!value)}
      style={[
        styles.track,
        {
          backgroundColor: value ? (activeColor ?? COLORS.primary) : COLORS.fillMuted,
          alignItems: value ? 'flex-end' : 'flex-start',
        },
      ]}
    >
      <View style={styles.knob} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  formTrack: { width: 48, height: 29, borderRadius: 14.5, padding: 3, justifyContent: 'center' },
  formKnob: { width: 23, height: 23, borderRadius: 11.5, backgroundColor: COLORS.surface },
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
    backgroundColor: COLORS.surface,
  },
});
