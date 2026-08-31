import { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

import AppText from './AppText';
import { COLORS, SPACING } from '../constants/token';

export interface StatCardItem {
  label: string;
  value: string;
}

interface StatCardGridProps {
  items: StatCardItem[];
}

const STAT_CARD_COLUMN_GAP = 14;
const STAT_CARD_ROW_GAP = 15;

/** 리포트 하단 통계 카드 2열 그리드 (주간/일간 공용) */
export default function StatCardGrid({ items }: StatCardGridProps) {
  const { width: windowWidth } = useWindowDimensions();

  // 좌우 간격(STAT_CARD_COLUMN_GAP)은 고정하고 남는 폭을 2등분해서
  // 카드 가로 길이를 계산 (히트맵 셀 · 막대 그래프와 동일한 방식).
  const cardWidth = useMemo(() => {
    const availableWidth =
      windowWidth - SPACING.screenH * 2 - STAT_CARD_COLUMN_GAP;

    return availableWidth / 2;
  }, [windowWidth]);

  return (
    <View style={styles.statsGrid}>
      {items.map((item) => (
        <View
          key={item.label}
          style={[styles.statCard, { width: cardWidth }]}
        >
          <AppText variant="reportStatLabel" color={COLORS.grey500}>
            {item.label}
          </AppText>

          <AppText variant="reportStatValue" color={COLORS.grey800}>
            {item.value}
          </AppText>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    columnGap: STAT_CARD_COLUMN_GAP,
    rowGap: STAT_CARD_ROW_GAP,
  },

  statCard: {
    minHeight: 86,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.grey200,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
  },
});
