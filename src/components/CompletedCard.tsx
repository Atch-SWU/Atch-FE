import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import CategoryBadge from './CategoryBadge';
import { COLORS } from '../constants/token';

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
          backgroundColor: COLORS.gray100,
          borderColor: COLORS.gray100,
        },
      ]}
    >
      <View style={styles.left}>
        <AppText variant="completedDate" color={ COLORS.gray100 }>
          {date}
        </AppText>
        <AppText
          variant="completedTitle"
          color={ COLORS.gray100 }
          style={styles.title}
        >
          {title}
        </AppText>
      </View>

      <CategoryBadge
        label={badgeText}
        bgColor={ COLORS.gray100 }
        textColor={ COLORS.gray100 }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 13,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 14,
  },
  left: { flex: 1 },
  title: { marginTop: 5 },
});
