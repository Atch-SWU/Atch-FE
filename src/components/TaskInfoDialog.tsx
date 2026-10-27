import { View, Pressable, StyleSheet } from 'react-native';
import ModalCard from './ModalCard';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface TaskInfoDialogProps {
  visible: boolean;
  startText: string;
  endText: string;
  memo: string;
  onClose: () => void;
}

/** 작업 정보 팝업 (피그마 6:5833): 360 폭 r24, 라벨 폭 77, 행 간격 10, 닫기 51h */
export default function TaskInfoDialog({ visible, startText, endText, memo, onClose }: TaskInfoDialogProps) {
  const rows: [string, string][] = [['시작 시간', startText], ['종료 예정', endText], ['메모', memo]];
  return (
    <ModalCard visible={visible} radius={24} onRequestClose={onClose}>
      <View style={styles.body}>
        <AppText variant="popupTitle" color={COLORS.textMain}>작업 정보</AppText>
        <View style={styles.list}>
          {rows.map(([label, value]) => (
            <View key={label} style={styles.row}>
              <AppText variant="infoLabel" color={COLORS.textWeak} style={styles.label}>{label}</AppText>
              <AppText variant="infoLabel" color={COLORS.textMain} style={styles.value}>{value}</AppText>
            </View>
          ))}
        </View>
        <Pressable style={styles.close} onPress={onClose}>
          <AppText variant="popupBtnSemi" color={COLORS.textWeak}>닫기</AppText>
        </Pressable>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: { alignSelf: 'stretch', paddingTop: 34, paddingBottom: 29, paddingHorizontal: 34 },
  list: { marginTop: 7, gap: 10 },
  row: { flexDirection: 'row', alignItems: 'center' },
  label: { width: 77 },
  value: { flex: 1 },
  close: { marginTop: 23, height: 51, borderRadius: 12, backgroundColor: COLORS.fillSoft, alignItems: 'center', justifyContent: 'center' },
});
