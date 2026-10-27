import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import Character from './Character';
import SpeechBubble from './SpeechBubble';
import { COLORS } from '../constants/token';

interface HomeEmptyPanelProps {
  bubbleText: string;
}

/** 홈 빈 상태 / 모두 완료 패널 (피그마 6:1730, 6:1776): 360x351 r24, 캐릭터 + 위쪽 꼬리 말풍선 */
export default function HomeEmptyPanel({ bubbleText }: HomeEmptyPanelProps) {
  return (
    <View style={styles.panel}>
      <Character size={210} />
      <View style={styles.bubble}>
        <SpeechBubble text={bubbleText} tail="top" />
      </View>
      <AppText variant="homeEmptyText" color={COLORS.textWeak} style={styles.text}>
        일정을 완수하고 나만의 멧치를 꾸며보세요!
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: { height: 351, borderRadius: 24, backgroundColor: COLORS.fillMuted, alignItems: 'center', paddingTop: 38 },
  bubble: { marginTop: 20 },
  text: { marginTop: 24, textAlign: 'center' },
});
