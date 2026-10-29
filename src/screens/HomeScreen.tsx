import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, Platform, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
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
import { RootStackParamList } from '../navigation/types';
import { formatKoreanDate, toDateString } from '../utils/date';
import { formatMinutes } from '../utils/duration';
import { useTodosByDate } from '../hooks/useTodosByDate';
import { useCurrentTimer } from '../hooks/useCurrentTimer';
import { chipText, estimateText, getErrorMessage, isStarted, progressPercent, progressText, TodoResponse } from '../api/todoApi';
import {
  cancelSwitch, confirmSwitch, getTimerSettings, pauseTimer, requestSwitch, TimerSettings,
} from '../api/timerApi';
import { getWeeklyReport, WeeklyReport } from '../api/reportApi';

/** 홈 카드 한 장에 필요한 작업 정보 */
interface HomeTask {
  id: string;
  title: string;
  /** 상위 작업명 (없을 수 있음) */
  parent?: string;
  /** 예: "예상 30분" (타이머 전달용) */
  estimateText: string;
  /** 카드 칩 문구: "예상 30분" 또는 진행한 적이 있으면 "남은 25분" */
  chipText: string;
  elapsedSec: number;
}

const toHomeTask = (t: TodoResponse): HomeTask => ({
  id: String(t.id),
  title: t.title,
  parent: t.sourceTaskName ?? undefined,
  estimateText: estimateText(t),
  chipText: chipText(t),
  elapsedSec: t.actualDurationSeconds,
});

/** 받침 유무에 따라 '로' / '으로' */
function withRo(word: string) {
  const code = word.charCodeAt(word.length - 1) - 0xac00;
  if (code < 0 || code > 11171) return `${word}로`;
  const jong = code % 28;
  return jong === 0 || jong === 8 ? `${word}로` : `${word}으로`;
}

type SwitchStage = 'none' | 'confirm' | 'ready';

