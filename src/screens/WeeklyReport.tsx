import { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
    Image,
    Text,
} from 'react-native';

import AppText from '../components/AppText';
import { COLORS } from '../constants/token';
import ReportCharacter from '../assets/icon/auth-logo.png';

import RoundedChevron from '../components/RoundedChevron';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import GoalProgressCard from '../components/GoalProgressCard';
import MessageBubble from '../components/MessageBubble';
import FocusHeatmap from '../components/FocusHeatmap';
import StatCardGrid from '../components/StatCardGrid';

import {
    getWeeklyReport,
    getFocusPatterns,
    getTimeComparisons,
    type WeeklyReportResponse,
    type FocusPatternsResponse,
    type TimeComparisonResponse,
} from '../api/report';

// 날짜를 YYYY-MM-DD 형식으로 변환
function formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

// 날짜에 일수를 더하거나 빼기
function addDays(date: Date, amount: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);

    return result;
}

// 해당 날짜가 포함된 주의 월요일 구하기
function getWeekStart(date: Date): Date {
    const result = new Date(date);
    result.setHours(0, 0, 0, 0);

    const day = result.getDay();
    const daysFromMonday = (day + 6) % 7;

    result.setDate(result.getDate() - daysFromMonday);

    return result;
}

// 날짜를 MM/DD 형식으로 변환
function formatShortDate(date: string): string {
    const [, month, day] = date.split('-');

    return `${month}/${day}`;
}

// 날짜 범위 표시
function formatDateRange(from: string, to: string): string {
    return `${formatShortDate(from)}~${formatShortDate(to)}`;
}

// 주차 제목 생성
function formatWeekTitle(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);

    const firstWeekStart = getWeekStart(firstDay);
    const currentWeekStart = getWeekStart(
        new Date(year, month - 1, day),
    );

    const weekNumber =
        Math.floor(
            (currentWeekStart.getTime() -
                firstWeekStart.getTime()) /
                (7 * 24 * 60 * 60 * 1000),
        ) + 1;

    return `${month}월 ${weekNumber}주차`;
}

// 초 단위 집중 시간을 화면 표시 형식으로 변환
function formatFocusTime(seconds: number): string {
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    return `${hours}H ${String(minutes).padStart(2, '0')}M`;
}

// API 요일 값을 한글 요일로 변환
const WEEKDAY_LABELS: Record<string, string> = {
    MONDAY: '월',
    TUESDAY: '화',
    WEDNESDAY: '수',
    THURSDAY: '목',
    FRIDAY: '금',
    SATURDAY: '토',
    SUNDAY: '일',
};

// 말풍선에 쓰는 요일 이름
const WEEKDAY_FULL_LABELS: Record<string, string> = {
    MONDAY: '월요일',
    TUESDAY: '화요일',
    WEDNESDAY: '수요일',
    THURSDAY: '목요일',
    FRIDAY: '금요일',
    SATURDAY: '토요일',
    SUNDAY: '일요일',
};

// 집중 시간이 가장 긴 요일 (모든 값이 0이면 null)
function getPeakWeekday(
    focusPatterns: FocusPatternsResponse | null,
): string | null {
    if (!focusPatterns || !Array.isArray(focusPatterns.weekdays)) {
        return null;
    }

    let peakDay: string | null = null;
    let peakSeconds = 0;

    focusPatterns.weekdays.forEach((item) => {
        if (
            typeof item.totalDurationSeconds === 'number' &&
            item.totalDurationSeconds > peakSeconds
        ) {
            peakSeconds = item.totalDurationSeconds;
            peakDay = item.dayOfWeek;
        }
    });

    return peakDay;
}

// 월~일 순서
const WEEKDAY_ORDER = [
    'MONDAY',
    'TUESDAY',
    'WEDNESDAY',
    'THURSDAY',
    'FRIDAY',
    'SATURDAY',
    'SUNDAY',
];

