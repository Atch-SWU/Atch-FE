import { View, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface StatTileProps {
  label: string;
  value: string;
  /** 값 위 오렌지 보조문구 (예: "예상보다 더 집중") */
  hint?: string;
  flex: number;
}

/** 세션 완료 통계 타일 (피그마 6:5527: h110 r18, 라벨 좌상단 / 값 우하단) */
export default function StatTile({ label, value, hint, flex }: StatTileProps) {
  return (
    <View style={[styles.tile, { flex }]}>
      <AppText variant="statLabel" color={COLORS.textWeak}>{label}</AppText>
      <View style={styles.right}>
        {hint ? <AppText variant="statHint" color={COLORS.primary}>{hint}</AppText> : null}
        <AppText variant="statValue" color={COLORS.textMain}>{value}</AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tile: { height: 110, borderRadius: 18, borderWidth: 1, borderColor: COLORS.border, backgroundColor: COLORS.surface, padding: 20, justifyContent: 'space-between' },
  right: { alignItems: 'flex-end' },
});
