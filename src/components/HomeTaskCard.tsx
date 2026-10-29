import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import PlayIcon from '../assets/icon/play.svg';
import { COLORS, SPACING } from '../constants/token';

interface HomeTaskCardProps {
  title: string;
  parent?: string;
  /** 예: "예상 30분" */
  estimateText: string;
  onPressPlay?: () => void;
}

/** 홈 오늘 할 일 카드 (피그마 6:5624: r16 흰 배경, 상위작업 있으면 114h / 없으면 94h) */
export default function HomeTaskCard({ title, parent, estimateText, onPressPlay }: HomeTaskCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.texts}>
        <View style={styles.chip}>
          <AppText variant="todoChipText" color={COLORS.primary}>{estimateText}</AppText>
        </View>
        <AppText variant="homeCardTitle" color={COLORS.textMain} numberOfLines={1} style={styles.title}>{title}</AppText>
        {parent ? <AppText variant="homeCardParent" color={COLORS.textWeak} style={styles.parent}>{parent}</AppText> : null}
      </View>
      <Pressable style={styles.play} onPress={onPressPlay} hitSlop={6}>
        <PlayIcon width={18} height={18} color={COLORS.iconWeak} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    minHeight: 94, borderRadius: 16, backgroundColor: COLORS.surface,
    paddingVertical: 18, paddingLeft: 22, paddingRight: 22,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  texts: { flex: 1, marginRight: 12, alignItems: 'flex-start' },
  chip: { marginLeft: SPACING.chipInset, height: 25, paddingHorizontal: 8, borderRadius: 10, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 8, marginLeft: SPACING.glyphInset },
  parent: { marginTop: 6 },
  play: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.fillMuted, alignItems: 'center', justifyContent: 'center' },
});
