import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';
import { formatMinutes } from '../utils/duration';

export interface Subtask {
  id: string;
  label: string;
  /** null = 아직 시간 미입력 */
  minutes: number | null;
}

interface SubtaskListProps {
  items: Subtask[];
  onPressChip: (id: string) => void;
}

/** AI 세부 분량 리스트 (피그마 6:4523): 흰 카드 r14, 행 25h / 간격 11, 우측 '시간 입력' 칩 */
export default function SubtaskList({ items, onPressChip }: SubtaskListProps) {
  return (
    <View style={styles.card}>
      {items.map((it) => (
        <View key={it.id} style={styles.row}>
          <AppText variant="subtaskLabel" color={COLORS.textStrong} numberOfLines={1} style={styles.label}>{it.label}</AppText>
          <Pressable style={styles.chip} onPress={() => onPressChip(it.id)}>
            <AppText variant="subtaskChipText" color={COLORS.primary}>
              {it.minutes == null ? '시간 입력' : formatMinutes(it.minutes)}
            </AppText>
          </Pressable>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: COLORS.surface, borderRadius: 14, paddingVertical: 20, paddingHorizontal: 21, gap: 11 },
  row: { height: 25, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  label: { flex: 1, marginRight: 12 },
  chip: { minWidth: 60, height: 25, paddingHorizontal: 10, borderRadius: 10, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
});
