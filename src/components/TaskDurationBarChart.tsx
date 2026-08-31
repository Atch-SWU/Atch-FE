import { useMemo } from 'react';
import { View, StyleSheet, useWindowDimensions } from 'react-native';

import AppText from './AppText';
import { COLORS, SPACING } from '../constants/token';

interface TaskDurationBarChartProps {
  data: { day: string; minutes: number }[];
  /** 막대 최대 세로 길이 (기본 142) */
  barMaxHeight?: number;
  /** 막대 최소 가로 길이 — 화면이 넓어지면 이 값 이상으로 늘어남 (기본 20.81) */
  baseBarWidth?: number;
  /** 막대 사이 간격 (기본 24) */
  barGap?: number;
  /** 카드 좌우 여백 (기본 37.75) */
  chartPaddingH?: number;
}

const DEFAULT_BAR_MAX_HEIGHT = 142;
const MIN_BAR_HEIGHT = 6;
const BAR_RADIUS = 5;

const DEFAULT_BASE_BAR_WIDTH = 20.81;
const DEFAULT_BAR_GAP = 24;
const DEFAULT_CHART_PADDING_H = 37.75;

// 라벨 텍스트가 막대 폭보다 넓어도(예: "24시") 트랙 간격에 영향을 주지 않도록
// 라벨은 절대 위치로 따로 배치 — 이 폭 안에서 가운데 정렬만 함.
const LABEL_SLOT_WIDTH = 48;

/** 요일별 과제 소요 시간 / 시간대별 집중도 등에서 재사용하는 막대 그래프 */
export default function TaskDurationBarChart({
  data,
  barMaxHeight = DEFAULT_BAR_MAX_HEIGHT,
  baseBarWidth = DEFAULT_BASE_BAR_WIDTH,
  barGap = DEFAULT_BAR_GAP,
  chartPaddingH = DEFAULT_CHART_PADDING_H,
}: TaskDurationBarChartProps) {
  const { width: windowWidth } = useWindowDimensions();

  const maxMinutes = Math.max(...data.map((item) => item.minutes), 1);

  const nonZeroMinutes = data
    .map((item) => item.minutes)
    .filter((minutes) => minutes > 0);
  const minNonZeroMinutes =
    nonZeroMinutes.length > 0 ? Math.min(...nonZeroMinutes) : null;

  // 막대 사이 간격(barGap)·좌우 여백(chartPaddingH)은 고정하고
  // 남는 폭을 막대 개수만큼 나눠서 막대 가로 길이만 반응형으로 계산.
  const { barWidth, startOffset } = useMemo(() => {
    const itemCount = data.length;
    if (itemCount === 0) {
      return { barWidth: baseBarWidth, startOffset: 0 };
    }

    const availableWidth =
      windowWidth - SPACING.screenH * 2 - chartPaddingH * 2;
    const rawWidth =
      (availableWidth - (itemCount - 1) * barGap) / itemCount;

    // 소수점을 올림/반올림하면 기기의 픽셀 반올림 때문에 실제 렌더링 폭이
    // availableWidth를 미세하게 넘어서 좌우 여백이 살짝 좁아 보일 수 있어서
    // 항상 내림 처리 — 여백이 지정값보다 좁아지는 일이 없도록 함.
    const width = Math.floor(Math.max(rawWidth, baseBarWidth));

    // chartArea가 justifyContent:'center'라서, 막대 폭이 최소값에 걸려
    // 전체 콘텐츠 폭이 availableWidth보다 좁아지면 가운데 정렬로 밀리는 만큼을
    // 라벨 위치 계산에도 그대로 반영.
    const totalContentWidth =
      itemCount * width + (itemCount - 1) * barGap;
    const offset = Math.max((availableWidth - totalContentWidth) / 2, 0);

    return { barWidth: width, startOffset: offset };
  }, [windowWidth, data.length, chartPaddingH, barGap, baseBarWidth]);

  return (
    <View style={[styles.card, { paddingHorizontal: chartPaddingH }]}>
      <View style={[styles.chartArea, { gap: barGap }]}>
        {data.map((item, index) => {
          const hasValue = item.minutes > 0;

          const barHeight = Math.max(
            (item.minutes / maxMinutes) * barMaxHeight,
            MIN_BAR_HEIGHT,
          );

          const isPeak =
            item.minutes === maxMinutes && item.minutes > 0;
          const isLowest =
            hasValue && item.minutes === minNonZeroMinutes;

          const barColor = isPeak
            ? COLORS.main100
            : isLowest
              ? COLORS.main20
              : COLORS.main60;

          return (
            <View
              key={`${item.day}-${index}`}
              style={[
                styles.barTrack,
                { width: barWidth, height: barMaxHeight },
              ]}
            >
              {hasValue && (
                <View
                  style={[
                    styles.bar,
                    {
                      height: barHeight,
                      backgroundColor: barColor,
                    },
                  ]}
                />
              )}
            </View>
          );
        })}
      </View>

      <View style={styles.labelRow}>
        {data.map((item, index) => {
          if (!item.day) return null;

          const barCenter =
            startOffset + index * (barWidth + barGap) + barWidth / 2;

          return (
            <AppText
              key={`${item.day}-${index}-label`}
              variant="reportGridLabel"
              color={COLORS.grey400}
              numberOfLines={1}
              style={[
                styles.labelText,
                { left: barCenter - LABEL_SLOT_WIDTH / 2 },
              ]}
            >
              {item.day}
            </AppText>
          );
        })}
      </View>
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
    paddingTop: 18,
    paddingBottom: 14,
  },

  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  labelRow: {
    marginTop: 8,
    height: 17,
  },

  labelText: {
    position: 'absolute',
    width: LABEL_SLOT_WIDTH,
    textAlign: 'center',
  },

  barTrack: {
    borderRadius: BAR_RADIUS,
    backgroundColor: COLORS.grey100,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  bar: {
    width: '100%',
    borderRadius: BAR_RADIUS,
  },
});
