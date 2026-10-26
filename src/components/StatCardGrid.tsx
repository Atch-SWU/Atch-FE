import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import useAppDimensions from '../hooks/useAppDimensions';
import { COLORS, SPACING } from '../constants/token';

export interface StatCardItem {
  label: string;
  value: string;
}

interface StatCardGridProps {
  items: StatCardItem[];
}

const STAT_CARD_COLUMN_GAP = 14;
const STAT_CARD_ROW_GAP = 12;

/** 리포트 하단 통계 카드 2열 그리드 (주간/일간 공용) */
export default function StatCardGrid({ items }: StatCardGridProps) {
  const { width: windowWidth } = useAppDimensions();

  // 좌우 간격(STAT_CARD_COLUMN_GAP)은 고정하고 남는 폭을 2등분해서
  // 카드 가로 길이를 계산
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
          {/* 왼쪽 위 */}
          <AppText
            variant="reportStatLabel"
            color={COLORS.gray500}
          >
            {item.label}
          </AppText>

          {/* 오른쪽 아래 */}
          <AppText
            variant="reportStatValue"
            color={COLORS.gray800}
            style={styles.statValue}
          >
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
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 12,
  },

  statValue: {
    alignSelf: 'flex-end',
    marginTop: 17,
  },
});