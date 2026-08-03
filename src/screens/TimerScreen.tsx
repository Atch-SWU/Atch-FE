import { useEffect, useMemo, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import CloseButton from '../components/CloseButton';
import EstimateCard from '../components/EstimateCard';
import PauseDialog from '../components/PauseDialog';
import ExtendDialog from '../components/ExtendDialog';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { TODOS } from '../data/mockTodos';

const EXTEND_COUNTDOWN = 10;

function parseEstimateSeconds(text: string): number {
  const min = text.match(/(\d+)\s*분/);
  const sec = text.match(/(\d+)\s*초/);
  let total = 0;
  if (min) total += parseInt(min[1], 10) * 60;
  if (sec) total += parseInt(sec[1], 10);
  return total > 0 ? total : 25 * 60;
}
function formatClock(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${String(m).padStart(2, '0')} : ${String(sec).padStart(2, '0')}`;
}
function formatElapsed(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return m > 0 ? `${m}분 ${sec}초` : `${sec}초`;
}

type Props = NativeStackScreenProps<RootStackParamList, 'Timer'>;
type Status = 'idle' | 'running' | 'overtime';

export default function TimerScreen({ navigation, route }: Props) {
  const { task } = route.params;
  const totalSeconds = useMemo(() => parseEstimateSeconds(task.estimateText), [task.estimateText]);

  const [status, setStatus] = useState<Status>('idle');
  const [remaining, setRemaining] = useState(totalSeconds);
  const [overtimeSec, setOvertimeSec] = useState(0);
  const [hasExtended, setHasExtended] = useState(false);
  const [pauseVisible, setPauseVisible] = useState(false);
  const [pauseCount, setPauseCount] = useState(0);
  const [pausedFrom, setPausedFrom] = useState<'running' | 'overtime' | null>(null);
  const [extendVisible, setExtendVisible] = useState(false);
  const [extendCountdown, setExtendCountdown] = useState(EXTEND_COUNTDOWN);
  const [extendMode, setExtendMode] = useState<'initial' | 'resume'>('initial');

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
  const timeText = hasExtended ? `+ ${formatClock(overtimeSec)}` : formatClock(remaining);
  const timeColor = hasExtended ? COLORS.overtime : COLORS.timerText;
  const extendTitle =
    extendMode === 'resume'
      ? `${formatElapsed(overtimeSec)} 연장됐어요!\n작업을 더 연장할까요?`
      : '시간을 연장할까요?';

  const nextTask = useMemo(() => {
    const idx = TODOS.findIndex((t) => t.title === task.title);
    const n = idx >= 0 ? TODOS[idx + 1] : undefined;
    return n ? { title: n.title, category: n.category, estimateText: n.estimateText } : null;
  }, [task.title]);

  const goComplete = () =>
    navigation.replace('SessionComplete', {
      taskTitle: task.title,
      taskDate: '5월 19일',
      elapsedText: formatElapsed(elapsed),
      pauseCount,
      overText: overtimeSec > 0 ? `+${formatElapsed(overtimeSec)}` : '없음',
      nextTask,
    });

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

  const onStart = () => {
    if (pausedFrom === 'overtime') {
      // 초과 상태에서 재개 → 이어서 연장 확인 팝업 (민트 유지)
      setExtendMode('resume');
      setExtendVisible(true);
      setExtendCountdown(EXTEND_COUNTDOWN);
    } else {
      setStatus('running');
      setPausedFrom(null);
    }
  };
  const onPausePress = () => {
    setPausedFrom(status === 'overtime' ? 'overtime' : 'running');
    setPauseVisible(true);
  };
  const onPauseConfirm = () => {
    setPauseVisible(false);
    setStatus('idle');
    setPauseCount((c) => c + 1);
  };

  const running = status === 'running' || status === 'overtime';

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <AppText variant="homeDate" color={COLORS.dateText}>5월 19일</AppText>
          <AppText variant="homeHeadline" color={COLORS.textMain} style={styles.taskTitle}>{task.title}</AppText>
        </View>
        <CloseButton onPress={() => navigation.goBack()} />
      </View>

      <View style={styles.spacer} />

      <AppText variant="timerTime" color={timeColor} style={styles.time}>{timeText}</AppText>

      <View style={styles.bottom}>
        <EstimateCard
          category={task.category}
          estimateLabel={estimateLabel}
          elapsedLabel={formatElapsed(elapsed) + ' 소요'}
          progress={progress}
        />
        <AppButton label="작업 정보 표시하기" variant="soft" style={styles.infoBtn} />
        {running ? (
          <View style={styles.actionRow}>
            <AppButton label="일시 정지" variant="secondary" style={styles.actionFlex} onPress={onPausePress} />
            <AppButton label="완료" variant="primary" style={styles.actionFlex} onPress={goComplete} />
          </View>
        ) : (
          <AppButton label="시작" variant="primary" style={styles.actionBtn} onPress={onStart} />
        )}
      </View>

      <PauseDialog
        visible={pauseVisible}
        onCancel={() => setPauseVisible(false)}
        onConfirm={onPauseConfirm}
      />
      <ExtendDialog
        visible={extendVisible}
        countdown={extendCountdown}
        title={extendTitle}
        onCancel={cancelExtend}
        onConfirm={confirmExtend}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.screenH },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 24 },
  headerText: { flex: 1 },
  taskTitle: { marginTop: 6 },
  spacer: { flex: 1 },
  time: { textAlign: 'center', marginBottom: 24 },
  bottom: { paddingBottom: 8 },
  infoBtn: { marginTop: 11 },
  actionBtn: { marginTop: 11 },
  actionRow: { flexDirection: 'row', gap: 11, marginTop: 11 },
  actionFlex: { flex: 1 },
});
