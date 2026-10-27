import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import Character from '../components/Character';
import SpeechBubble from '../components/SpeechBubble';
import StatTile from '../components/StatTile';
import NextTaskCard from '../components/NextTaskCard';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { formatClock } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

/** 집중시간 = 실제 − 예상 (분 단위, 반올림) */
function focusDiff(elapsedSec: number, estimateSec: number) {
  const diffMin = Math.round((elapsedSec - estimateSec) / 60);
  if (diffMin > 0) return { value: `+${diffMin}분`, hint: '예상보다 더 집중' };
  if (diffMin < 0) return { value: `${diffMin}분`, hint: '예상보다 빠르게 완료' };
  return { value: '0분', hint: '예상 시간에 딱 맞게' };
}

export default function SessionCompleteScreen({ navigation, route }: Props) {
  const { taskTitle, taskDate, elapsedSec, estimateSec, pauseCount, nextTask } = route.params;
  const goHome = () => navigation.navigate('Main');
  const focus = focusDiff(elapsedSec, estimateSec);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="todoDate" color={COLORS.textBody}>{taskDate}</AppText>
        <AppText variant="todoScreenTitle" color={COLORS.textMain} numberOfLines={1} style={styles.title}>{taskTitle}</AppText>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.hero}>
          <SpeechBubble text="포기하지 않고 완수했어요! 대단해요!" tone="done" />
          <Character size={190} style={styles.character} />
          <AppText variant="timerClockSm" color={COLORS.textMain} style={styles.time}>{formatClock(elapsedSec)}</AppText>
        </View>

        <View style={styles.statRow}>
          <StatTile flex={120} label="일시정지" value={`${pauseCount}회`} />
          <StatTile flex={228} label="집중시간" value={focus.value} hint={focus.hint} />
        </View>

        {nextTask && (
          <View style={styles.next}>
            <AppText variant="nextSectionLabel" color={COLORS.textMain}>다음 작업</AppText>
            <View style={styles.nextCard}>
              <NextTaskCard
                title={nextTask.title}
                estimateText={nextTask.estimateText}
                onPressPlay={() => navigation.replace('Timer', { task: nextTask })}
              />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.bottom}>
        <Pressable style={styles.homeBtn} onPress={goHome}>
          <AppText variant="timerBtnText" color={COLORS.textInverse}>홈으로</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.screenH },
  header: { marginTop: 30 },
  title: { marginTop: 2 },
  scroll: { flex: 1 },
  content: { paddingBottom: 16 },
  hero: { alignItems: 'center', marginTop: 26 },
  character: { marginTop: 10 },
  time: { marginTop: 10, textAlign: 'center' },
  statRow: { flexDirection: 'row', gap: 12, marginTop: 18 },
  next: { marginTop: 26 },
  nextCard: { marginTop: 10 },
  bottom: { paddingTop: 10, paddingBottom: 16 },
  homeBtn: { height: 60, borderRadius: 12, backgroundColor: COLORS.fillDark, alignItems: 'center', justifyContent: 'center' },
});
