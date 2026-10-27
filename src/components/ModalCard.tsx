import { ReactNode } from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import { COLORS } from '../constants/token';

interface ModalCardProps {
  visible: boolean;
  onRequestClose?: () => void;
  /** 카드 모서리 (피그마: 일반 팝업 18 / AI 로딩 24) */
  radius?: number;
  children: ReactNode;
}

/** 팝업 공통 베이스: 스크림 + 중앙 흰 카드 (360 폭 기준, 좌우 21 마진) */
export default function ModalCard({ visible, onRequestClose, radius = 18, children }: ModalCardProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onRequestClose}>
      <View style={styles.overlay}>
        <View style={styles.scrim} />
        <View style={[styles.card, { borderRadius: radius }]}>{children}</View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 21 },
  scrim: { ...StyleSheet.absoluteFill, backgroundColor: COLORS.scrim, opacity: 0.3 },
  card: { alignSelf: 'stretch', backgroundColor: COLORS.surface, alignItems: 'center' },
});
