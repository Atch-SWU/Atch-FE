import { View, TextInput, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS, TYPOGRAPHY } from '../constants/token';

interface DurationInputProps {
  hours: string;
  minutes: string;
  onChangeHours: (v: string) => void;
  onChangeMinutes: (v: string) => void;
}

const digits = (v: string) => v.replace(/[^0-9]/g, '').slice(0, 2);

/** 소요 시간 직접 입력 (피그마 6:4625): 55h r12, [01]시간 [30]분 */
export default function DurationInput({ hours, minutes, onChangeHours, onChangeMinutes }: DurationInputProps) {
  return (
    <View style={styles.box}>
      <AppText variant="formRowText" color={COLORS.textStrong}>직접 입력</AppText>
      <View style={styles.group}>
        <View style={styles.unitGroup}>
          <TextInput
            value={hours}
            onChangeText={(v) => onChangeHours(digits(v))}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor={COLORS.textPlaceholder}
            style={styles.pill}
          />
          <AppText variant="durationUnit" color={COLORS.textBody}>시간</AppText>
        </View>
        <View style={styles.unitGroup}>
          <TextInput
            value={minutes}
            onChangeText={(v) => onChangeMinutes(digits(v))}
            keyboardType="number-pad"
            placeholder="00"
            placeholderTextColor={COLORS.textPlaceholder}
            style={styles.pill}
          />
          <AppText variant="durationUnit" color={COLORS.textBody}>분</AppText>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    height: 55, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface,
    paddingHorizontal: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  group: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  unitGroup: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  pill: {
    ...TYPOGRAPHY.durationNum, width: 54, height: 36, borderRadius: 12, backgroundColor: COLORS.fillSoft,
    color: COLORS.textStrong, textAlign: 'center', paddingVertical: 0,
  },
});
