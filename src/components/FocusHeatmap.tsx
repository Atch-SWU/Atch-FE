import { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

import AppText from './AppText';
import { COLORS, SPACING } from '../constants/token';
import { getIntensityColor } from '../data/reportDummyData';

interface FocusHeatmapRow {
  label?: string;
  values: number[];
}

interface FocusHeatmapProps {
  rows: FocusHeatmapRow[];
  /**
   * true면 화면이 넓어질 때 좌우 여백·셀 간격은 그대로 두고
   * 셀 크기만 키워서 가로를 꽉 채움 (최소 22px 보장).
   * false(기본값)면 항상 22px 고정.
   */
  responsive?: boolean;
}

const CELL_SIZE = 22;
const CELL_GAP = 4;
const LABEL_WIDTH = 16;
const LABEL_GAP = 9;
const CARD_PADDING_H = 20;

/** 시간대별 집중도 히트맵 (요일 x 시간대 그리드) */
export default function FocusHeatmap({
  rows,
  responsive = false,
}: FocusHeatmapProps) {
  const showLabels = rows.some((row) => !!row.label);
  const { width: windowWidth } = useWindowDimensions();
  const cellCount = rows[0]?.values.length ?? 0;

  const cellSize = useMemo(() => {
    if (!responsive || cellCount === 0) return CELL_SIZE;

    // 좌우 화면 여백(SPACING.screenH) + 카드 패딩(CARD_PADDING_H) + 라벨 영역을
    // 뺀 나머지를 셀 개수만큼 나눠서 크기를 계산 (간격은 CELL_GAP로 고정 유지).
    const labelSpace = showLabels ? LABEL_WIDTH + LABEL_GAP : 0;
    const gridAvailableWidth =
      windowWidth - SPACING.screenH * 2 - CARD_PADDING_H * 2 - labelSpace;
    const rawSize =
      (gridAvailableWidth - (cellCount - 1) * CELL_GAP) / cellCount;

    // 좁은 화면(대략 402pt 이하)에서는 rawSize가 22보다 작게 나와
    // 자연스럽게 22px 고정으로 클램프되고, 그보다 넓은 화면에서만 커진다.
    return Math.max(rawSize, CELL_SIZE);
  }, [responsive, windowWidth, cellCount, showLabels]);

  return (
    <View style={styles.card}>
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {showLabels && (
            <View style={styles.labelCell}>
              <AppText variant="reportGridLabel" color={COLORS.grey400}>
                {row.label}
              </AppText>
            </View>
          )}

          <View style={styles.cellsRow}>
            {row.values.map((value, colIndex) => (
              <View
                key={colIndex}
                style={[
                  styles.cell,
                  {
                    width: cellSize,
                    height: cellSize,
                    backgroundColor: getIntensityColor(value),
                  },
                ]}
              />
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.background,
    paddingHorizontal: CARD_PADDING_H,
    paddingVertical: 19,
    gap: 4,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: LABEL_GAP,
  },

  labelCell: {
    width: LABEL_WIDTH,
    alignItems: 'center',
  },

  cellsRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },

  cell: {
    borderRadius: 6,
  },
});
