import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface TipCardProps {
  title?: string;
  body: string;
}

/** AI 시간 예측 Tip 카드 */
export default function TipCard({ title = 'Tip!', body }: TipCardProps) {
  return (
    <View style={styles.card}>
      <AppText variant="tipTitle" color={COLORS.tipText}>{title}</AppText>
      <AppText variant="formText" color={COLORS.tipText} style={styles.body}>{body}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.tipBg,
    borderWidth: 1,
    borderColor: COLORS.tipBorder,
    borderRadius: 16,
    paddingHorizontal: 22,
    paddingVertical: 14,
  },
  body: { marginTop: 6 },
});
