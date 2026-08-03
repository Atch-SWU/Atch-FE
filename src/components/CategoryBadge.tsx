import { View, StyleSheet } from 'react-native';
import AppText from './AppText';

interface CategoryBadgeProps {
  label: string;
  bgColor: string;   // token 색상
  textColor: string; // token 색상
}

/** 카테고리/상태 라벨 (업무·학습·N분 단축 등) */
export default function CategoryBadge({ label, bgColor, textColor }: CategoryBadgeProps) {
  return (
    <View style={[styles.badge, { backgroundColor: bgColor }]}>
      <AppText variant="badgeLabel" color={textColor}>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
});
