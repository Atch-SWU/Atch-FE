import { View, Pressable, StyleSheet } from 'react-native';
import ModalCard from './ModalCard';
import AppText from './AppText';
import { Subtask } from './SubtaskList';
import { COLORS } from '../constants/token';
import { formatMinutes } from '../utils/duration';

interface TaskDetailDialogProps {
  visible: boolean;
  items: Subtask[];
  totalMinutes: number;
  onClose: () => void;
}

/** 작업 상세 팝업 (피그마 6:4946): 360x330 r18, 행 25h / 간격 8, 총계 오렌지, 닫기 292x51 */
export default function TaskDetailDialog({ visible, items, totalMinutes, onClose }: TaskDetailDialogProps) {
  return (
    <ModalCard visible={visible} onRequestClose={onClose}>
      <View style={styles.body}>
        <AppText variant="popupTitle" color={COLORS.textMain} style={styles.title}>작업 상세</AppText>
        <View style={styles.list}>
          {items.map((it) => (
            <View key={it.id} style={styles.row}>
              <AppText variant="popupRowLabel" color={COLORS.textStrong} numberOfLines={1} style={styles.label}>{it.label}</AppText>
              <View style={styles.chip}>
                <AppText variant="subtaskChipText" color={COLORS.primary}>{formatMinutes(it.minutes ?? 0)}</AppText>
              </View>
            </View>
          ))}
        </View>
        <AppText variant="totalTitle" color={COLORS.primary} style={styles.total}>
          총 {items.length}단계 ・{formatMinutes(totalMinutes)}
        </AppText>
        <Pressable style={styles.close} onPress={onClose}>
          <AppText variant="popupBtnSemi" color={COLORS.textWeak}>닫기</AppText>
        </Pressable>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: { alignSelf: 'stretch', paddingTop: 34, paddingBottom: 34, paddingHorizontal: 34 },
  title: { textAlign: 'center' },
  list: { marginTop: 22, gap: 8 },
  row: { height: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flex: 1, marginRight: 12 },
  chip: { minWidth: 60, height: 25, paddingHorizontal: 10, borderRadius: 10, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
  total: { marginTop: 20, textAlign: 'center' },
  close: { marginTop: 20, height: 51, borderRadius: 12, backgroundColor: COLORS.fillSoft, alignItems: 'center', justifyContent: 'center' },
});
