import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import ModalCard from './ModalCard';
import AppText from './AppText';
import FormField from './FormField';
import { COLORS } from '../constants/token';

interface RenameDialogProps {
  visible: boolean;
  initialText: string;
  onCancel: () => void;
  onSave: (text: string) => void;
  /** '삭제' 버튼 */
  onDelete: () => void;
}

/** 세부 분량 수정/삭제 팝업 (디자인 확정 전 임시. 소요시간 스테퍼 팝업과 같은 구조) */
export default function RenameDialog({ visible, initialText, onCancel, onSave, onDelete }: RenameDialogProps) {
  const [text, setText] = useState(initialText);
  useEffect(() => { if (visible) setText(initialText); }, [visible, initialText]);
  const canSave = text.trim().length > 0;

  return (
    <ModalCard visible={visible} onRequestClose={onCancel}>
      <View style={styles.body}>
        <AppText variant="popupTitle" color={COLORS.textMain}>세부 분량 이름</AppText>
        <View style={styles.field}>
          <FormField value={text} onChangeText={setText} placeholder="세부 분량 이름을 입력해 주세요." />
        </View>
        <View style={styles.btnRow}>
          <Pressable style={[styles.btn, { backgroundColor: COLORS.fillSoft }]} onPress={onDelete}>
            <AppText variant="popupBtnSemi" color={COLORS.textWeak}>삭제</AppText>
          </Pressable>
          <Pressable
            disabled={!canSave}
            style={[styles.btn, { backgroundColor: canSave ? COLORS.fillBlack : COLORS.fillDisabled }]}
            onPress={() => onSave(text.trim())}
          >
            <AppText variant="popupBtnSemi" color={COLORS.textInverse}>저장</AppText>
          </Pressable>
        </View>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: { alignSelf: 'stretch', alignItems: 'center', paddingTop: 30, paddingBottom: 30, paddingHorizontal: 34 },
  field: { alignSelf: 'stretch', marginTop: 22 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 24, alignSelf: 'stretch' },
  btn: { flex: 1, height: 51, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
