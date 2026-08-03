import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { SPACING, TypographyToken } from '../constants/token';

interface StatCardProps {
  value: string;
  valueVariant: TypographyToken;
  valueColor: string;
  caption: string;
  captionColor: string;
  bgColor: string;
  borderColor: string;
}

/** 세션 완료 통계 카드 (일시정지 횟수 / 초과 시간 등) */
export default function StatCard({
  value, valueVariant, valueColor, caption, captionColor, bgColor, borderColor,
}: StatCardProps) {
  return (
    <View style={[styles.card, { backgroundColor: bgColor, borderColor }]}>
      <AppText variant={valueVariant} color={valueColor}>{value}</AppText>
      <AppText variant="statCaption" color={captionColor} style={styles.caption}>{caption}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    height: 82,
    borderRadius: SPACING.cardRadius,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caption: { marginTop: 7 },
});
