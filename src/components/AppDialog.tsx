import { Modal, View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface AppDialogProps {
  visible: boolean;
  /** 상단 '!' 아이콘 (기본 숨김) */
  icon?: boolean;
  title: string;
  /** 본문 첫 줄(강조, 예: "“래퍼런스 3개 모으기”") */
  subject?: string;
  body?: string;
  cancelLabel: string;
  confirmLabel: string;
  /** 확인 버튼 톤: dark(검정, 기본) / primary(브랜드 오렌지) */
  confirmTone?: 'dark' | 'primary';
  onCancel: () => void;
  onConfirm: () => void;
}

/** 앱 공통 팝업 (피그마 6:4207: 360x213, r24, 버튼 2개 140x51) */
export default function AppDialog({
  visible, icon = false, title, subject, body, cancelLabel, confirmLabel,
  confirmTone = 'dark', onCancel, onConfirm,
}: AppDialogProps) {
  const confirmBg = confirmTone === 'primary' ? COLORS.primary : COLORS.fillBlack;
  const confirmText = confirmTone === 'primary' ? COLORS.textInverse : COLORS.textInverse;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.overlay}>
        <View style={styles.scrim} />
        <View style={styles.card}>
          {icon && (
            <View style={styles.icon}>
              <AppText variant="statValueBold" color={COLORS.primary}>!</AppText>
            </View>
          )}
          <AppText variant="popupTitle" color={COLORS.textMain} style={styles.title}>{title}</AppText>
          {subject || body ? (
            <View style={styles.bodyWrap}>
              {subject ? <AppText variant="popupBody" color={COLORS.textSub} style={styles.center}>{subject}</AppText> : null}
              {body ? <AppText variant="popupBody" color={COLORS.textWeak} style={styles.center}>{body}</AppText> : null}
            </View>
          ) : null}
          <View style={styles.row}>
            <Pressable style={[styles.btn, { backgroundColor: COLORS.fillSoft }]} onPress={onCancel}>
              <AppText variant="popupBtn" color={COLORS.textWeak}>{cancelLabel}</AppText>
            </Pressable>
            <Pressable style={[styles.btn, { backgroundColor: confirmBg }]} onPress={onConfirm}>
              <AppText variant="popupBtn" color={confirmText}>{confirmLabel}</AppText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 21 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.scrim, opacity: 0.3 },
  card: {
    alignSelf: 'stretch', borderRadius: 24, backgroundColor: COLORS.surface,
    alignItems: 'center', paddingHorizontal: 34, paddingTop: 32, paddingBottom: 30,
  },
  icon: {
    width: 57, height: 57, borderRadius: 28.5, marginBottom: 19,
    backgroundColor: COLORS.primarySoft, alignItems: 'center', justifyContent: 'center',
  },
  title: { textAlign: 'center' },
  bodyWrap: { marginTop: 8 },
  center: { textAlign: 'center' },
  row: { flexDirection: 'row', gap: 12, marginTop: 19, alignSelf: 'stretch' },
  btn: { flex: 1, height: 51, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
});
