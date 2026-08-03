import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import CategoryBadge from './CategoryBadge';
import PlayIcon from '../assets/icon/play.svg';
import { CATEGORY_COLORS, CategoryKey, COLORS, SPACING } from '../constants/token';

interface TodoCardProps {
  title: string;
  category: CategoryKey;
  estimateText: string;
  onPressAction?: () => void;
}

/** 오늘 할 일 카드 (카테고리 색상은 token 에서 결정) */
export default function TodoCard({
  title,
  category,
  estimateText,
  onPressAction,
}: TodoCardProps) {
  const theme = CATEGORY_COLORS[category];

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.cardBg, borderColor: theme.cardBorder },
      ]}
    >
      <View style={styles.left}>
        <View style={styles.titleRow}>
          <AppText variant="cardTitle" color={COLORS.cardTitle}>
            {title}
          </AppText>
          <CategoryBadge
            label={theme.label}
            bgColor={theme.badgeBg}
            textColor={theme.badgeText}
          />
        </View>
        <AppText variant="cardMeta" color={theme.metaText} style={styles.meta}>
          {estimateText}
        </AppText>
      </View>

      <Pressable hitSlop={8} onPress={onPressAction} style={styles.action}>
        <PlayIcon width={25} height={25} color={theme.actionColor} />
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
    paddingHorizontal: SPACING.cardPaddingH,
    paddingVertical: SPACING.cardPaddingV,
  },
  left: { flex: 1 },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  meta: { marginTop: 6 },
  action: { marginLeft: 12 },
});
