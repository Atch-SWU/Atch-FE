import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import FormInput from '../components/FormInput';
import PeriodCard from '../components/PeriodCard';
import TipCard from '../components/TipCard';
import ToggleSwitch from '../components/ToggleSwitch';
import AmountList from '../components/AmountList';
import ConfirmDialog from '../components/ConfirmDialog';
import AppButton from '../components/AppButton';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'TaskCreate'>;

export default function TaskCreateScreen({ navigation }: Props) {
  const [name, setName] = useState('');
  const [allDay, setAllDay] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [aiSplit, setAiSplit] = useState(false);
  const [amount, setAmount] = useState('');
  const [amountItems, setAmountItems] = useState<string[]>(['']);
  const [memo, setMemo] = useState('');
  const [confirmVisible, setConfirmVisible] = useState(false);

  const createTask = () => navigation.goBack();
  const taskCount = amountItems.filter((x) => x.trim() !== '').length || 1;
  const onConfirm = () => {
    if (aiSplit) setConfirmVisible(true);
    else createTask();
  };

  const onToggleAiSplit = (v: boolean) => {
    setAiSplit(v);
    if (v) setAmountItems(amount.trim() ? [amount] : ['']);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <ChevronLeft width={20} height={20} color={COLORS.headerBackIcon} />
        </Pressable>
        <AppText variant="titleSmall" color={COLORS.textMain} style={styles.headerTitle}>태스크 추가</AppText>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* 태스크 이름 */}
        <AppText variant="formLabel" color={COLORS.textMain} style={styles.firstLabel}>태스크 이름</AppText>
        <View style={styles.field}>
          <FormInput value={name} onChangeText={setName} placeholder="태스크 이름을 입력해주세요." />
        </View>

        {/* 기간 설정 */}
        <AppText variant="formLabel" color={COLORS.textMain} style={styles.label}>기간 설정</AppText>
        <View style={styles.field}>
          <PeriodCard
            allDay={allDay}
            onToggleAllDay={setAllDay}
            startDate={startDate}
            startTime={startTime}
            endDate={endDate}
            endTime={endTime}
            onChangeStartDate={setStartDate}
            onChangeStartTime={setStartTime}
            onChangeEndDate={setEndDate}
            onChangeEndTime={setEndTime}
          />
        </View>

        {/* 분량 */}
        <AppText variant="formLabel" color={COLORS.textMain} style={styles.label}>분량</AppText>
        <View style={styles.field}>
          <FormInput value={amount} onChangeText={setAmount} placeholder="분량을 자유롭게 입력해주세요." />
        </View>
        <View style={[styles.field, styles.aiCard]}>
          <AppText variant="formLabel" color={COLORS.formRowLabel}>AI 세부 분량 나누기</AppText>
          <ToggleSwitch value={aiSplit} onValueChange={onToggleAiSplit} />
        </View>
        {aiSplit && (
          <View style={styles.amountField}>
            <AmountList items={amountItems} onChange={setAmountItems} />
          </View>
        )}

        {/* AI 시간 예측 */}
        <AppText variant="formLabel" color={COLORS.textMain} style={styles.label}>AI 시간 예측</AppText>
        <View style={styles.field}>
          <TipCard body="태스크를 최소 한 개 이상 완료해 주세요!" />
        </View>

        {/* 메모 */}
        <AppText variant="formLabel" color={COLORS.textMain} style={styles.label}>메모</AppText>
        <View style={styles.field}>
          <FormInput value={memo} onChangeText={setMemo} placeholder="메모를 입력해 주세요." />
        </View>
      </ScrollView>

      <View style={styles.bottomBar}>
        <AppButton label="태스크 생성" variant="primary" textVariant="titleSmall" style={styles.createBtn} onPress={onConfirm} />
      </View>

      <ConfirmDialog
        visible={confirmVisible}
        title={`총 ${taskCount}개의 태스크가 추가됩니다.`}
        cancelLabel="다시 입력하기"
        confirmLabel="생성하기"
        onCancel={() => setConfirmVisible(false)}
        onConfirm={() => { setConfirmVisible(false); createTask(); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.background, paddingHorizontal: SPACING.screenH },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 8, marginBottom: 8 },
  backBtn: { width: 30, height: 30, borderRadius: 15, backgroundColor: COLORS.headerBackBg, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, textAlign: 'center' },
  headerSpacer: { width: 30 },
  scroll: { flex: 1 },
  bottomBar: { paddingTop: 10, paddingBottom: 6 },
  createBtn: { height: 52 },
  content: { paddingBottom: 24 },
  firstLabel: { marginTop: 24 },
  label: { marginTop: 28 },
  field: { marginTop: 8 },
  aiCard: { borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 16, height: 50, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  amountField: { marginTop: 8 },
});