// API 요일별 데이터를 차트 형식으로 변환
// 응답에 없는 요일이나 값이 없는 요일은 0분으로 채워 항상 월~일 7개를 반환
function convertWeekdayData(
    focusPatterns: FocusPatternsResponse,
): { day: string; minutes: number }[] {
    const secondsByDay = new Map<string, number>();

    if (Array.isArray(focusPatterns.weekdays)) {
        focusPatterns.weekdays.forEach((item) => {
            secondsByDay.set(
                item.dayOfWeek,
                typeof item.totalDurationSeconds === 'number'
                    ? item.totalDurationSeconds
                    : 0,
            );
        });
    }

    return WEEKDAY_ORDER.map((dayOfWeek) => ({
        day: WEEKDAY_LABELS[dayOfWeek],
        minutes: (secondsByDay.get(dayOfWeek) ?? 0) / 60,
    }));
}

// 히트맵 한 줄의 칸 수 (2시간 단위 12칸: 0~2시, 2~4시, ... 22~24시)
const HEATMAP_BUCKET_HOURS = 2;
const HEATMAP_BUCKET_COUNT = 24 / HEATMAP_BUCKET_HOURS;

// 시간 예측 정확도(%) 계산
// 완료한 작업마다 최종 선택된 예상시간(직접 입력/AI) 대비 실제시간 오차 비율을 구하고,
// 100%에서 평균 오차 비율(최대 100%)을 뺀 값. 계산할 수 있는 작업이 없으면 null
function calcPredictionAccuracy(
    comparisons: TimeComparisonResponse | null,
): number | null {
    const items = comparisons?.items ?? [];
    const errorRatios: number[] = [];

    items.forEach((item) => {
        const useAi = item.selectedEstimateType === 'AI';

        const estimatedMinutes = useAi
            ? item.aiEstimatedDurationMinutes
            : item.userEstimatedDurationMinutes;

        const errorSeconds = useAi
            ? item.aiErrorSeconds
            : item.userErrorSeconds;

        if (
            typeof estimatedMinutes === 'number' &&
            estimatedMinutes > 0 &&
            typeof errorSeconds === 'number'
        ) {
            errorRatios.push(
                Math.min(
                    Math.abs(errorSeconds) / (estimatedMinutes * 60),
                    1,
                ),
            );
        }
    });

    if (errorRatios.length === 0) return null;

    const meanRatio =
        errorRatios.reduce((sum, ratio) => sum + ratio, 0) /
        errorRatios.length;

    return Math.round((1 - meanRatio) * 100);
}

// 집중 시간(초)을 히트맵 농도(0~4)로 변환
// 이번 주 가장 집중한 칸 대비 비율로 단계를 나눔. 값이 없거나 0이면 0(빈 칸)
function toHeatmapLevel(seconds: number, maxSeconds: number): number {
    if (seconds <= 0 || maxSeconds <= 0) return 0;

    const ratio = seconds / maxSeconds;

    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;

    return 4;
}

// 월~일 요일별 시간대 집중 패턴을 히트맵 행(월~일 7줄 x 12칸)으로 변환
// 응답이 없거나(null) 조회하지 않은 날은 빈 칸으로 채움
function buildHeatmapRows(
    patternsByDay: (FocusPatternsResponse | null)[],
): { label: string; values: number[] }[] {
    const secondsByDay = WEEKDAY_ORDER.map((_, dayIndex) => {
        const buckets = new Array<number>(HEATMAP_BUCKET_COUNT).fill(0);
        const patterns = patternsByDay[dayIndex];

        if (patterns && Array.isArray(patterns.hours)) {
            patterns.hours.forEach((item) => {
                if (item.hour >= 0 && item.hour < 24) {
                    buckets[Math.floor(item.hour / HEATMAP_BUCKET_HOURS)] +=
                        (item.closedDurationSeconds ?? 0) +
                        (item.liveDurationSeconds ?? 0);
                }
            });
        }

        return buckets;
    });

    const maxSeconds = Math.max(0, ...secondsByDay.flat());

    return WEEKDAY_ORDER.map((dayOfWeek, dayIndex) => ({
        label: WEEKDAY_LABELS[dayOfWeek],
        values: secondsByDay[dayIndex].map((seconds) =>
            toHeatmapLevel(seconds, maxSeconds),
        ),
    }));
}

