import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface SpeechBubbleProps {
  text: string;
  /** 강조(완료) 톤: 오렌지 텍스트 */
  tone?: 'default' | 'done';
  /** 꼬리 위치: 아래(기본) / 위 (홈 빈 상태 패널) */
  tail?: 'bottom' | 'top';
}

/** 멧치 말풍선 (피그마: h36 r8 흰 배경, 하단 중앙 꼬리) */
export default function SpeechBubble({ text, tone = 'default', tail = 'bottom' }: SpeechBubbleProps) {
  return (
    <View style={styles.wrap}>
      {tail === 'top' && <View style={[styles.tail, styles.tailTop]} />}
      <View style={styles.bubble}>
        <AppText variant="bubbleText" color={tone === 'done' ? COLORS.primary : COLORS.textStrong}>{text}</AppText>
      </View>
      {tail === 'bottom' && <View style={styles.tail} />}
    </View>
  );
}

const styles = StyleSheet.create({
  tailTop: { borderTopWidth: 0, borderBottomWidth: 9, borderTopColor: COLORS.transparent, borderBottomColor: COLORS.surface },
  wrap: { alignItems: 'center' },
  bubble: { height: 36, borderRadius: 8, paddingHorizontal: 15, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center' },
  tail: {
    width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 9,
    borderLeftColor: COLORS.transparent, borderRightColor: COLORS.transparent, borderTopColor: COLORS.surface,
  },
});
