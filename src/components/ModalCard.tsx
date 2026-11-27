import { ReactNode } from 'react';
import { Modal, View, StyleSheet, Platform } from 'react-native';
import { COLORS, MAX_APP_WIDTH } from '../constants/token';

interface ModalCardProps {
  visible: boolean;
  onRequestClose?: () => void;
  /** 카드 모서리 (피그마: 일반 팝업 18 / AI 로딩 24) */
  radius?: number;
  children: ReactNode;
}

/** 팝업 공통 베이스: 전체 화면 스크림 + 중앙 흰 카드 */
export default function ModalCard({
  visible,
  onRequestClose,
  radius = 18,
  children,
}: ModalCardProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onRequestClose}
    >
      <View style={styles.overlay}>
        <View style={styles.scrim} />

        <View style={[styles.card, { borderRadius: radius }]}>
          {children}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 21,
  },

  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: COLORS.scrim,
    opacity: 0.3,
  },

  card: {
    width: '100%',
    maxWidth: Platform.OS === 'web' ? MAX_APP_WIDTH - 42 : undefined,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
  },
});
