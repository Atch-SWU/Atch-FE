import { View, TextInput, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import PlusIcon from '../assets/icon/plus.svg';
import CloseIcon from '../assets/icon/close.svg';
import { COLORS, TYPOGRAPHY } from '../constants/token';

interface AmountListProps {
  items: string[];
  onChange: (items: string[]) => void;
}

/** 세부 분량 항목 추가 리스트 (AI 세부 분량 나누기 ON) */
export default function AmountList({ items, onChange }: AmountListProps) {
  const update = (i: number, v: string) => onChange(items.map((it, idx) => (idx === i ? v : it)));
  const add = () => onChange([...items, '']);
  const remove = (i: number) => onChange(items.filter((_, idx) => idx !== i));

  return (
    <View style={styles.wrap}>
      {items.map((it, i) => (
        <View key={i} style={styles.item}>
          <View style={styles.index}>
            <AppText variant="badgeLabel" color={COLORS.onAccent}>{i + 1}</AppText>
          </View>
          <TextInput
            value={it}
            onChangeText={(v) => update(i, v)}
            placeholder="세부 항목을 입력해주세요."
            placeholderTextColor={COLORS.placeholderText}
            style={[TYPOGRAPHY.formText, styles.input]}
          />
          <Pressable hitSlop={8} onPress={() => remove(i)} style={styles.remove}>
            <CloseIcon width={13} height={13} color={COLORS.placeholderText} />
          </Pressable>
        </View>
      ))}

      <Pressable style={styles.addBtn} onPress={add}>
        <PlusIcon width={16} height={16} color={COLORS.accent} />
        <AppText variant="formLabel" color={COLORS.accent} style={styles.addLabel}>항목 추가</AppText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.inputBorder,
    borderRadius: 16,
    height: 50,
    paddingHorizontal: 16,
  },
  index: {
    width: 22, height: 22, borderRadius: 11,
    backgroundColor: COLORS.accent,
    alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  input: { flex: 1, color: COLORS.textMain, paddingVertical: 0 },
  remove: { marginLeft: 8 },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 16,
    backgroundColor: COLORS.tipBg,
  },
  addLabel: { marginLeft: 6 },
});
