import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';
import { formatMinutes } from '../utils/duration';

interface AiPredictPromptProps {
  enabled: boolean;
  onPredict: () => void;
}

/** AI로 시간 예측하기 (피그마 6:4625 / 6:4731): 79h r12, 우측 '예측' 버튼 58x29 */
export function AiPredictPrompt({ enabled, onPredict }: AiPredictPromptProps) {
  return (
    <View style={styles.prompt}>
      <View>
        <AppText variant="aiCardTitle" color={COLORS.textMain}>AI로 시간 예측하기</AppText>
        <AppText variant="aiCardSub" color={COLORS.textSub} style={styles.gap}>예측 소요시간을 먼저 입력해주세요</AppText>
      </View>
      <Pressable
        disabled={!enabled}
        onPress={onPredict}
        style={[styles.predictBtn, { backgroundColor: enabled ? COLORS.primary : COLORS.fillDisabled }]}
      >
        <AppText variant="aiPredictBtn" color={COLORS.textInverse}>예측</AppText>
      </Pressable>
    </View>
  );
}

interface AiPredictResultProps {
  predictedMinutes: number;
  baseMinutes: number;
  hasSubtasks: boolean;
  onDetail: () => void;
  onApply: () => void;
}

/** AI 예측 결과 (피그마 6:4837): 161h r12, 상세 확인 / 적용하기 */
export function AiPredictResult({ predictedMinutes, baseMinutes, hasSubtasks, onDetail, onApply }: AiPredictResultProps) {
  return (
    <View style={styles.result}>
      <AppText variant="aiResultLabel" color={COLORS.textMain}>AI 예측</AppText>
      <AppText variant="aiResultValue" color={COLORS.textMain} style={styles.value}>약 {formatMinutes(predictedMinutes)}</AppText>
      <AppText variant="aiResultSub" color={COLORS.textSub} style={styles.resultSub}>
        {hasSubtasks ? '총 세부 분량' : '입력한 소요 시간'} {formatMinutes(baseMinutes)}에 30분의 여유를 더했어요
      </AppText>
      <View style={styles.btnRow}>
        <Pressable style={[styles.resultBtn, { backgroundColor: COLORS.fillSoft }]} onPress={onDetail}>
          <AppText variant="aiResultBtn" color={COLORS.textWeak}>상세 확인</AppText>
        </Pressable>
        <Pressable style={[styles.resultBtn, { backgroundColor: COLORS.primary }]} onPress={onApply}>
          <AppText variant="aiResultBtn" color={COLORS.textInverse}>적용하기</AppText>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  prompt: {
    height: 79, borderRadius: 12, backgroundColor: COLORS.surface, paddingHorizontal: 19,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  gap: { marginTop: 6 },
  predictBtn: { width: 58, height: 29, borderRadius: 30, alignItems: 'center', justifyContent: 'center' },
  result: { borderRadius: 12, backgroundColor: COLORS.surface, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 18 },
  value: { marginTop: 6 },
  resultSub: { marginTop: 6 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 16 },
  resultBtn: { flex: 1, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
});
