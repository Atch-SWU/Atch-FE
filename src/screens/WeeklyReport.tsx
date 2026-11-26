
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
    type WeeklyReportResponse,
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

// 날짜 문자열에서 요일 가져오기
function getWeekdayFromDate(date: string): string {
    const dayIndex = new Date(`${date}T00:00:00`).getDay();

    const weekdays = [
        'SUNDAY',
        'MONDAY',
        'TUESDAY',
        'WEDNESDAY',
        'THURSDAY',
        'FRIDAY',
        'SATURDAY',
    ];

    return weekdays[dayIndex];
}

// 가장 집중한 날짜를 요일로 변환
function getPeakWeekday(
    report: WeeklyReportResponse | null,
): string | null {
    if (!report?.peakFocusDate) {
        return null;
    }

    return getWeekdayFromDate(report.peakFocusDate);
}

// API 날짜별 데이터를 요일별 차트 형식으로 변환
// 응답에 없는 미래 날짜는 0분으로 채움
function convertWeekdayData(
    report: WeeklyReportResponse,
): { day: string; minutes: number }[] {
    const secondsByDate = new Map<string, number>();

    report.days.forEach((item) => {
        secondsByDate.set(
            item.date,
            (item.closedFocusDurationSeconds ?? 0) +
                (item.liveFocusDurationSeconds ?? 0),
        );
    });

    const weekStart = new Date(`${report.weekStart}T00:00:00`);

    return WEEKDAY_ORDER.map((dayOfWeek, index) => {
        const date = formatDate(addDays(weekStart, index));
        const seconds = secondsByDate.get(date) ?? 0;

        return {
            day: WEEKDAY_LABELS[dayOfWeek],
            minutes: seconds / 60,
        };
    });
}

// 히트맵 한 줄의 칸 수 (2시간 단위 12칸)
const HEATMAP_BUCKET_HOURS = 2;
const HEATMAP_BUCKET_COUNT = 24 / HEATMAP_BUCKET_HOURS;

// 집중 시간(초)을 히트맵 농도(0~4)로 변환
function toHeatmapLevel(seconds: number, maxSeconds: number): number {
    if (seconds <= 0 || maxSeconds <= 0) return 0;

    const ratio = seconds / maxSeconds;

    if (ratio <= 0.25) return 1;
    if (ratio <= 0.5) return 2;
    if (ratio <= 0.75) return 3;

    return 4;
}

// 주간 리포트의 days[].focusBuckets를 히트맵 행으로 변환
// 월~일 7줄 x 12칸
// API 응답에 없는 미래 날짜는 빈 칸으로 표시
function buildHeatmapRows(
    report: WeeklyReportResponse,
): { label: string; values: number[] }[] {
    const weekStart = new Date(`${report.weekStart}T00:00:00`);

    const secondsByDay = WEEKDAY_ORDER.map((_, dayIndex) => {
        const date = formatDate(addDays(weekStart, dayIndex));

        const dayData = report.days.find(
            (item) => item.date === date,
        );

        const buckets = new Array<number>(
            HEATMAP_BUCKET_COUNT,
        ).fill(0);

        if (dayData && Array.isArray(dayData.focusBuckets)) {
            dayData.focusBuckets.forEach((item) => {
                if (
                    item.startHour >= 0 &&
                    item.startHour < 24
                ) {
                    const bucketIndex = Math.floor(
                        item.startHour / HEATMAP_BUCKET_HOURS,
                    );

                    buckets[bucketIndex] +=
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

    // 첫 화면부터 로딩 상태로 시작
    const [isLoading, setIsLoading] = useState(true);

    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );

    const contentOpacity = useRef(
        new Animated.Value(1),
    ).current;

    // 날짜가 바뀔 때마다 주간 리포트 API 조회
    useEffect(() => {
        let isActive = true;

        async function fetchWeeklyReport() {
            setIsLoading(true);
            setErrorMessage(null);

            // 이전 주 데이터 즉시 제거
            setApiReport(null);

            try {
                const result = await getWeeklyReport(
                    formatDate(selectedDate),
                );

                if (!isActive) return;

                setApiReport(result);
            } catch (error) {
                if (!isActive) return;

                setErrorMessage(
                    error instanceof Error
                        ? error.message
                        : '주간 리포트를 불러오지 못했습니다.',
                );
            } finally {
                if (isActive) {
                    setIsLoading(false);
                }
            }
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

    // 주간 통계 카드
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
                  label: '연속 기록',
                  value: `${apiReport.focusStreakDays ?? 0}일`,
              },
              {
                  label: '시간 예측 정확도',
                  value:
                      apiReport.aiPrediction?.closenessRate == null
                          ? '-'
                          : `${Math.round(
                                apiReport.aiPrediction.closenessRate * 100,
                            )}%`,
              },
          ]
        : [];

    // 주간 목표 달성률
    // completionRate는 0~1 비율
    const hasGoalPercent = apiReport !== null;

    const goalPercent = Math.round(
        (apiReport?.completionRate ?? 0) * 100,
    );

    // 요일별 집중 시간 데이터
    const taskDuration = apiReport
        ? convertWeekdayData(apiReport)
        : [];

    // 히트맵 데이터
    const heatmapRows = apiReport
        ? buildHeatmapRows(apiReport)
        : [];

    // 가장 집중한 요일 (말풍선용)
    const peakWeekday = getPeakWeekday(apiReport);

    // 보고 있는 주가 이번 주인지 여부
    const isCurrentWeek =
        getWeekStart(selectedDate).getTime() ===
        getWeekStart(new Date()).getTime();

    // 주간 리포트가 있으면 요일별 차트 표시
    const hasTaskDuration = apiReport !== null;

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
        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            setIsLoading(true);
            setApiReport(null);
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

                    {/* 시간대별 집중도 히트맵 */}
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
