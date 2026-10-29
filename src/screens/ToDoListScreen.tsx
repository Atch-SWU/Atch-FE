import { useState } from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ScreenHeader, { HEADER_LIFT } from '../components/ScreenHeader';
import WeekCalendar, { SelDate } from '../components/WeekCalendar';
import ProgressCard from '../components/ProgressCard';
import TaskListItem from '../components/TaskListItem';
import CompletedTaskRow from '../components/CompletedTaskRow';
import DeleteTaskDialog from '../components/DeleteTaskDialog';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { useTodosByDate } from '../hooks/useTodosByDate';
import { useCurrentTimer } from '../hooks/useCurrentTimer';
import { chipText, deleteTodo, estimateText, focusText, isStarted, reopenTodo, getErrorMessage, isDueToday, progressPercent, progressText, TodoResponse } from '../api/todoApi';
import { toDateString } from '../utils/date';

const now = new Date();
const TODAY: SelDate = { y: now.getFullYear(), m: now.getMonth(), day: now.getDate() };
const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

export default function ToDoListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scrollLocked, setScrollLocked] = useState(false);
  const [selected, setSelected] = useState<SelDate>(TODAY);
  const [deleteTarget, setDeleteTarget] = useState<TodoResponse | null>(null);

  const isToday = selected.y === TODAY.y && selected.m === TODAY.m && selected.day === TODAY.day;
  const dateStr = toDateString(new Date(selected.y, selected.m, selected.day));
  const todayStr = toDateString(new Date(TODAY.y, TODAY.m, TODAY.day));
  const { items, setItems, loading, error, reload } = useTodosByDate(dateStr);
  const { timer } = useCurrentTimer();
  // 진행중 영역: 실행 중인 작업 + 일시정지(또는 완료 취소로 되돌린) 작업
  const startedTasks = items
    .filter((t) => t.status !== 'COMPLETED' && isStarted(t))
    .sort((a, b) => Number(b.status === 'IN_PROGRESS') - Number(a.status === 'IN_PROGRESS'));
  // 실행 중인 구간까지 포함한 서버 타이머 값을 우선 사용
  const secondsOf = (t: TodoResponse) =>
    t.status === 'IN_PROGRESS' && timer && timer.focusTodoId === t.id ? timer.totalDurationSeconds : t.actualDurationSeconds;
  const waiting = items.filter((t) => (t.status === 'PENDING' || t.status === 'PAUSED') && !isStarted(t));
  const overdueTasks = waiting.filter((t) => t.overdue);
  const dayTasks = waiting.filter((t) => !t.overdue);
  const doneTasks = items.filter((t) => t.status === 'COMPLETED');
  const dow = WEEKDAY_KR[new Date(selected.y, selected.m, selected.day).getDay()];

  // 체크를 누르면 완료 취소 → 진행했던 시간은 서버에 남아 있어 남은 시간으로 다시 목록에 올라간다
  const onReopen = async (id: number) => {
    try {
      await reopenTodo(id);
      reload();
    } catch (e) {
      Alert.alert('완료를 취소하지 못했어요', getErrorMessage(e));
    }
  };

  const confirmDelete = async () => {
    const target = deleteTarget;
    setDeleteTarget(null);
    if (!target) return;
    try {
      await deleteTodo(target.id);
      setItems((prev) => prev.filter((t) => t.id !== target.id));
    } catch (e) {
      Alert.alert('삭제하지 못했어요', getErrorMessage(e));
    }
  };

  return (
    <View style={styles.root}>
      <ScreenHeader
        date={`${selected.m + 1}월 ${selected.day}일 ${dow}요일`}
        title="To Do List"
        onPressAdd={() => navigation.navigate('TaskCreate')}
      />

      <ScrollView
        scrollEnabled={!scrollLocked}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 130 }]}
      >
        {/* 캘린더 (주간 ↔ 월간) */}
        <View style={styles.calWrap}>
          <WeekCalendar
            selected={selected}
            onSelectDate={setSelected}
            onGrab={() => setScrollLocked(true)}
            onRelease={() => setScrollLocked(false)}
          />
        </View>

        {/* 진행중 */}
        {startedTasks.length > 0 ? (
          <>
            <AppText variant="todoSection" color={COLORS.textMain} style={styles.label}>진행중</AppText>
            <View style={styles.block}>
              {startedTasks.map((t) => (
                <ProgressCard
                  key={t.id}
                  badgeLabel={isDueToday(t, todayStr) ? '오늘 마감!' : t.status === 'IN_PROGRESS' ? '진행중' : '일시정지'}
                  parent={t.sourceTaskName ?? undefined}
                  title={t.title}
                  estimateText={`예상 소요시간 ${estimateText(t).replace('예상 ', '')}`}
                  progressText={progressText(t, secondsOf(t))}
                  percent={progressPercent(t, secondsOf(t))}
                  onPlay={() =>
                    navigation.navigate('Timer', {
                      task: { id: t.id, title: t.title, estimateText: estimateText(t), elapsedSec: t.actualDurationSeconds },
                    })
                  }
                />
              ))}
            </View>
          </>
        ) : null}

        {/* 마감 초과 */}
        {overdueTasks.length > 0 ? (
          <>
            <AppText variant="todoSection" color={COLORS.textMain} style={styles.label}>마감 초과</AppText>
            <View style={styles.list}>
              {overdueTasks.map((t) => (
                <TaskListItem
                  key={t.id}
                  parent={t.sourceTaskName ?? undefined}
                  title={t.title}
                  estimateText={chipText(t)}
                  onDelete={() => setDeleteTarget(t)}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* 오늘 할 일 */}
        <AppText variant="todoSection" color={COLORS.textMain} style={styles.label}>
          {isToday ? '오늘 할 일' : '할 일'}
        </AppText>
        <View style={styles.list}>
          {dayTasks.length > 0 ? (
            dayTasks.map((t) => (
              <TaskListItem
                key={t.id}
                parent={t.sourceTaskName ?? undefined}
                title={t.title}
                estimateText={chipText(t)}
                onDelete={() => setDeleteTarget(t)}
              />
            ))
          ) : (
            <AppText variant="bodySmall" color={COLORS.textWeak}>
              {error ?? (loading ? '불러오는 중이에요.' : '등록된 할 일이 없어요.')}
            </AppText>
          )}
        </View>

        {/* 완료 작업 */}
        {doneTasks.length > 0 ? (
          <>
            <AppText variant="todoSection" color={COLORS.textMain} style={styles.label}>완료 작업</AppText>
            <View style={styles.list}>
              {doneTasks.map((d) => (
                <CompletedTaskRow key={d.id} title={d.title} subText={focusText(d)} onPressCheck={() => onReopen(d.id)} />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>

      <DeleteTaskDialog
        visible={deleteTarget !== null}
        taskTitle={deleteTarget?.title ?? ''}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  content: { paddingHorizontal: SPACING.screenH },
  calWrap: { marginTop: 30 - HEADER_LIFT },
  label: { marginTop: 30 },
  block: { marginTop: 12 },
  list: { marginTop: 12, gap: 10 },
});
