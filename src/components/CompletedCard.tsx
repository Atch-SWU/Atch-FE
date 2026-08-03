import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import CategoryBadge from './CategoryBadge';
import { COMPLETED_COLORS, SPACING } from '../constants/token';

interface CompletedCardProps {
  date: string;
  title: string;
  badgeText: string;
}

/** 완료 작업 카드 */
export default function CompletedCard({ date, title, badgeText }: CompletedCardProps) {
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor: COMPLETED_COLORS.cardBg,
          borderColor: COMPLETED_COLORS.cardBorder,
        },
      ]}
    >
      <View style={styles.left}>
        <AppText variant="completedDate" color={COMPLETED_COLORS.dateText}>
          {date}
        </AppText>
        <AppText
          variant="completedTitle"
          color={COMPLETED_COLORS.titleText}
          style={styles.title}
        >
          {title}
        </AppText>
      </View>

      <CategoryBadge
        label={badgeText}
        bgColor={COMPLETED_COLORS.badgeBg}
        textColor={COMPLETED_COLORS.badgeText}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: SPACING.cardRadius,
    borderWidth: 1,
    paddingHorizontal: SPACING.cardPaddingH,
    paddingVertical: 14,
  },
  left: { flex: 1 },
  title: { marginTop: 5 },
});
