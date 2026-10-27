import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import WeekCalendar, { SelDate } from '../components/WeekCalendar';
import CompletedTaskRow from '../components/CompletedTaskRow';
import Character from '../components/Character';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import { COLORS, SPACING } from '../constants/token';
import { completedForDate } from '../data/mockTodos';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'CompletedTasks'>;

/** 완료작업 목록 (피그마 6:8360 / 6:8422): 주간↔월간 캘린더 + 완료 리스트 / 빈 상태 */
export default function CompletedTasksScreen({ navigation }: Props) {
  const [scrollLocked, setScrollLocked] = useState(false);
  const [selected, setSelected] = useState<SelDate>({ y: 2026, m: 4, day: 19 });
  const items = completedForDate(selected.y, selected.m, selected.day);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.back} hitSlop={10} onPress={() => navigation.goBack()}>
          <ChevronLeft width={20} height={20} color={COLORS.textBody} />
        </Pressable>
        <AppText variant="formHeaderTitle" color={COLORS.textMain} style={styles.title}>완료작업 목록</AppText>
        <View style={styles.spacer} />
      </View>

      <ScrollView scrollEnabled={!scrollLocked} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <WeekCalendar
          selected={selected}
          onSelectDate={setSelected}
          onGrab={() => setScrollLocked(true)}
          onRelease={() => setScrollLocked(false)}
        />

        {items.length > 0 ? (
          <View style={styles.list}>
            {items.map((it) => (
              <CompletedTaskRow key={it.id} title={it.title} subText={it.subText} />
            ))}
          </View>
        ) : (
          <View style={styles.empty}>
            <Character size={170} style={styles.faded} />
            <AppText variant="emptyListText" color={COLORS.textDisabled} style={styles.emptyText}>완료된 작업이 없어요</AppText>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 30, marginTop: 8, marginBottom: 20, paddingHorizontal: SPACING.screenH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  back: { width: 30, height: 30, justifyContent: 'center' },
  title: { flex: 1, textAlign: 'center' },
  spacer: { width: 30 },
  content: { paddingHorizontal: SPACING.screenH, paddingBottom: 40 },
  list: { marginTop: 36, gap: 10 },
  empty: { alignItems: 'center', marginTop: 180 },
  faded: { opacity: 0.16 },
  emptyText: { marginTop: 24 },
});
