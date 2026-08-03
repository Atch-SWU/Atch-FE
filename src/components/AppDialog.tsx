import { Modal, View, StyleSheet } from 'react-native';
import AppText from './AppText';
import AppButton from './AppButton';
import { COLORS } from '../constants/token';

interface AppDialogProps {
  visible: boolean;
  icon?: boolean;       // 상단 '!' 아이콘 (기본 표시)
  title: string;
  body?: string;
  cancelLabel: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
}

/** 앱 공통 팝업 (아이콘 · 제목 · 본문 · 취소/확인 2버튼) */
export default function AppDialog({
  visible, icon = true, title, body, cancelLabel, confirmLabel, onCancel, onConfirm,
}: AppDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.scrim} />
        <View style={styles.card}>
          {icon && (
            <View style={styles.icon}>
              <AppText variant="statValueBold" color={COLORS.dialogIconMark}>!</AppText>
            </View>
          )}
          <AppText variant="dialogTitle" color={COLORS.textMain} style={[styles.title, icon && styles.titleGap]}>
            {title}
          </AppText>
          {body ? (
            <AppText variant="dialogBody" color={COLORS.textSub} style={styles.body}>{body}</AppText>
          ) : null}
          <View style={styles.row}>
            <AppButton label={cancelLabel} variant="secondary" textVariant="subtleBtn" style={styles.btn} onPress={onCancel} />
            <AppButton label={confirmLabel} variant="primary" textVariant="subtleBtn" style={styles.btn} onPress={onConfirm} />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: COLORS.scrim, opacity: 0.6 },
  card: {
    width: 320, borderRadius: 30, backgroundColor: COLORS.dialogCardBg,
    alignItems: 'center', paddingHorizontal: 29, paddingTop: 26, paddingBottom: 26,
  },
  icon: {
    width: 57, height: 57, borderRadius: 28.5,
    backgroundColor: COLORS.dialogIconBg, alignItems: 'center', justifyContent: 'center',
  },
  title: { textAlign: 'center' },
  titleGap: { marginTop: 19 },
  body: { marginTop: 8, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 16, marginTop: 19, alignSelf: 'stretch' },
  btn: { flex: 1, height: 50, borderRadius: 16 },
});