export default function WeeklyReport() {
    // 처음에는 오늘 날짜가 포함된 주를 조회
    const [selectedDate, setSelectedDate] = useState(
        () => new Date(),
    );

    // 주간 리포트 API 응답
    const [apiReport, setApiReport] =
        useState<WeeklyReportResponse | null>(null);

    // 집중 패턴 API 응답
    const [apiFocusPatterns, setApiFocusPatterns] =
        useState<FocusPatternsResponse | null>(null);

    // 소요 시간 비교 API 응답 (시간 예측 정확도 계산용)
    const [apiComparisons, setApiComparisons] =
        useState<TimeComparisonResponse | null>(null);

    // 요일별(월~일) 시간대 집중 패턴 — 히트맵용. 조회하지 않았거나 실패한 날은 null
    const [apiDailyPatterns, setApiDailyPatterns] = useState<
        (FocusPatternsResponse | null)[]
    >([]);

    // 첫 화면부터 로딩 상태로 시작
    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );

    const contentOpacity = useRef(
        new Animated.Value(1),
    ).current;

    // 날짜가 바뀔 때마다 API 조회
    useEffect(() => {
        let isActive = true;

        async function fetchWeeklyReport() {
            setIsLoading(true);
            setErrorMessage(null);

            // 이전 주 데이터 즉시 제거
            setApiReport(null);
            setApiFocusPatterns(null);
            setApiDailyPatterns([]);
            setApiComparisons(null);

            const weekStart = getWeekStart(selectedDate);
            const weekEnd = addDays(weekStart, 6);

            // 집중 패턴 API는 미래 날짜를 허용하지 않으므로 오늘까지로 제한
            const today = new Date();
            const from = formatDate(weekStart);
            const to = formatDate(weekEnd > today ? today : weekEnd);

            // 히트맵용: 월~일 각 날짜의 시간대별 집중 패턴 (미래 날짜는 조회하지 않음)
            const dayDates = WEEKDAY_ORDER.map((_, index) =>
                addDays(weekStart, index),
            );

            // 주간 리포트·집중 패턴·요일별 집중 패턴을 독립적으로 조회
            const [
                [weeklyResult, focusResult, comparisonResult],
                dailyResults,
            ] = await Promise.all([
                    Promise.allSettled([
                        getWeeklyReport(formatDate(selectedDate)),
                        getFocusPatterns(from, to),
                        getTimeComparisons(from, to, 0, 100),
                    ]),
                    Promise.allSettled(
                        dayDates.map((dayDate) =>
                            dayDate > today
                                ? Promise.resolve<FocusPatternsResponse | null>(
                                      null,
                                  )
                                : getFocusPatterns(
                                      formatDate(dayDate),
                                      formatDate(dayDate),
                                  ),
                        ),
                    ),
                ]);

            if (!isActive) return;

            // 주간 리포트 API 결과
            if (weeklyResult.status === 'fulfilled') {
                setApiReport(weeklyResult.value);
            } else {
                setErrorMessage(
                    weeklyResult.reason instanceof Error
                        ? weeklyResult.reason.message
                        : '주간 리포트를 불러오지 못했습니다.',
                );
            }

            // 집중 패턴 API 결과
            if (focusResult.status === 'fulfilled') {
                setApiFocusPatterns(focusResult.value);
            } else {
                setApiFocusPatterns(null);
            }

            // 소요 시간 비교 결과 (실패하면 시간 예측 정확도는 '-'로 표시)
            setApiComparisons(
                comparisonResult.status === 'fulfilled'
                    ? comparisonResult.value
                    : null,
            );

            // 요일별 집중 패턴 결과 (실패한 날은 빈 칸으로 표시)
            setApiDailyPatterns(
                dailyResults.map((result) =>
                    result.status === 'fulfilled' ? result.value : null,
                ),
            );

            setIsLoading(false);
        }

        fetchWeeklyReport();

        return () => {
            isActive = false;
        };
    }, [selectedDate]);

    // 날짜 이동 헤더
    const currentWeekStart = getWeekStart(selectedDate);
    const currentWeekEnd = addDays(currentWeekStart, 6);

    const weekTitle = apiReport
        ? formatWeekTitle(apiReport.weekStart)
        : formatWeekTitle(formatDate(currentWeekStart));

    const weekDateRange = apiReport
        ? formatDateRange(apiReport.from, apiReport.to)
        : formatDateRange(
              formatDate(currentWeekStart),
              formatDate(currentWeekEnd),
          );

    // 시간 예측 정확도 (계산할 데이터가 없으면 null)
    const predictionAccuracy = calcPredictionAccuracy(apiComparisons);

    // 주간 리포트를 받아왔다면 값이 0(또는 null)이어도 통계 카드는 0으로 표시
    const statItems: { label: string; value: string }[] = apiReport
        ? [
              {
                  label: '총 집중 시간',
                  value: formatFocusTime(
                      apiReport.totalFocusDurationSeconds ?? 0,
                  ),
              },
              {
                  label: '완료한 작업',
                  value: `${apiReport.completedTodoCount ?? 0}개`,
              },
              {
                  // 연속 기록은 서버 API가 아직 없어 '-'로 표시
                  label: '연속 기록',
                  value: '-',
              },
              {
                  label: '시간 예측 정확도',
                  value:
                      predictionAccuracy === null
                          ? '-'
                          : `${predictionAccuracy}%`,
              },
          ]
        : [];

    // 주간 목표 달성률
    // completionRate는 0~1 비율이므로 100을 곱해 퍼센트로 변환
    // 배정이 없거나 미확정(null)이어도 리포트를 받아왔다면 0%로 표시
    const hasGoalPercent = apiReport !== null;

    const goalPercent = Math.round(
        (apiReport?.completionRate ?? 0) * 100,
    );

    // 요일별 집중 시간 데이터
    const taskDuration = apiFocusPatterns
        ? convertWeekdayData(apiFocusPatterns)
        : [];

    // 히트맵 데이터 (값이 없으면 빈 칸)
    const heatmapRows = buildHeatmapRows(apiDailyPatterns);

    // 가장 집중한 요일 (말풍선용)
    const peakWeekday = getPeakWeekday(apiFocusPatterns);

    // 보고 있는 주가 이번 주인지 여부
    const isCurrentWeek =
        getWeekStart(selectedDate).getTime() ===
        getWeekStart(new Date()).getTime();

    // 요일 데이터가 하나라도 있으면 표시
    // 모든 값이 0이어도 차트 표시
    const hasTaskDuration = taskDuration.length > 0;

    // 최근 3년보다 오래된 날짜로는 이동하지 않음
    const minimumDate = new Date();
    minimumDate.setFullYear(
        minimumDate.getFullYear() - 3,
    );

    const isFirstWeek =
        getWeekStart(selectedDate).getTime() <=
        getWeekStart(minimumDate).getTime();

    // 현재 주보다 미래로는 이동하지 않음
    const nextWeekDate = addDays(selectedDate, 7);

    const isLastWeek =
        getWeekStart(nextWeekDate).getTime() >
        getWeekStart(new Date()).getTime();

    // 주차 변경
    const changeWeek = (direction: -1 | 1) => {
        const nextDate = addDays(
            selectedDate,
            direction * 7,
        );

        if (direction === -1 && isFirstWeek) return;
        if (direction === 1 && isLastWeek) return;

        // 콘텐츠를 먼저 페이드아웃
        // (애니메이션 대상 뷰가 사라지기 전에 끝나도록 로딩 상태는 그 이후에 변경)
        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            // 애니메이션 완료 여부와 관계없이 반드시 날짜를 이동
            setIsLoading(true);

            setApiReport(null);
            setApiFocusPatterns(null);
            setApiDailyPatterns([]);
            setApiComparisons(null);
            setErrorMessage(null);

            setSelectedDate(nextDate);

            // 로딩이 끝나 콘텐츠가 다시 나타날 때 보이도록 투명도 복구
            contentOpacity.setValue(1);
        });
    };

    const goPreviousWeek = () => {
        changeWeek(-1);
    };

    const goNextWeek = () => {
        changeWeek(1);
    };

    return (
        <View style={styles.container}>
            {/* 주차 이동 */}
            <View style={styles.weekHeader}>
                <Pressable
                    onPress={goPreviousWeek}
                    disabled={isFirstWeek || isLoading}
                    style={[
                        styles.arrowButton,
                        { left: 0 },
                    ]}
                >
                    <RoundedChevron
                        direction="left"
                        color={
                            isFirstWeek
                                ? COLORS.gray300
                                : COLORS.gray700
                        }
                        width={9}
                        height={15}
                        strokeWidth={2.2}
                    />
                </Pressable>

                <View style={styles.weekTitleWrapper}>
                    <AppText
                        variant="reportDate"
                        color={COLORS.black}
                    >
                        {weekTitle}
                    </AppText>

                    <AppText
                        variant="reportDate"
                        style={styles.weekDateRange}
                    >
                        {weekDateRange}
                    </AppText>
                </View>

                <Pressable
                    onPress={goNextWeek}
                    disabled={isLastWeek || isLoading}
                    style={[
                        styles.arrowButton,
                        { right: 0 },
                    ]}
                >
                    <RoundedChevron
                        direction="right"
                        color={
                            isLastWeek
                                ? COLORS.gray300
                                : COLORS.gray700
                        }
                        width={9}
                        height={15}
                        strokeWidth={2.2}
                    />
                </Pressable>
            </View>

            {/* 로딩 중에는 기존 리포트 콘텐츠를 렌더링하지 않음 */}
            {isLoading ? (
                <View style={styles.statusContainer}>
                    <AppText
                        variant="bodySmall"
                        color={COLORS.gray500}
                    >
                        주간 리포트를 불러오는 중이에요.
                    </AppText>
                </View>
            ) : (
                <Animated.View
                    style={{ opacity: contentOpacity }}
                >
                    {/* 주간 리포트 API 오류 */}
                    {errorMessage && (
                        <View style={styles.errorContainer}>
                            <AppText
                                variant="bodySmall"
                                color={COLORS.gray700}
                            >
                                {errorMessage}
                            </AppText>
                        </View>
                    )}

                    {/* 캐릭터 이미지 + 멘트 */}
                    {apiReport && (
                        <View style={styles.characterSection}>
                            <Image
                                source={ReportCharacter}
                                style={styles.characterImage}
                                resizeMode="contain"
                            />

                            {peakWeekday !== null && (
                                <View style={styles.messageBubbleWrapper}>
                                    <MessageBubble
                                        textStyle={styles.messageText}
                                    >
                                        {isCurrentWeek ? '이번 주는' : '이 주는'}{' '}
                                        <Text style={styles.highlightTime}>
                                            {WEEKDAY_FULL_LABELS[peakWeekday] ??
                                                peakWeekday}
                                        </Text>
                                        에 집중력이 가장 높았어요!
                                    </MessageBubble>
                                </View>
                            )}
                        </View>
                    )}

                    {/* 주간 목표 달성률 */}
                    {hasGoalPercent && (
                        <View style={styles.goalCardWrapper}>
                            <GoalProgressCard
                                title="주간 목표"
                                percent={goalPercent}
                            />
                        </View>
                    )}

                    {/* API에서 받은 통계만 표시 */}
                    {statItems.length > 0 && (
                        <StatCardGrid items={statItems} />
                    )}

                    {/* 시간대별 집중도 히트맵 (데이터가 없으면 빈 칸으로 표시) */}
                    {apiReport && (
                        <View style={styles.heatmapSection}>
                            <FocusHeatmap rows={heatmapRows} responsive />
                        </View>
                    )}

                    {/* 요일별 집중 시간 차트 */}
                    {hasTaskDuration && (
                        <View style={styles.barChartSection}>
                            <TaskDurationBarChart
                                data={taskDuration}
                                variant="weekly"
                                barGap={12}
                            />
                        </View>
                    )}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },

    weekHeader: {
        height: 30,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 34,
        position: 'relative',
    },

    arrowButton: {
        position: 'absolute',
        top: 0,
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.white,
        alignItems: 'center',
        justifyContent: 'center',
    },

    characterSection: {
        alignItems: 'center',
        paddingBottom: 28,
    },

    characterImage: {
        width: 180,
        height: 150,
    },

    messageBubbleWrapper: {
        width: '100%',
        marginTop: 16,
        alignItems: 'center',
    },

    messageText: {
        fontFamily: 'SUIT-Bold',
        fontSize: 13,
        lineHeight: 20,
        color: COLORS.gray700,
    },

    highlightTime: {
        fontFamily: 'SUIT-ExtraBold',
        color: COLORS.orange600,
        fontSize: 13,
    },

    goalCardWrapper: {
        marginBottom: 20,
    },

    heatmapSection: {
        marginTop: 24,
    },

    barChartSection: {
        marginTop: 20,
    },

    weekTitleWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    weekDateRange: {
        fontFamily: 'SUIT-Medium',
        fontSize: 12,
        lineHeight: 17,
        color: COLORS.gray500,
    },

    statusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginBottom: 16,
    },

    errorContainer: {
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 12,
        marginBottom: 16,
    },
});
