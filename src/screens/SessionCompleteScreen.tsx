import { View, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import CloseButton from '../components/CloseButton';
import Character from '../components/Character';
import StatCard from '../components/StatCard';
import TodoCard from '../components/TodoCard';
import { COLORS, COMPLETION_COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SessionComplete'>;

export default function SessionCompleteScreen({ navigation, route }: Props) {
  const { taskTitle, taskDate, elapsedText, pauseCount, overText, nextTask } = route.params;
  const goHome = () => navigation.navigate('Main');

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="homeDate" color={COLORS.accent}>5월 19일</AppText>
          <AppText variant="homeHeadline" color={COLORS.textMain} style={styles.hTitle}>세션 완료!</AppText>
        </View>
        <CloseButton onPress={goHome} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.charWrap}>
          <Character size={190} />
          <AppText variant="completionTime" color={COLORS.textMain} style={styles.time}>{elapsedText}</AppText>
          <AppText variant="completionSub" color={COLORS.completionSubtitle} style={styles.sub}>
            소요됐어요! 고생 많았어요!
          </AppText>
        </View>

        <View style={[styles.doneCard, { backgroundColor: COMPLETION_COLORS.doneCardBg, borderColor: COMPLETION_COLORS.doneCardBorder }]}>
          <AppText variant="doneTaskDate" color={COMPLETION_COLORS.doneDate}>{taskDate}</AppText>
          <AppText variant="doneTaskTitle" color={COMPLETION_COLORS.doneTitle} style={styles.doneTitle}>{taskTitle}</AppText>
        </View>

        <View style={styles.statRow}>
          <StatCard
            value={`${pauseCount}회`} valueVariant="statValueBold" valueColor={COMPLETION_COLORS.statPauseValue}
            caption="일시 정지" captionColor={COMPLETION_COLORS.statPauseCaption}
            bgColor={COMPLETION_COLORS.statPauseBg} borderColor={COMPLETION_COLORS.statPauseBorder}
          />
          <StatCard
            value={overText} valueVariant="statValueSemi" valueColor={COMPLETION_COLORS.statOverValue}
            caption="초과" captionColor={COMPLETION_COLORS.statOverCaption}
            bgColor={COMPLETION_COLORS.statOverBg} borderColor={COMPLETION_COLORS.statOverBorder}
          />
        </View>

        {nextTask && (
          <View>
            <View style={styles.nextLabelRow}>
              <View style={styles.dot} />
              <AppText variant="nextTaskLabel" color={COLORS.textMain}>다음 작업</AppText>
            </View>
            <TodoCard
              title={nextTask.title}
              category={nextTask.category}
              estimateText={nextTask.estimateText}
              onPressAction={() => navigation.replace('Timer', { task: nextTask })}
            />
          </View>
        )}
      </ScrollView>

      {/* 하단 고정: 홈으로 돌아가기 (엄지 존) */}
      <View style={styles.bottomBar}>
        <AppButton label="홈으로 돌아가기" variant="soft" onPress={goHome} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.screenH },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24 },
  headerText: { flex: 1 },
  hTitle: { marginTop: 6 },
  scroll: { flex: 1 },
  content: { paddingBottom: 16 },
  charWrap: { alignItems: 'center', marginTop: 10 },
  time: { marginTop: 12 },
  sub: { marginTop: 8 },
  doneCard: { borderRadius: SPACING.cardRadius, borderWidth: 1, paddingHorizontal: 23, paddingVertical: 15, marginTop: 20 },
  doneTitle: { marginTop: 5 },
  statRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  nextLabelRow: { flexDirection: 'row', alignItems: 'center', marginTop: 24, marginBottom: 12 },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.nextDot, marginRight: 9 },
  bottomBar: { paddingTop: 10, paddingBottom: 4 },
});
