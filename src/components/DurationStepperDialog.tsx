import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import ModalCard from './ModalCard';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface DurationStepperDialogProps {
  visible: boolean;
  initialMinutes: number;
  onCancel: () => void;
  onSave: (minutes: number) => void;
}

const STEP = 5;
const MIN = 5;
const MAX = 600;

/** 소요시간 스테퍼 팝업 (피그마 6:4399): 360x268 r18, ± 50x50, 값 40 ExtraBold */
export default function DurationStepperDialog({ visible, initialMinutes, onCancel, onSave }: DurationStepperDialogProps) {
  const [value, setValue] = useState(initialMinutes);
  useEffect(() => { if (visible) setValue(initialMinutes); }, [visible, initialMinutes]);

  const dec = () => setValue((v) => Math.max(MIN, v - STEP));
  const inc = () => setValue((v) => Math.min(MAX, v + STEP));

  return (
    <ModalCard visible={visible} onRequestClose={onCancel}>
      <View style={styles.body}>
        <AppText variant="popupTitle" color={COLORS.textMain}>소요시간</AppText>
        <View style={styles.valueRow}>
          <Pressable style={styles.stepBtn} onPress={dec}>
            <View style={styles.bar} />
          </Pressable>
          <AppText variant="stepperValue" color={COLORS.textMain}>{value}분</AppText>
          <Pressable style={styles.stepBtn} onPress={inc}>
            <View style={styles.bar} />
            <View style={[styles.bar, styles.barV]} />
          </Pressable>
        </View>
        <AppText variant="popupSub" color={COLORS.textWeak} style={styles.sub}>시간을 자유롭게 설정할 수 있어요.</AppText>
        <View style={styles.btnRow}>
          <Pressable style={[styles.btn, { backgroundColor: COLORS.fillSoft }]} onPress={onCancel}>
            <AppText variant="popupBtnSemi" color={COLORS.textWeak}>취소</AppText>
          </Pressable>
          <Pressable style={[styles.btn, { backgroundColor: COLORS.fillBlack }]} onPress={() => onSave(value)}>
            <AppText variant="popupBtnSemi" color={COLORS.textInverse}>저장</AppText>
          </Pressable>
        </View>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: { alignSelf: 'stretch', alignItems: 'center', paddingTop: 30, paddingBottom: 30, paddingHorizontal: 34 },
  valueRow: { alignSelf: 'stretch', marginTop: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  stepBtn: {
    width: 50, height: 50, borderRadius: 25, backgroundColor: COLORS.fillMuted, borderWidth: 1,
    borderColor: COLORS.borderStrong, alignItems: 'center', justifyContent: 'center',
  },
  bar: { width: 16, height: 4, borderRadius: 2, backgroundColor: COLORS.textSub },
  barV: { position: 'absolute', width: 4, height: 16 },
  sub: { marginTop: 14 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' },
  btn: { flex: 1, height: 51, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
