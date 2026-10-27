import { View, StyleSheet } from 'react-native';
import ModalCard from './ModalCard';
import AppText from './AppText';
import Character from './Character';
import { COLORS } from '../constants/token';

interface AiLoadingDialogProps {
  visible: boolean;
}

/** AI 세부 단계 나누기 로딩 팝업 (피그마 6:5320): 360x316 r24, 멧취 이미지 210x175 */
export default function AiLoadingDialog({ visible }: AiLoadingDialogProps) {
  return (
    <ModalCard visible={visible} radius={24}>
      <View style={styles.body}>
        <Character size={175} />
        <AppText variant="popupTitle" color={COLORS.textMain} style={styles.title}>세부 단계를 나누는 중이에요...</AppText>
        <AppText variant="popupSub" color={COLORS.textWeak} style={styles.sub}>완료 후 언제든지 편집할 수 있어요!</AppText>
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: { alignSelf: 'stretch', alignItems: 'center', paddingVertical: 30 },
  title: { marginTop: 14, textAlign: 'center' },
  sub: { marginTop: 8, textAlign: 'center' },
});
