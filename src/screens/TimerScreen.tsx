import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Pressable, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import CloseButton from '../components/CloseButton';
import Character from '../components/Character';
import SpeechBubble from '../components/SpeechBubble';
import TimerProgressCard from '../components/TimerProgressCard';
import PauseDialog from '../components/PauseDialog';
import ExtendDialog from '../components/ExtendDialog';
import TaskInfoDialog from '../components/TaskInfoDialog';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { completeTodo, getErrorMessage } from '../api/todoApi';
import {
  fetchLatestSessionId, getCompletionSummary, getCurrentTimer, pauseTimer, resumeTimer, startTimer, TimerState,
} from '../api/timerApi';
import { formatMinutes } from '../utils/duration';
import { formatClock, formatKoreanDate, formatKoreanTime } from '../utils/date';

const EXTEND_COUNTDOWN = 10;
const MSG_READY = '멧치는 준비됐어요! 시작해볼까요?';
const MSG_FOCUS = '멧치랑 같이 집중해봐요! 멧멧!';

function parseEstimateSeconds(text: string): number {
  const min = text.match(/(\d+)\s*분/);
  const sec = text.match(/(\d+)\s*초/);
  let total = 0;
  if (min) total += parseInt(min[1], 10) * 60;
  if (sec) total += parseInt(sec[1], 10);
  return total > 0 ? total : 25 * 60;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;
type Status = 'idle' | 'running' | 'overtime';

export default function TimerScreen({ navigation, route }: Props) {
  const { task, nextTask = null } = route.params;
  const totalSeconds = useMemo(() => parseEstimateSeconds(task.estimateText), [task.estimateText]);
  const today = useMemo(() => new Date(), []);

  const [status, setStatus] = useState<Status>('idle');
  const [remaining, setRemaining] = useState(Math.max(0, totalSeconds - (task.elapsedSec ?? 0)));
  const [overtimeSec, setOvertimeSec] = useState(0);
  const [hasExtended, setHasExtended] = useState(false);
  const [pauseVisible, setPauseVisible] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [pausedFrom, setPausedFrom] = useState<'running' | 'overtime' | null>(null);
  const [extendVisible, setExtendVisible] = useState(false);
  const [extendCountdown, setExtendCountdown] = useState(EXTEND_COUNTDOWN);
  const [extendMode, setExtendMode] = useState<'initial' | 'resume'>('initial');
  const [infoVisible, setInfoVisible] = useState(false);
  const [startedAt, setStartedAt] = useState<Date | null>(null);
  const [busy, setBusy] = useState(false);
  // 서버 기준 세션 정보 (일시정지는 실행 중 sessionId, 시작/재개는 latestSessionId 를 사용)
  const sessionRef = useRef<number | null>(null);
  const latestRef = useRef<number | null>(null);
  const serverPausedRef = useRef(false);

  /** 서버의 타이머 상태를 화면 상태에 반영 */
  const applyServer = (t: TimerState, mode: 'run' | 'pause') => {
    sessionRef.current = t.sessionId;
    latestRef.current = t.latestSessionId;
    serverPausedRef.current = mode === 'pause';
    if (t.sessionStartedAt) setStartedAt((prev) => prev ?? new Date(t.sessionStartedAt as string));
    const overrun = t.estimateOverrunSeconds > 0;
    setRemaining(t.remainingEstimatedSeconds);
    setOvertimeSec(t.estimateOverrunSeconds);
    setHasExtended(overrun);
    if (mode === 'run') {
      setPausedFrom(null);
      setStatus(overrun ? 'overtime' : 'running');
    } else {
      setStatus('idle');
      setPausedFrom(overrun ? 'overtime' : 'running');
    }
  };

  // 화면 진입 시 서버 타이머 복원 (이미 실행/일시정지 중인 작업이면 이어서 표시)
  useEffect(() => {
    if (task.id == null) return;
    let alive = true;
    getCurrentTimer()
      .then((t) => {
        if (!alive || t.focusTodoId !== task.id) return;
        if (t.state === 'RUNNING') applyServer(t, 'run');
        else if (t.state === 'PAUSED') applyServer(t, 'pause');
      })
      .catch(() => {});
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [task.id]);

  // 남은 시간 카운트다운
  useEffect(() => {
    if (status !== 'running') return;
    const id = setInterval(() => setRemaining((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [status]);

  // 0초 도달 → 최초 연장 팝업
  useEffect(() => {
    if (status === 'running' && remaining === 0) {
      setExtendMode('initial');
      setExtendVisible(true);
      setExtendCountdown(EXTEND_COUNTDOWN);
    }
  }, [status, remaining]);

  // 연장 팝업 카운트다운
  useEffect(() => {
    if (!extendVisible) return;
    const id = setInterval(() => setExtendCountdown((c) => Math.max(0, c - 1)), 1000);
    return () => clearInterval(id);
  }, [extendVisible]);

  // 초과 카운트업
  useEffect(() => {
    if (status !== 'overtime') return;
    const id = setInterval(() => setOvertimeSec((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  const elapsed = totalSeconds - remaining + overtimeSec;
  const progress = hasExtended ? 1 : totalSeconds > 0 ? (totalSeconds - remaining) / totalSeconds : 0;
  const estimateLabel = task.estimateText.replace('예상 ', '');
  const timeText = hasExtended ? `+${formatClock(overtimeSec)}` : formatClock(remaining);
  const timeColor = hasExtended ? COLORS.primary : COLORS.textMain;
  const extendTitle =
    extendMode === 'resume'
      ? `${Math.floor(overtimeSec / 60)}분 ${overtimeSec % 60}초 연장됐어요!\n작업을 더 연장할까요?`
      : '시간을 연장할까요?';

  const [completing, setCompleting] = useState(false);

  const goComplete = async () => {
    if (completing) return;
    setCompleting(true);
    let params = {
      taskTitle: task.title,
      taskDate: formatKoreanDate(today),
      elapsedSec: elapsed,
      estimateSec: totalSeconds,
      pauseCount,
      nextTask,
    };
    if (task.id != null) {
      try {
        await completeTodo(task.id);
      } catch (e) {
        setCompleting(false);
        Alert.alert('작업을 완료하지 못했어요', getErrorMessage(e));
        return;
      }
      // 완료 결과(집중시간·일시정지 횟수·다음 작업 후보)는 서버 값을 우선 사용
      try {
        const sum = await getCompletionSummary(task.id);
        const n = sum.nextTodos[0];
        params = {
          ...params,
          elapsedSec: sum.todo.actualDurationSeconds,
          estimateSec: sum.todo.estimatedDurationMinutes * 60,
          pauseCount: sum.pauseCount,
          nextTask: n ? { id: n.id, title: n.title, estimateText: `예상 ${formatMinutes(n.estimatedDurationMinutes)}` } : null,
        };
      } catch {
        // 요약 조회에 실패해도 완료는 끝났으므로 화면에 있던 값으로 이어간다
      }
    }
    navigation.replace('SessionComplete', params);
  };

  const confirmExtend = () => {
    setExtendVisible(false);
    setStatus('overtime');
    setHasExtended(true);
    setPausedFrom(null);
  };
  const cancelExtend = () => { setExtendVisible(false); goComplete(); };

  // 자동 연장
  useEffect(() => {
    if (extendVisible && extendCountdown === 0) confirmExtend();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [extendVisible, extendCountdown]);

  const onStart = async () => {
    if (busy) return;
    const wasOvertime = pausedFrom === 'overtime';
    if (task.id != null) {
      setBusy(true);
      try {
        const res =
          serverPausedRef.current && latestRef.current != null
            ? await resumeTimer(task.id, latestRef.current)
            : await startTimer(task.id, await fetchLatestSessionId(task.id));
        applyServer(res, 'run');
      } catch (e) {
        Alert.alert('타이머를 시작하지 못했어요', getErrorMessage(e));
        return;
      } finally {
        setBusy(false);
      }
    } else {
      setStatus('running');
      setPausedFrom(null);
    }
    if (!startedAt) setStartedAt(new Date());
    if (wasOvertime) {
      // 초과 상태에서 재개 → 이어서 연장 확인 팝업
      setExtendMode('resume');
      setExtendVisible(true);
      setExtendCountdown(EXTEND_COUNTDOWN);
    }
  };
  const onPausePress = () => {
    setPausedFrom(status === 'overtime' ? 'overtime' : 'running');
    setPauseVisible(true);
  };
  const onPauseConfirm = async () => {
    setPauseVisible(false);
    if (task.id != null && sessionRef.current != null) {
      try {
        applyServer(await pauseTimer(task.id, sessionRef.current), 'pause');
      } catch (e) {
        Alert.alert('일시정지하지 못했어요', getErrorMessage(e));
        return;
      }
    } else {
      setStatus('idle');
    }
    setPauseCount((c) => c + 1);
  };

  const running = status === 'running' || status === 'overtime';
  const start = startedAt ?? new Date();
  const end = new Date(start.getTime() + totalSeconds * 1000);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <AppText variant="todoDate" color={COLORS.textBody}>{formatKoreanDate(today)}</AppText>
        <AppText variant="todoScreenTitle" color={COLORS.textMain} numberOfLines={1} style={styles.title}>{task.title}</AppText>
        <CloseButton variant="circle" style={styles.close} onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.middle}>
        <SpeechBubble text={running ? MSG_FOCUS : MSG_READY} />
        <Character size={256} style={styles.character} />
        <AppText variant="timerClock" color={timeColor} style={styles.time}>{timeText}</AppText>
      </View>

      <View style={styles.bottom}>
        <TimerProgressCard estimateLabel={estimateLabel} progress={progress} onPressInfo={() => setInfoVisible(true)} />
        {running ? (
          <View style={styles.actionRow}>
            <Pressable style={[styles.actionBtn, { backgroundColor: COLORS.fillMuted }]} onPress={onPausePress}>
              <View style={styles.pauseIcon}>
                <View style={styles.pauseBar} />
                <View style={styles.pauseBar} />
              </View>
              <AppText variant="timerBtnText" color={COLORS.textWeak}>일시 정지</AppText>
            </Pressable>
            <Pressable style={[styles.actionBtn, { backgroundColor: COLORS.fillDark }]} onPress={goComplete}>
              <AppText variant="timerBtnText" color={COLORS.textInverse}>완료</AppText>
            </Pressable>
          </View>
        ) : (
          <Pressable style={[styles.startBtn, { backgroundColor: COLORS.primary }]} onPress={onStart}>
            <AppText variant="timerStartText" color={COLORS.textInverse}>시작하기</AppText>
          </Pressable>
        )}
      </View>

      <PauseDialog visible={pauseVisible} onCancel={() => setPauseVisible(false)} onConfirm={onPauseConfirm} />
      <ExtendDialog
        visible={extendVisible}
        countdown={extendCountdown}
        title={extendTitle}
        onCancel={cancelExtend}
        onConfirm={confirmExtend}
      />
      <TaskInfoDialog
        visible={infoVisible}
        startText={formatKoreanTime(start)}
        endText={formatKoreanTime(end)}
        memo={task.memo?.trim() ? task.memo : '-'}
        onClose={() => setInfoVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.screenH },
  header: { marginTop: 30 },
  title: { marginTop: 2, marginRight: 50 },
  close: { position: 'absolute', right: 0, top: 12 },
  middle: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  character: { marginTop: 8 },
  time: { marginTop: 8, textAlign: 'center' },
  bottom: { paddingBottom: 16 },
  actionRow: { flexDirection: 'row', gap: 8, marginTop: 45 },
  actionBtn: { flex: 1, height: 60, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  startBtn: { marginTop: 45, height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  pauseIcon: { flexDirection: 'row', gap: 4 },
  pauseBar: { width: 3, height: 12, borderRadius: 5, backgroundColor: COLORS.iconWeak },
});
