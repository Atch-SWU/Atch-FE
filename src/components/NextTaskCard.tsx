import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import PlayIcon from '../assets/icon/play.svg';
import { COLORS } from '../constants/token';

interface NextTaskCardProps {
  title: string;
  /** 예: "예상 30분" */
  estimateText: string;
  onPressPlay: () => void;
}

/** 다음 작업 카드 (피그마 6:5518: 96h r16, 오렌지300 테두리, 우측 45 원형 재생) */
export default function NextTaskCard({ title, estimateText, onPressPlay }: NextTaskCardProps) {
  return (
    <View style={styles.card}>
      <View style={styles.texts}>
        <View style={styles.chip}>
          <AppText variant="todoChipText" color={COLORS.primary}>{estimateText}</AppText>
        </View>
        <AppText variant="nextCardTitle" color={COLORS.textMain} numberOfLines={1} style={styles.title}>{title}</AppText>
      </View>
      <Pressable style={styles.play} onPress={onPressPlay}>
        <PlayIcon width={18} height={18} color={COLORS.iconWeak} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: 96, borderRadius: 16, borderWidth: 1, borderColor: COLORS.primaryLight, backgroundColor: COLORS.surface,
    paddingLeft: 23, paddingRight: 21, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  texts: { flex: 1, marginRight: 12, alignItems: 'flex-start' },
  chip: { height: 25, paddingHorizontal: 8, borderRadius: 10, backgroundColor: COLORS.primaryTint, alignItems: 'center', justifyContent: 'center' },
  title: { marginTop: 8 },
  play: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: COLORS.fillMuted, alignItems: 'center', justifyContent: 'center' },
});
