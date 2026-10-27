import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
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
import { IN_PROGRESS, DONE_TASKS, tasksForDate, DayTask } from '../data/mockTodos';
import { RootStackParamList } from '../navigation/types';

const TODAY: SelDate = { y: 2026, m: 4, day: 19 };
const WEEKDAY_KR = ['일', '월', '화', '수', '목', '금', '토'];

export default function ToDoListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scrollLocked, setScrollLocked] = useState(false);
  const [selected, setSelected] = useState<SelDate>(TODAY);
  const [removedIds, setRemovedIds] = useState<string[]>([]);
  const [deleteTarget, setDeleteTarget] = useState<DayTask | null>(null);

  const isToday = selected.y === TODAY.y && selected.m === TODAY.m && selected.day === TODAY.day;
  const dayTasks = tasksForDate(selected.y, selected.m, selected.day).filter((t) => !removedIds.includes(t.id));
  const dow = WEEKDAY_KR[new Date(selected.y, selected.m, selected.day).getDay()];

  const confirmDelete = () => {
    if (deleteTarget) setRemovedIds((prev) => [...prev, deleteTarget.id]);
    setDeleteTarget(null);
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
        {isToday ? (
          <>
            <AppText variant="todoSection" color={COLORS.textMain} style={styles.label}>진행중</AppText>
            <View style={styles.block}>
              <ProgressCard
                badgeLabel={IN_PROGRESS.badgeLabel}
                title={IN_PROGRESS.title}
                estimateText={IN_PROGRESS.estimateText}
                progressText={IN_PROGRESS.progressText}
                percent={IN_PROGRESS.percent}
                onPlay={() =>
                  navigation.navigate('Timer', {
                    task: { title: IN_PROGRESS.title, estimateText: IN_PROGRESS.estimateText },
                  })
                }
              />
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
                parent={t.parent}
                title={t.title}
                estimateText={t.estimateText}
                onDelete={() => setDeleteTarget(t)}
              />
            ))
          ) : (
            <AppText variant="bodySmall" color={COLORS.textWeak}>등록된 할 일이 없어요.</AppText>
          )}
        </View>

        {/* 완료 작업 */}
        {isToday ? (
          <>
            <AppText variant="todoSection" color={COLORS.textMain} style={styles.label}>완료 작업</AppText>
            <View style={styles.list}>
              {DONE_TASKS.map((d) => (
                <CompletedTaskRow key={d.id} title={d.title} subText={d.subText} />
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
