import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import useAppDimensions from '../hooks/useAppDimensions';
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

const CELL_SIZE = 21;
const CELL_GAP = 4;
const LABEL_WIDTH = 16;
const LABEL_GAP = 9;
const CARD_PADDING_H = 20;

const WEEK_LABELS = ['일', '월', '화', '수', '목', '금', '토'];
const TIME_LABELS = ['0시', '6시', '12시', '18시', '24시'];

/** 시간대별 집중도 히트맵 (요일 x 시간대 그리드) */
export default function FocusHeatmap({
  rows,
  responsive = false,
}: FocusHeatmapProps) {
  const showLabels = rows.some((row) => !!row.label);
  const { width: windowWidth } = useAppDimensions();
  const cellCount = rows[0]?.values.length ?? 0;

  const cellSize = useMemo(() => {
    if (!responsive || cellCount === 0) return CELL_SIZE;

    // 좌우 화면 여백(SPACING.screenH) + 카드 패딩(CARD_PADDING_H) + 라벨 영역을
    // 뺀 나머지를 셀 개수만큼 나눠서 크기를 계산 (간격은 CELL_GAP로 고정 유지).
    const labelSpace = showLabels ? LABEL_WIDTH + LABEL_GAP : 0;
    const gridAvailableWidth =
      windowWidth -
      SPACING.screenH * 2 -
      CARD_PADDING_H * 2 -
      labelSpace;

    const rawSize =
      (gridAvailableWidth - (cellCount - 1) * CELL_GAP) / cellCount;

    // 좁은 화면에서는 22px보다 작아지지 않도록 유지.
    return Math.max(rawSize, CELL_SIZE);
  }, [responsive, windowWidth, cellCount, showLabels]);

  return (
    <View style={styles.card}>
      {/* 상단 제목 */}
      <View style={styles.header}>
        <AppText
          variant="reportChartTitle"
          style={styles.headerTitle}
        >
          시간대별 집중도
        </AppText>

      </View>

      {/* 요일별 히트맵 */}
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {showLabels && (
            <View style={styles.labelCell}>
              <AppText
                variant="reportChartTime"
                style={styles.dayLabel}
              >
                {WEEK_LABELS[rowIndex] ?? row.label}
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

      {/* 하단 시간축 */}
      <View style={styles.timeAxisRow}>
        {TIME_LABELS.map((time, index) => (
          <AppText
            key={time}
            variant="reportChartTime"
            style={[
              styles.timeLabel,
              index === 0 && styles.timeLabelStart,
              index === TIME_LABELS.length - 1 && styles.timeLabelEnd,
            ]}
          >
            {time}
          </AppText>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginTop: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
    paddingHorizontal: CARD_PADDING_H,
    paddingVertical: 19,
    gap: 4,
  },

  header: {
    marginLeft: -2,
    marginBottom: 15,
  },

  headerTitle: {
    fontFamily: 'SUIT-Medium',
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.gray500,
  },

  headerUnit: {
    fontFamily: 'SUIT-Medium',
    fontSize: 13,
    lineHeight: 17,
    color: COLORS.gray500,
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: LABEL_GAP,
  },

  labelCell: {
    width: LABEL_WIDTH,
    alignItems: 'flex-start',
  },

  dayLabel: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 10,
    lineHeight: 13,
    color: COLORS.gray500,
  },

  cellsRow: {
    flexDirection: 'row',
    gap: CELL_GAP,
  },

  cell: {
    borderRadius: 6,
  },

  timeAxisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginLeft: LABEL_WIDTH + LABEL_GAP,
    marginTop: 4,
  },

  timeLabel: {
    fontFamily: 'SUIT-SemiBold',
    fontSize: 10,
    lineHeight: 13,
    color: COLORS.gray500,
  },

  timeLabelStart: {
    textAlign: 'left',
  },

  timeLabelEnd: {
    textAlign: 'right',
  },
});