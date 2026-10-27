import { useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ScreenHeader, { HEADER_LIFT } from '../components/ScreenHeader';
import ProgressCard from '../components/ProgressCard';
import HomeTaskCard from '../components/HomeTaskCard';
import HomeStatTiles from '../components/HomeStatTiles';
import HomeEmptyPanel from '../components/HomeEmptyPanel';
import ActionDialog from '../components/ActionDialog';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS, SPACING } from '../constants/token';
import { HOME_TASKS, HOME_IN_PROGRESS, HOME_STATS, HomeTask, completedForDate } from '../data/mockTodos';
import { RootStackParamList } from '../navigation/types';
import { formatKoreanDate } from '../utils/date';

/** 작업 전환 대기 시간 (피그마: "10분 후 다른 작업으로 전환") */
const SWITCH_WAIT_MIN = 10;

/** 받침 유무에 따라 '로' / '으로' */
function withRo(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}로`;
  const jong = code % 28;
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}

type SwitchStage = 'none' | 'confirm' | 'ready';

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = useMemo(() => new Date(), []);

  const tasks = HOME_TASKS;
  const progressInfo = HOME_IN_PROGRESS;
  const inProgress = progressInfo ? tasks.find((t) => t.id === progressInfo.taskId) : undefined;
  const others = tasks.filter((t) => t.id !== inProgress?.id);
  const hasTasks = tasks.length > 0;
  const allDone = !hasTasks && completedForDate(today.getFullYear(), today.getMonth(), today.getDate()).length > 0;

  const [stage, setStage] = useState<SwitchStage>('none');
  const [target, setTarget] = useState<HomeTask | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const startTimer = (t: HomeTask) =>
    navigation.navigate('Timer', { task: { title: t.title, estimateText: t.estimateText } });

  const onPlayOther = (t: HomeTask) => {
    if (!inProgress) { startTimer(t); return; }
    setTarget(t);
    setStage('confirm');
  };

  const waitAndSwitch = () => {
    setStage('none');
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setStage('ready'), SWITCH_WAIT_MIN * 60 * 1000);
  };

  const closeSwitch = () => { setStage('none'); setTarget(null); };
  const doSwitch = () => {
    const t = target;
    closeSwitch();
    if (t) startTimer(t);
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        date={formatKoreanDate(today)}
        title={hasTasks ? '오늘 할 일이 있어요!' : allDone ? '오늘 할 일을 끝냈어요!' : '일정을 생성해 볼까요?'}
        titleAccessory={
          hasTasks ? (
            <View style={styles.badge}>
              <AppText variant="homeCount" color={COLORS.textInverse} style={styles.badgeText}>{tasks.length}</AppText>
            </View>
          ) : allDone ? (
            <View style={styles.badge}>
              <CheckIcon width={18} height={18} color={COLORS.textInverse} />
            </View>
          ) : null
        }
        onPressAdd={() => navigation.navigate('TaskCreate')}
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 120 }]}
      >
        <View style={styles.body}>
          {hasTasks ? (
            <View style={styles.list}>
              {inProgress && progressInfo && (
                <ProgressCard
                  badgeLabel="진행중"
                  parent={inProgress.parent}
                  title={inProgress.title}
                  estimateText={progressInfo.estimateText}
                  progressText={progressInfo.progressText}
                  percent={progressInfo.percent}
                  onPlay={() => startTimer(inProgress)}
                />
              )}
              {others.map((t) => (
                <HomeTaskCard
                  key={t.id}
                  title={t.title}
                  parent={t.parent}
                  estimateText={t.estimateText}
                  onPressPlay={() => onPlayOther(t)}
                />
              ))}
            </View>
          ) : (
            <HomeEmptyPanel bubbleText={allDone ? '할 일을 모두 끝냈어요! 정말 대단해요!' : '멧치랑 같이 집중해봐요! 멧멧!'} />
          )}
        </View>

        <View style={styles.stats}>
          <HomeStatTiles
            weekDoneCount={HOME_STATS.weekDone}
            completionRate={HOME_STATS.completionRate}
            grade={HOME_STATS.grade}
            rewardPercent={HOME_STATS.rewardPercent}
            onPressWeekDone={() => navigation.navigate('CompletedTasks')}
          />
        </View>
      </ScrollView>

      <ActionDialog
        visible={stage === 'confirm'}
        title="다른 작업으로 바꾸시겠어요?"
        body={`‘${inProgress?.title ?? ''}’를 아직 마무리 하지 않았어요.\n전환 대기 시간이 끝나면 바꿀 수 있어요.`}
        primaryLabel="일시 정지"
        secondaryLabel={`${SWITCH_WAIT_MIN}분 후 다른 작업으로 전환`}
        hint="대기 시간은 설정에서 바뀔 수 있어요."
        onPrimary={closeSwitch}
        onSecondary={waitAndSwitch}
        onRequestClose={closeSwitch}
      />
      <ActionDialog
        visible={stage === 'ready'}
        title="이제 전환할 수 있어요"
        body={`‘${inProgress?.title ?? ''}’를 아직 마무리 하지 않았어요.\n‘${target?.title ?? ''}’로 바꿔서 시작할까요?`}
        primaryLabel="계속 진행하기"
        secondaryLabel={`${target ? withRo(target.title) : ''} 전환`}
        hint="대기 시간은 설정에서 바뀔 수 있어요."
        onPrimary={closeSwitch}
        onSecondary={doSwitch}
        onRequestClose={closeSwitch}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.screenH },
  badge: { width: 30, height: 30, borderRadius: 12, backgroundColor: COLORS.primary, alignItems: 'center', justifyContent: 'center' },
  badgeText: { includeFontPadding: false, textAlign: 'center', textAlignVertical: 'center', marginTop: Platform.OS === 'ios' ? 2 : 0 },
  body: { marginTop: 34 - HEADER_LIFT },
  list: { gap: 12 },
  stats: { marginTop: 20 },
});