/** 설정을 불러오기 전 기본값 (서버 기본값과 동일: 제한 사용, 10분) */
const DEFAULT_SETTINGS: TimerSettings = { taskSwitchRestrictionEnabled: true, taskSwitchWaitMinutes: 10 };

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const today = useMemo(() => new Date(), []);

  const { items, reload: reloadTodos } = useTodosByDate(toDateString(today));
  const { timer, reload: reloadTimer } = useCurrentTimer();
  const [settings, setSettings] = useState<TimerSettings>(DEFAULT_SETTINGS);
  const [weekly, setWeekly] = useState<WeeklyReport | null>(null);

  useFocusEffect(
    useCallback(() => {
      getTimerSettings().then(setSettings).catch(() => {});
      getWeeklyReport().then(setWeekly).catch(() => setWeekly(null));
    }, []),
  );

  const active = items.filter((t) => t.status !== 'COMPLETED');
  const runningTodo = active.find((t) => t.status === 'IN_PROGRESS');
  const tasks = active.map(toHomeTask);
  const inProgress = runningTodo ? toHomeTask(runningTodo) : undefined;
  // 일시정지(또는 완료 취소로 되돌린) 작업도 진행중 영역에 카드로 보여준다
  const pausedTodos = active.filter((t) => t.status !== 'IN_PROGRESS' && isStarted(t));
  const others = tasks.filter((t) => t.id !== inProgress?.id && !pausedTodos.some((p) => String(p.id) === t.id));
  const hasTasks = tasks.length > 0;
  const allDone = !hasTasks && items.some((t) => t.status === 'COMPLETED');
  // 진행 시간은 실행 중인 구간까지 포함한 서버 타이머 값을 우선 사용
  const runningSeconds = runningTodo
    ? timer && timer.focusTodoId === runningTodo.id ? timer.totalDurationSeconds : runningTodo.actualDurationSeconds
    : 0;

  // ===== 작업 전환 (서버: 전환 요청 → 대기 → 확정/취소) =====
  const [stage, setStage] = useState<SwitchStage>('none');
  const [target, setTarget] = useState<HomeTask | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const waitTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (waitTimer.current) clearTimeout(waitTimer.current); }, []);

  const focusId = timer && timer.state !== 'IDLE' ? timer.focusTodoId : null;
  const focusTitle = timer?.focusTodoTitle ?? inProgress?.title ?? '';
  const waitMin = settings.taskSwitchWaitMinutes;

  const startTimerFor = (t: HomeTask) => {
    const idx = tasks.findIndex((x) => x.id === t.id);
    const next = idx >= 0 ? tasks[idx + 1] : undefined;
    const toParam = (h: HomeTask) => ({ id: Number(h.id), title: h.title, estimateText: h.estimateText, elapsedSec: h.elapsedSec });
    navigation.navigate('Timer', { task: toParam(t), nextTask: next ? toParam(next) : null });
  };

  /** readyAt 이 되면 '전환할 수 있어요' 팝업을 띄운다 (서버 시각 기준으로 남은 시간 계산) */
  const scheduleReady = (switchId: string, readyAt: string, serverTime: string) => {
    setPendingId(switchId);
    if (waitTimer.current) clearTimeout(waitTimer.current);
    const delay = Date.parse(readyAt) - Date.parse(serverTime);
    if (delay <= 0) setStage('ready');
    else waitTimer.current = setTimeout(() => setStage('ready'), delay);
  };

  // 앱을 다시 열었을 때 서버에 남아 있는 전환 대기 복원
  useEffect(() => {
    const ps = timer?.pendingSwitch;
    if (!timer || !ps || ps.switchId === pendingId) return;
    const t = tasks.find((x) => x.id === String(ps.targetTodoId));
    if (!t) return;
    setTarget(t);
    scheduleReady(ps.switchId, ps.readyAt, timer.serverTime);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timer, items]);

  const closeSwitch = () => setStage('none');

  const doRequestSwitch = async (t: HomeTask) => {
    const sourceSession = timer?.sessionId ?? timer?.latestSessionId;
    if (focusId == null || sourceSession == null) {
      Alert.alert('작업을 전환하지 못했어요', '현재 진행 중인 작업 정보를 찾을 수 없어요.');
      return;
    }
    try {
      const res = await requestSwitch(focusId, Number(t.id), sourceSession);
      if (res.state === 'STARTED') {
        await reloadTimer();
        startTimerFor(t);
      } else {
        scheduleReady(res.switchId, res.readyAt, res.timer.serverTime);
      }
    } catch (e) {
      Alert.alert('작업을 전환하지 못했어요', getErrorMessage(e));
    }
  };

  const onPlayOther = (t: HomeTask) => {
    if (focusId == null || focusId === Number(t.id)) { startTimerFor(t); return; }
    setTarget(t);
    if (settings.taskSwitchRestrictionEnabled) setStage('confirm');
    else doRequestSwitch(t);
  };

  // 팝업 1) 일시 정지: 실행 중인 작업을 멈춘다
  const pauseCurrent = async () => {
    closeSwitch();
    if (timer?.state !== 'RUNNING' || timer.focusTodoId == null || timer.sessionId == null) return;
    try {
      await pauseTimer(timer.focusTodoId, timer.sessionId);
      await Promise.all([reloadTimer(), reloadTodos()]);
    } catch (e) {
      Alert.alert('일시정지하지 못했어요', getErrorMessage(e));
    }
  };

  // 팝업 1) N분 후 다른 작업으로 전환: 전환 요청을 보내고 대기
  const waitAndSwitch = () => {
    closeSwitch();
    if (target) doRequestSwitch(target);
  };

  // 팝업 2) 계속 진행하기: 대기 중인 전환 취소
  const keepCurrent = async () => {
    closeSwitch();
    if (!pendingId) return;
    try { await cancelSwitch(pendingId); } catch (e) { Alert.alert('전환을 취소하지 못했어요', getErrorMessage(e)); }
    setPendingId(null);
    reloadTimer();
  };

  // 팝업 2) 전환: 서버에 확정하고 새 작업 타이머로 이동
  const doSwitch = async () => {
    const t = target;
    closeSwitch();
    if (!t || !pendingId) return;
    try {
      await confirmSwitch(pendingId);
      setPendingId(null);
      await reloadTimer();
      startTimerFor(t);
    } catch (e) {
      Alert.alert('작업을 전환하지 못했어요', getErrorMessage(e));
    }
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
              {inProgress && runningTodo && (
                <ProgressCard
                  badgeLabel="진행중"
                  parent={inProgress.parent}
                  title={inProgress.title}
                  estimateText={`예상 소요시간 ${formatMinutes(runningTodo.estimatedDurationMinutes)}`}
                  progressText={progressText(runningTodo, runningSeconds)}
                  percent={progressPercent(runningTodo, runningSeconds)}
                  onPlay={() => startTimerFor(inProgress)}
                />
              )}
              {pausedTodos.map((p) => {
                const h = toHomeTask(p);
                return (
                  <ProgressCard
                    key={p.id}
                    badgeLabel="일시정지"
                    parent={h.parent}
                    title={h.title}
                    estimateText={`예상 소요시간 ${formatMinutes(p.estimatedDurationMinutes)}`}
                    progressText={progressText(p)}
                    percent={progressPercent(p)}
                    onPlay={() => onPlayOther(h)}
                  />
                );
              })}
              {others.map((t) => (
                <HomeTaskCard
                  key={t.id}
                  title={t.title}
                  parent={t.parent}
                  estimateText={t.chipText}
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
            weekDoneCount={weekly?.completedTodoCount ?? null}
            completionRate={weekly?.completionRate == null ? null : Math.round(weekly.completionRate * 100)}
            // 등급·아이템 보상 진행률은 서버 API가 아직 없어 '-'로 표시
            grade={null}
            rewardPercent={null}
            onPressWeekDone={() => navigation.navigate('CompletedTasks')}
          />
        </View>
      </ScrollView>

      <ActionDialog
        visible={stage === 'confirm'}
        title="다른 작업으로 바꾸시겠어요?"
        body={`‘${focusTitle}’를 아직 마무리 하지 않았어요.\n전환 대기 시간이 끝나면 바꿀 수 있어요.`}
        primaryLabel="일시 정지"
        secondaryLabel={`${waitMin}분 후 다른 작업으로 전환`}
        hint="대기 시간은 설정에서 바뀔 수 있어요."
        onPrimary={pauseCurrent}
        onSecondary={waitAndSwitch}
        onRequestClose={closeSwitch}
      />
      <ActionDialog
        visible={stage === 'ready'}
        title="이제 전환할 수 있어요"
        body={`‘${focusTitle}’를 아직 마무리 하지 않았어요.\n‘${target?.title ?? ''}’로 바꿔서 시작할까요?`}
        primaryLabel="계속 진행하기"
        secondaryLabel={`${target ? withRo(target.title) : ''} 전환`}
        hint="대기 시간은 설정에서 바뀔 수 있어요."
        onPrimary={keepCurrent}
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
