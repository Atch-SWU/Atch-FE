import { useEffect, useRef, useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import FormField from '../components/FormField';
import PeriodCard from '../components/PeriodCard';
import ToggleSwitch from '../components/ToggleSwitch';
import SubtaskList, { Subtask } from '../components/SubtaskList';
import TotalSummaryCard from '../components/TotalSummaryCard';
import DurationInput from '../components/DurationInput';
import { AiPredictPrompt, AiPredictResult } from '../components/AiPredictCard';
import DurationStepperDialog from '../components/DurationStepperDialog';
import TaskDetailDialog from '../components/TaskDetailDialog';
import AiLoadingDialog from '../components/AiLoadingDialog';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskCreate'>;

/** AI 세부 단계 목업 (실제 연동 전까지 임시) */
const MOCK_STEPS = ['자료 조사하기', '구조 잡기', '초안 작성하기', '검토 및 마무리'];
const AI_BUFFER_MIN = 30;
const DEFAULT_STEP_MIN = 10;

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <AppText variant="formSection" color={COLORS.textBody}>{title}</AppText>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

export default function TaskCreateScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);

  const [aiSplit, setAiSplit] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [predicted, setPredicted] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const [memo, setMemo] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const durationMin = (parseInt(hours || '0', 10) || 0) * 60 + (parseInt(minutes || '0', 10) || 0);
  const allTimed = subtasks.length > 0 && subtasks.every((s) => s.minutes != null);
  const subtaskTotal = subtasks.reduce((sum, s) => sum + (s.minutes ?? 0), 0);
  const baseMin = allTimed ? subtaskTotal : durationMin;
  // 필수: 태스크 이름 / 기간 설정(시작·종료, 종료가 시작보다 빠르면 안 됨) / 예상 소요 시간
  const periodFilled =
    startDate != null && endDate != null && (allDay || (startTime != null && endTime != null));
  const periodValid =
    periodFilled &&
    (startOfDay(endDate!) > startOfDay(startDate!) ||
      (startOfDay(endDate!) === startOfDay(startDate!) &&
        (allDay || endTime!.getHours() * 60 + endTime!.getMinutes() >= startTime!.getHours() * 60 + startTime!.getMinutes())));
  const canCreate = name.trim().length > 0 && periodValid && durationMin > 0;

  // 하루 종일: 시작일이 없으면 오늘, 종료일이 없거나 시작일보다 빠르면 시작일과 동일하게
  const syncEnd = (start: Date) => {
    setEndDate((prev) => (prev == null || startOfDay(prev) < startOfDay(start) ? start : prev));
  };
  const onToggleAllDay = (v: boolean) => {
    setAllDay(v);
    if (!v) return;
    const start = startDate ?? new Date();
    setStartDate(start);
    syncEnd(start);
  };
  const onChangeStartDate = (d: Date) => {
    setStartDate(d);
    if (allDay) syncEnd(d);
  };

  const onToggleAi = (v: boolean) => {
    setAiSplit(v);
    setPredicted(null);
    if (!v) { setSubtasks([]); return; }
    setAiLoading(true);
    timer.current = setTimeout(() => {
      setSubtasks(MOCK_STEPS.map((label, i) => ({ id: String(i), label, minutes: null })));
      setAiLoading(false);
    }, 1800);
  };

  const editing = subtasks.find((s) => s.id === editingId);
  const saveStep = (m: number) => {
    setSubtasks((prev) => prev.map((s) => (s.id === editingId ? { ...s, minutes: m } : s)));
    setEditingId(null);
    setPredicted(null);
  };

  const applyPrediction = () => {
    if (predicted == null) return;
    setHours(String(Math.floor(predicted / 60)).padStart(2, '0'));
    setMinutes(String(predicted % 60).padStart(2, '0'));
    setPredicted(null);
  };

  const detailItems: Subtask[] = allTimed
    ? subtasks
    : [{ id: 'single', label: name.trim() || '태스크', minutes: durationMin }];

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} hitSlop={10} onPress={() => navigation.goBack()}>
          <ChevronLeft width={20} height={20} color={COLORS.textBody} />
        </Pressable>
        <AppText variant="formHeaderTitle" color={COLORS.textMain} style={styles.headerTitle}>태스크 추가</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Section title="태스크 이름">
          <FormField value={name} onChangeText={setName} placeholder="태스크 이름을 입력해 주세요." />
        </Section>

        <Section title="기간 설정">
          <PeriodCard
            allDay={allDay}
            onToggleAllDay={onToggleAllDay}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            onChangeStartDate={onChangeStartDate}
            onChangeStartTime={setStartTime}
            onChangeEndDate={setEndDate}
            onChangeEndTime={setEndTime}
          />
        </Section>

        <Section title="세부 분량 나누기">
          <View style={styles.toggleRow}>
            <AppText variant="formRowText" color={COLORS.textStrong}>AI 세부 분량 나누기</AppText>
            <ToggleSwitch variant="form" value={aiSplit} onValueChange={onToggleAi} />
          </View>
          {aiSplit && subtasks.length > 0 && (
            <View style={styles.stack}>
              <SubtaskList items={subtasks} onPressChip={setEditingId} />
              {allTimed && <TotalSummaryCard totalMinutes={subtaskTotal} stepCount={subtasks.length} />}
            </View>
          )}
        </Section>

        <Section title="소요 시간">
          <View style={styles.stack4}>
            <DurationInput hours={hours} minutes={minutes} onChangeHours={setHours} onChangeMinutes={setMinutes} />
            {predicted == null ? (
              <AiPredictPrompt enabled={durationMin > 0 || allTimed} onPredict={() => setPredicted(baseMin + AI_BUFFER_MIN)} />
            ) : (
              <AiPredictResult
                predictedMinutes={predicted}
                baseMinutes={baseMin}
                hasSubtasks={allTimed}
                onDetail={() => setDetailOpen(true)}
                onApply={applyPrediction}
              />
            )}
          </View>
        </Section>

        <Section title="메모">
          <FormField value={memo} onChangeText={setMemo} placeholder="메모를 입력해 주세요." multiline height={110} />
        </Section>
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          disabled={!canCreate}
          onPress={() => navigation.goBack()}
          style={[styles.createBtn, { backgroundColor: canCreate ? COLORS.primary : COLORS.fillDisabled }]}
        >
          <AppText variant="createBtnText" color={COLORS.textInverse}>추가하기</AppText>
        </Pressable>
      </View>

      <AiLoadingDialog visible={aiLoading} />
      <DurationStepperDialog
        visible={editingId != null}
        initialMinutes={editing?.minutes ?? DEFAULT_STEP_MIN}
        onCancel={() => setEditingId(null)}
        onSave={saveStep}
      />
      <TaskDetailDialog
        visible={detailOpen}
        items={detailItems}
        totalMinutes={allTimed ? subtaskTotal : durationMin}
        onClose={() => setDetailOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background },
  header: { height: 30, marginTop: 8, marginBottom: 12, paddingHorizontal: SPACING.screenH, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn: { width: 30, height: 30, alignItems: 'flex-start', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 30 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: SPACING.screenH, paddingBottom: 24 },
  section: { marginBottom: 21 },
  sectionBody: { marginTop: 4 },
  toggleRow: {
    height: 55, borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface,
    paddingHorizontal: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  stack: { marginTop: 6, gap: 6 },
  stack4: { gap: 4 },
  bottomBar: { paddingHorizontal: SPACING.screenH, paddingTop: 12, paddingBottom: 16, backgroundColor: COLORS.background },
  createBtn: { height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
