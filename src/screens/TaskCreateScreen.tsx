import { useRef, useState } from 'react';
import * as Crypto from 'expo-crypto';
import { View, ScrollView, Pressable, Alert, TextInput, StyleSheet } from 'react-native';
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
import RenameDialog from '../components/RenameDialog';
import AiLoadingDialog from '../components/AiLoadingDialog';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import { COLORS, SPACING, TYPOGRAPHY } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { createTodo, getErrorMessage } from '../api/todoApi';
import { ApiError } from '../api/apiClient';
import {
  createDecomposedTodos, createDraft, decomposeTask, predictTime, predictTimeBatch, Schedule,
} from '../api/aiApi';
import { toDateString, toTimeString } from '../utils/date';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskCreate'>;

const DEFAULT_STEP_MIN = 10;
/** AI 제안 토큰은 10분 유효 → 저장 직전에 9분이 지났으면 같은 입력으로 다시 받아 토큰을 갱신 */
const TOKEN_REFRESH_MS = 9 * 60 * 1000;

/** AI 예측 한 번의 결과 (단건 또는 세부 분량 묶음) */
interface Prediction {
  minutes: number;
  baseMinutes: number;
  token: string;
  at: number;
  /** 상세 확인 팝업에 보여줄 작업별 AI 제안시간 */
  items: Subtask[];
}

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
  const [aiPrompt, setAiPrompt] = useState('');
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);

  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [aiApplied, setAiApplied] = useState(false);
  const [predicting, setPredicting] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [memo, setMemo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // 같은 저장을 다시 보낼 때(네트워크 오류)는 같은 값을, 서버가 거절한 뒤 내용을 고쳐 다시 보낼 때는 새 값을 쓴다
  const creationRequestId = useRef(Crypto.randomUUID());
  // 서버 발급 AI 초안 (이 작업에서 AI 기능을 처음 쓸 때 한 번 받는다)
  const draftId = useRef<string | null>(null);
  // 세부 분량 나누기 결과의 원본 초안 ID / 원본 태스크명
  const decomp = useRef<{ id: string; sourceName: string } | null>(null);

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
  const hasSubtasks = aiSplit && subtasks.length > 0;
  // 세부 분량이 있으면 각 분량의 시간이 모두 입력되어야 하고, 없으면 직접 입력한 소요 시간이 필요
  const canCreate = name.trim().length > 0 && periodValid && (hasSubtasks ? allTimed : durationMin > 0);

  /** 서버에 보낼 일정 (서울 기준). 기간이 유효할 때만 호출 */
  const schedule = (): Schedule => ({
    startDate: toDateString(startDate!),
    startTime: allDay || !startTime ? null : toTimeString(startTime),
    dueDate: toDateString(endDate!),
    dueTime: allDay || !endTime ? null : toTimeString(endTime),
    allDay,
  });
  const ensureDraft = async () => {
    if (!draftId.current) draftId.current = (await createDraft()).draftId;
    return draftId.current;
  };

  // 종료일이 없거나 시작일보다 빠르면 시작일과 동일하게 (하루 종일이면 시작일이 곧 종료일)
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
    syncEnd(d);
  };

  /** 저장 직전 AI 제안 토큰이 만료될 수 있으면 같은 입력으로 다시 요청해 새 토큰을 받는다 */
  const freshToken = async (p: Prediction): Promise<string> => {
    if (Date.now() - p.at < TOKEN_REFRESH_MS) return p.token;
    const r = await requestPrediction();
    setPrediction(r);
    return r.token;
  };

  const onCreate = async () => {
    if (!canCreate || submitting || !startDate || !endDate) return;
    setSubmitting(true);
    try {
      let choice: { draftId: string; selectedEstimateType: 'USER' | 'AI'; predictionToken?: string } | undefined;
      if (prediction) {
        choice = {
          draftId: hasSubtasks ? decomp.current!.id : draftId.current!,
          selectedEstimateType: aiApplied ? 'AI' : 'USER',
          predictionToken: await freshToken(prediction),
        };
      }
      if (hasSubtasks && decomp.current) {
        await createDecomposedTodos({
          creationRequestId: creationRequestId.current,
          decompositionDraftId: decomp.current.id,
          sourceTaskName: decomp.current.sourceName,
          memo: memo.trim() || null,
          ...schedule(),
          tasks: subtasks.map((st) => ({ draftId: st.id, title: st.label, userEstimatedDurationMinutes: st.minutes ?? 0 })),
          estimateChoice: choice,
        });
      } else {
        await createTodo({
          title: name.trim(),
          memo: memo.trim() || null,
          ...schedule(),
          userEstimatedDurationMinutes: durationMin,
          creationRequestId: creationRequestId.current,
          estimateChoice: choice,
        });
      }
      navigation.goBack();
    } catch (e) {
      if (!(e instanceof ApiError) || e.status !== 0) creationRequestId.current = Crypto.randomUUID();
      Alert.alert('태스크를 추가하지 못했어요', getErrorMessage(e));
    } finally {
      setSubmitting(false);
    }
  };

  // AI 세부 분량 나누기: 초안 발급 → 작업 제안. 이 단계에서는 투두가 저장되지 않는다.
  const onToggleAi = async (v: boolean) => {
    setPrediction(null);
    setAiApplied(false);
    if (!v) { setAiSplit(false); setSubtasks([]); return; }
    if (!name.trim() || !periodValid) {
      Alert.alert('AI 세부 분량 나누기', '태스크 이름과 기간을 먼저 입력해 주세요.');
      return;
    }
    setAiSplit(true);
    setAiLoading(true);
    try {
      const draft = await ensureDraft();
      const res = await decomposeTask({
        draftId: draft,
        title: name.trim(),
        taskDescription: aiPrompt.trim() || null,
        memo: memo.trim() || null,
        ...schedule(),
      });
      decomp.current = { id: res.decompositionDraftId, sourceName: res.sourceTaskName ?? name.trim() };
      setSubtasks(res.steps.map((st) => ({ id: st.draftId, label: st.title, minutes: null })));
    } catch (e) {
      setAiSplit(false);
      setSubtasks([]);
      Alert.alert('세부 분량을 나누지 못했어요', getErrorMessage(e));
    } finally {
      setAiLoading(false);
    }
  };

  /** AI 시간 예측: 세부 분량이 있으면 묶음 예측, 없으면 단건 예측 */
  const requestPrediction = async (): Promise<Prediction> => {
    if (hasSubtasks && allTimed && decomp.current) {
      const res = await predictTimeBatch({
        decompositionDraftId: decomp.current.id,
        sourceTaskName: decomp.current.sourceName,
        memo: memo.trim() || null,
        tasks: subtasks.map((st) => ({ draftId: st.id, title: st.label, userEstimatedDurationMinutes: st.minutes ?? 0 })),
      });
      return {
        minutes: res.totalAiEstimatedDurationMinutes,
        baseMinutes: res.totalUserEstimatedDurationMinutes,
        token: res.predictionToken,
        at: Date.now(),
        items: res.predictions.map((p) => ({
          id: p.draftId,
          label: subtasks.find((st) => st.id === p.draftId)?.label ?? '',
          minutes: p.aiEstimatedDurationMinutes,
        })),
      };
    }
    const draft = await ensureDraft();
    const res = await predictTime({
      draftId: draft,
      title: name.trim(),
      memo: memo.trim() || null,
      userEstimatedDurationMinutes: durationMin,
    });
    return {
      minutes: res.prediction.aiEstimatedDurationMinutes,
      baseMinutes: durationMin,
      token: res.predictionToken,
      at: Date.now(),
      items: [{ id: 'single', label: name.trim(), minutes: res.prediction.aiEstimatedDurationMinutes }],
    };
  };

  const onPredict = async () => {
    if (predicting) return;
    if (!name.trim()) { Alert.alert('AI 시간 예측', '태스크 이름을 먼저 입력해 주세요.'); return; }
    setPredicting(true);
    try {
      setPrediction(await requestPrediction());
      setAiApplied(false);
    } catch (e) {
      Alert.alert('시간을 예측하지 못했어요', getErrorMessage(e));
    } finally {
      setPredicting(false);
    }
  };

  // 세부 분량을 고치면 이전 AI 예측은 더 이상 맞지 않으므로 버린다
  const resetPrediction = () => { setPrediction(null); setAiApplied(false); };

  const renameStep = (label: string) => {
    setSubtasks((prev) => prev.map((s) => (s.id === renamingId ? { ...s, label } : s)));
    setRenamingId(null);
    resetPrediction();
  };
  const deleteStep = (id: string) => {
    const rest = subtasks.filter((s) => s.id !== id);
    setSubtasks(rest);
    resetPrediction();
    // 다 지우면 AI 세부 분량 나누기를 끈 상태로 돌아간다 (저장에는 최소 1개가 필요)
    if (rest.length === 0) setAiSplit(false);
  };

  const editing = subtasks.find((s) => s.id === editingId);
  const renaming = subtasks.find((s) => s.id === renamingId);
  const saveStep = (m: number) => {
    setSubtasks((prev) => prev.map((s) => (s.id === editingId ? { ...s, minutes: m } : s)));
    setEditingId(null);
    setPrediction(null);
    setAiApplied(false);
  };

  // 적용하기 = AI 제안시간을 선택 (직접 입력한 시간은 그대로 보존되고, 저장할 때 estimateChoice 로 전달)
  const applyPrediction = () => setAiApplied((v) => !v);

  const detailItems: Subtask[] = prediction?.items ?? [];

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
          <View style={styles.aiCard}>
            <View style={styles.aiRow}>
              <AppText variant="formRowText" color={COLORS.textStrong}>AI 세부 분량 나누기</AppText>
              <ToggleSwitch variant="form" value={aiSplit} onValueChange={onToggleAi} />
            </View>
            <TextInput
              value={aiPrompt}
              onChangeText={setAiPrompt}
              placeholder="작업 내용을 입력해주세요"
              placeholderTextColor={COLORS.textPlaceholder}
              style={styles.aiInput}
            />
          </View>
          {aiSplit && subtasks.length > 0 && (
            <View style={styles.stack}>
              <SubtaskList items={subtasks} onPressChip={setEditingId} onPressLabel={setRenamingId} />
              {allTimed && <TotalSummaryCard totalMinutes={subtaskTotal} stepCount={subtasks.length} />}
            </View>
          )}
        </Section>

        <Section title="소요 시간">
          <View style={styles.stack4}>
            <DurationInput hours={hours} minutes={minutes} onChangeHours={setHours} onChangeMinutes={setMinutes} />
            {prediction == null ? (
              <AiPredictPrompt enabled={(hasSubtasks ? allTimed : durationMin > 0) && !predicting} onPredict={onPredict} />
            ) : (
              <AiPredictResult
                predictedMinutes={prediction.minutes}
                baseMinutes={prediction.baseMinutes}
                hasSubtasks={allTimed}
                applied={aiApplied}
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
          disabled={!canCreate || submitting}
          onPress={onCreate}
          style={[styles.createBtn, { backgroundColor: canCreate ? COLORS.primary : COLORS.fillDisabled, opacity: submitting ? 0.6 : 1 }]}
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
      <RenameDialog
        visible={renamingId != null}
        initialText={renaming?.label ?? ''}
        onCancel={() => setRenamingId(null)}
        onSave={renameStep}
        onDelete={() => { if (renamingId) deleteStep(renamingId); setRenamingId(null); }}
      />
      <TaskDetailDialog
        visible={detailOpen}
        items={detailItems}
        totalMinutes={prediction?.minutes ?? 0}
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
  // 피그마 344:3088: 카드 360x123, 패딩 21/19, 토글 행 29h, 간격 12, 입력창 44h r9 (배경 gray100)
  aiCard: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12, backgroundColor: COLORS.surface,
    paddingHorizontal: 21, paddingVertical: 19, gap: 12,
  },
  aiRow: { height: 29, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  aiInput: {
    ...TYPOGRAPHY.formAiInput, height: 44, borderRadius: 9, backgroundColor: COLORS.fillSoft,
    paddingHorizontal: 14, paddingVertical: 0, color: COLORS.textStrong,
  },
  stack: { marginTop: 6, gap: 6 },
  stack4: { gap: 4 },
  bottomBar: { paddingHorizontal: SPACING.screenH, paddingTop: 12, paddingBottom: 16, backgroundColor: COLORS.background },
  createBtn: { height: 60, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
