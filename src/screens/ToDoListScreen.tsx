import { useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AddButton from '../components/AddButton';
import WeekCalendar, { SelDate } from '../components/WeekCalendar';
import OverdueCard from '../components/OverdueCard';
import TaskListItem from '../components/TaskListItem';
import CompletedTaskRow from '../components/CompletedTaskRow';
import { COLORS, SPACING } from '../constants/token';
import { OVERDUE, DONE_TASKS, tasksForDate } from '../data/mockTodos';
import { RootStackParamList } from '../navigation/types';

export default function ToDoListScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [scrollLocked, setScrollLocked] = useState(false);
  const [selected, setSelected] = useState<SelDate>({ y: 2026, m: 4, day: 19 });
  const isToday = selected.y === 2026 && selected.m === 4 && selected.day === 19;
  const dayTasks = tasksForDate(selected.y, selected.m, selected.day);

  return (
    <View style={styles.root}>
      <ScrollView
        scrollEnabled={!scrollLocked}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        {/* 상단 흰 카드: 헤더 + 캘린더 (풀블리드) */}
        <View style={[styles.topCard, { paddingTop: insets.top + 28 }]}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <AppText variant="homeDate" color={COLORS.dateText}>{`${selected.m + 1}월 ${selected.day}일`}</AppText>
              <AppText variant="screenTitle" color={COLORS.textMain} style={styles.title}>To Do List</AppText>
            </View>
            <AddButton onPress={() => navigation.navigate('TaskCreate')} />
          </View>
          <View style={styles.calWrap}>
            <WeekCalendar
              selected={selected}
              onSelectDate={setSelected}
              onGrab={() => setScrollLocked(true)}
              onRelease={() => setScrollLocked(false)}
            />
          </View>
        </View>

        {/* 섹션 */}
        <View style={styles.sections}>
          <AppText variant="sectionHeader" color={COLORS.sectionLabel} style={styles.labelFirst}>마감 초과</AppText>
          <View style={styles.block}>
            <OverdueCard overLabel={OVERDUE.overLabel} title={OVERDUE.title} percent={OVERDUE.percent} time={OVERDUE.time} />
          </View>

          <AppText variant="sectionHeader" color={COLORS.sectionLabel} style={styles.label}>
            {isToday ? '오늘 할 일' : '할 일'}
          </AppText>
          <View style={styles.list}>
            {dayTasks.length > 0 ? (
              dayTasks.map((t) => (
                <TaskListItem key={t.id} statusLabel={t.statusLabel} title={t.title} time={t.time} />
              ))
            ) : (
              <AppText variant="bodySmall" color={COLORS.textSub} style={styles.empty}>
                등록된 할 일이 없어요.
              </AppText>
            )}
          </View>

          <AppText variant="sectionHeader" color={COLORS.sectionLabel} style={styles.label}>완료 작업</AppText>
          <View style={styles.list}>
            {DONE_TASKS.map((title, i) => (
              <CompletedTaskRow key={`done-${i}`} title={title} />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  topCard: {
    backgroundColor: COLORS.background,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    paddingHorizontal: SPACING.screenH,
    paddingBottom: 10,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    zIndex: 2,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  headerLeft: { flex: 1 },
  title: { marginTop: 4 },
  calWrap: { marginTop: 18 },
  sections: { paddingHorizontal: SPACING.screenH },
  labelFirst: { marginTop: 24 },
  label: { marginTop: 26 },
  block: { marginTop: 6 },
  list: { marginTop: 6, gap: 10 },
  empty: { paddingVertical: 8 },
});