import { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import useAppDimensions from '../hooks/useAppDimensions';
import { COLORS, SPACING } from '../constants/token';

interface TaskDurationBarChartProps {
  data: { day: string; minutes: number }[];

  variant?: 'daily' | 'weekly';

  /** 막대 최대 세로 길이 */
  barMaxHeight?: number;

  /** 막대 최소 가로 길이 */
  baseBarWidth?: number;

  /** 막대 사이 간격 */
  barGap?: number;

  /** 카드 좌우 여백 */
  chartPaddingH?: number;
}

const CHART_CONFIG = {
  daily: {
    barRadius: 8,
    cardPaddingTop: 18,
    cardPaddingBottom: 18,
    chartPaddingTop: 20,
    timeLabelMarginTop: 10,
    barGap: 5,
  },

  weekly: {
    barRadius: 12,
    cardPaddingTop: 18,
    cardPaddingBottom: 18,
    chartPaddingTop: 20,
    timeLabelMarginTop: 10,
    barGap: 12,
  },
};

const DEFAULT_BAR_MAX_HEIGHT = 142;
const MIN_BAR_HEIGHT = 6;

const DEFAULT_BASE_BAR_WIDTH = 20.81;
const DEFAULT_BAR_GAP = 7;
const DEFAULT_CHART_PADDING_H = 18;

// 하단 시간 라벨 영역
const TIME_LABEL_HORIZONTAL_PADDING = 18;

export default function TaskDurationBarChart({
  data,
  variant = 'daily',
  barMaxHeight = DEFAULT_BAR_MAX_HEIGHT,
  baseBarWidth = DEFAULT_BASE_BAR_WIDTH,
  barGap,
  chartPaddingH = DEFAULT_CHART_PADDING_H,
}: TaskDurationBarChartProps) {
  const { width: windowWidth } = useAppDimensions();

  const config = CHART_CONFIG[variant];

  // variant에 따른 기본 간격
  const resolvedBarGap =
    barGap ?? config.barGap ?? DEFAULT_BAR_GAP;

  const maxMinutes = Math.max(
    ...data.map((item) => item.minutes),
    1,
  );

  const { barWidth } = useMemo(() => {
    const itemCount = data.length;

    if (itemCount === 0) {
      return {
        barWidth: baseBarWidth,
      };
    }

    // 주간 리포트는 막대 너비를 36px로 고정
    if (variant === 'weekly') {
      return {
        barWidth: 36,
      };
    }

    // 일간은 기존 방식 그대로 사용
    const availableWidth =
      windowWidth -
      SPACING.screenH * 2 -
      chartPaddingH * 2;

    const rawWidth =
      (availableWidth -
        (itemCount - 1) * resolvedBarGap) /
      itemCount;

    const width = Math.floor(
      Math.max(rawWidth, baseBarWidth),
    );

    return {
      barWidth: width,
    };
  }, [
    variant,
    windowWidth,
    data.length,
    chartPaddingH,
    resolvedBarGap,
    baseBarWidth,
  ]);

  return (
    <View
      style={[
        styles.card,
        {
          paddingTop: config.cardPaddingTop,
          paddingBottom: config.cardPaddingBottom,
        },
      ]}
    >
      <View style={styles.chartHeader}>
        <AppText
          variant="reportChartTitle"
          color={COLORS.gray500}
        >
          {variant === 'weekly' ? '요일별 집중 시간' : '시간대별 집중도'}
        </AppText>

        <AppText
          variant="reportChartUnit"
          color={COLORS.gray300}
        >
          단위 {variant === 'weekly' ? '시간' : '분'}
        </AppText>
      </View>

      <View
        style={[
          styles.chartAreaWrapper,
          {
            paddingHorizontal: chartPaddingH,
            paddingTop: config.chartPaddingTop,
          },
        ]}
      >
        <View
          style={[
            styles.chartArea,
            {
              gap: resolvedBarGap,
            },
          ]}
        >
          {data.map((item, index) => {
            const hasValue = item.minutes > 0;

            const barHeight = Math.max(
              (item.minutes / maxMinutes) * barMaxHeight,
              MIN_BAR_HEIGHT,
            );

            const isPeak =
              item.minutes === maxMinutes &&
              item.minutes > 0;

            const barColor = isPeak
              ? COLORS.orange400
              : COLORS.gray200;

            // 작은 막대도 자연스럽게 보이도록 radius 제한
            const barRadius = Math.min(
              config.barRadius,
              barHeight / 2,
            );

            return (
              <View
                key={`${item.day}-${index}`}
                style={[
                  styles.barColumn,
                  {
                    width: barWidth,
                    height: barMaxHeight + 19,
                  },
                ]}
              >
                {hasValue && (
                  <AppText
                    variant="reportChartValue"
                    color={
                      isPeak
                        ? COLORS.orange600
                        : COLORS.gray500
                    }
                    style={[
                      styles.barValue,
                      {
                        bottom: barHeight + 6,
                      },
                    ]}
                  >
                    {variant === 'weekly'
                      ? (item.minutes / 60).toFixed(1)
                      : item.minutes}
                  </AppText>
                )}

                <View
                  style={[
                    styles.barTrack,
                    {
                      width: barWidth,
                      height: barMaxHeight,
                      borderRadius: config.barRadius,
                    },
                  ]}
                >
                  {hasValue && (
                    <View
                      style={[
                        styles.bar,
                        {
                          height: barHeight,
                          borderRadius: barRadius,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  )}
                </View>
              </View>
            );
          })}
        </View>
      </View>

      {/* 시간 라벨 */}
      <View
        style={[
          styles.timeLabelRow,
          {
            paddingHorizontal: chartPaddingH,
            gap: resolvedBarGap,
            marginTop: config.timeLabelMarginTop,
          },
        ]}
      >
        {data.map((item, index) => {
          if (!item.day) return null;

          return (
            <View
              key={`${item.day}-${index}-label`}
              style={[
                styles.timeLabelWrapper,
                {
                  width: barWidth,
                },
              ]}
            >
              <AppText
                variant="reportChartTime"
                color={COLORS.gray500}
                numberOfLines={1}
                style={styles.timeLabel}
              >
                {item.day}
              </AppText>
            </View>
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
    borderColor: COLORS.gray200,
    backgroundColor: COLORS.white,
  },

  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: TIME_LABEL_HORIZONTAL_PADDING,
  },

  chartAreaWrapper: {
    width: '100%',
  },

  chartArea: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
  },

  timeLabelRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  timeLabelWrapper: {
    alignItems: 'center',
  },

  timeLabel: {
    width: 20,
    textAlign: 'center',
  },

  barColumn: {
    position: 'relative',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },

  barValue: {
    position: 'absolute',
    width: '100%',
    height: 13,
    lineHeight: 13,
    textAlign: 'center',
  },

  barTrack: {
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  bar: {
    width: '100%',
  },

  chartTitle: {
    color: COLORS.gray500,
  },
});