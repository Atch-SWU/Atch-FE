import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import CategoryBadge from './CategoryBadge';
import PlayIcon from '../assets/icon/play.svg';
import { COLORS, SPACING } from '../constants/token';

interface TodoCardProps {
  title: string;
  category: string;
  estimateText: string;
  onPressAction?: () => void;
}

/** 오늘 할 일 카드 */
export default function TodoCard({
  title,
  category,
  estimateText,
  onPressAction,
}: TodoCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <AppText variant="cardTitle" color={COLORS.black}>
            {title}
          </AppText>

          <CategoryBadge
            label={category}
            bgColor={COLORS.gray200}
            textColor={COLORS.gray600}
          />
        </View>

        <AppText
          variant="cardMeta"
          color={COLORS.gray600}
          style={styles.meta}
        >
          {estimateText}
        </AppText>
      </View>

      <Pressable
        hitSlop={8}
        onPress={onPressAction}
        style={styles.action}
      >
        <PlayIcon
          width={25}
          height={25}
          color={COLORS.gray600}
        />
      </Pressable>
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
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.cardPaddingH,
    paddingVertical: SPACING.cardPaddingV,
  },
  left: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  meta: {
    marginTop: 6,
  },
  action: {
    marginLeft: 12,
  },
});