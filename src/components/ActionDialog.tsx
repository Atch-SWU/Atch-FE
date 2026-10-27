import { View, Pressable, StyleSheet } from 'react-native';
import ModalCard from './ModalCard';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface ActionDialogProps {
  visible: boolean;
  /** 제목 위 작은 문구 (예: "반복 일정 제안") */
  eyebrow?: string;
  title: string;
  body?: string;
  /** 오렌지 하이라이트 박스 */
  highlight?: { title: string; sub: string };
  primaryLabel: string;
  secondaryLabel: string;
  /** 하단 작은 안내 문구 */
  hint?: string;
  /** hint 를 눌러 동작해야 할 때 */
  onPressHint?: () => void;
  onPrimary: () => void;
  onSecondary: () => void;
  onRequestClose?: () => void;
}

/** 세로 버튼형 팝업 (피그마 6:1545 / 6:1634 / 6:5692): 360 폭 r24, padding 30, 버튼 300x51 */
export default function ActionDialog({
  visible, eyebrow, title, body, highlight, primaryLabel, secondaryLabel, hint, onPressHint,
  onPrimary, onSecondary, onRequestClose,
}: ActionDialogProps) {
  return (
    <ModalCard visible={visible} radius={24} onRequestClose={onRequestClose}>
      <View style={styles.body}>
        {eyebrow ? <AppText variant="dialogEyebrow" color={COLORS.textWeak} style={styles.center}>{eyebrow}</AppText> : null}
        <AppText variant="popupTitle" color={COLORS.textMain} style={[styles.center, eyebrow ? styles.titleGap : null]}>{title}</AppText>
        {body ? <AppText variant="popupBody" color={COLORS.textWeak} style={[styles.center, styles.bodyGap]}>{body}</AppText> : null}
        {highlight ? (
          <View style={styles.highlight}>
            <AppText variant="dialogHighlight" color={COLORS.primary}>{highlight.title}</AppText>
            <AppText variant="dialogHighlightSub" color={COLORS.textSub} style={styles.highlightSub}>{highlight.sub}</AppText>
          </View>
        ) : null}
        <Pressable style={[styles.btn, styles.primary]} onPress={onPrimary}>
          <AppText variant="popupBtn" color={COLORS.textInverse}>{primaryLabel}</AppText>
        </Pressable>
        <Pressable style={[styles.btn, styles.secondary]} onPress={onSecondary}>
          <AppText variant="popupBtnSemi" color={COLORS.textWeak}>{secondaryLabel}</AppText>
        </Pressable>
        {hint ? (
          <Pressable disabled={!onPressHint} onPress={onPressHint} hitSlop={8}>
            <AppText variant="dialogHint" color={COLORS.textPlaceholder} style={[styles.center, styles.hint]}>{hint}</AppText>
          </Pressable>
        ) : null}
      </View>
    </ModalCard>
  );
}

const styles = StyleSheet.create({
  body: { alignSelf: 'stretch', paddingHorizontal: 30, paddingTop: 30, paddingBottom: 24 },
  center: { textAlign: 'center' },
  titleGap: { marginTop: 6 },
  bodyGap: { marginTop: 10 },
  highlight: { marginTop: 24, borderRadius: 16, backgroundColor: COLORS.primaryTint, paddingVertical: 18, paddingHorizontal: 20 },
  highlightSub: { marginTop: 6 },
  btn: { height: 51, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  primary: { marginTop: 24, backgroundColor: COLORS.fillBlack },
  secondary: { marginTop: 12, backgroundColor: COLORS.fillSoft },
  hint: { marginTop: 14 },
});
