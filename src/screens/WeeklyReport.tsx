import { useEffect, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
    Image,
    Text,
    ActivityIndicator,
} from 'react-native';

import AppText from '../components/AppText';
import { COLORS } from '../constants/token';
import ReportCharacter from '../assets/icon/auth-logo.png';

import RoundedChevron from '../components/RoundedChevron';
import { weeklyReports } from '../data/reportDummyData';
import MessageBubble from '../components/MessageBubble';
import FocusHeatmap from '../components/FocusHeatmap';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import GoalProgressCard from '../components/GoalProgressCard';
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

// API 날짜를 화면 표시용 MM/DD 형식으로 변환
function formatShortDate(date: string): string {
    const [, month, day] = date.split('-');

    return `${month}/${day}`;
}

// 날짜 범위 표시
function formatDateRange(
    from: string,
    to: string,
): string {
    return `${formatShortDate(from)}~${formatShortDate(to)}`;
}

// 주차 제목 생성
function formatWeekTitle(date: string): string {
    const [year, month, day] = date.split('-').map(Number);
    const firstDay = new Date(year, month - 1, 1);

    // 해당 월 첫째 날이 속한 주의 월요일을 기준으로 계산
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

// 초 단위 집중 시간을 기존 화면 형식으로 변환
function formatFocusTime(seconds: number): string {
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    return `${hours}H ${String(minutes).padStart(2, '0')}M`;
}

export default function WeeklyReport() {
    // 처음에는 오늘 날짜가 포함된 주를 조회
    const [selectedDate, setSelectedDate] = useState(
        () => new Date(),
    );

    // 실제 API 응답
    const [apiReport, setApiReport] =
        useState<WeeklyReportResponse | null>(null);

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );

    // 기존 더미 데이터는 API에 없는 항목에 계속 사용
    const [weekIndex, setWeekIndex] = useState(0);

    const contentOpacity = useRef(
        new Animated.Value(1),
    ).current;

    // 날짜가 바뀔 때마다 해당 주의 리포트 조회
    useEffect(() => {
        let isActive = true;

        async function fetchWeeklyReport() {
            setIsLoading(true);
            setErrorMessage(null);
            setApiReport(null);

            try {
                const result = await getWeeklyReport(
                    formatDate(selectedDate),
                );

                if (isActive) {
                    setApiReport(result);
                }
            } catch (error) {
                if (isActive) {
                    setErrorMessage(
                        error instanceof Error
                            ? error.message
                            : '주간 리포트를 불러오지 못했습니다.',
                    );
                }
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

    // 기존 더미 데이터
    // API에서 제공하지 않는 통계와 그래프에 사용
    const dummyReport = weeklyReports[weekIndex];

    // API 응답이 있는 항목만 실제 데이터로 덮어쓰기
    const report = {
        ...dummyReport,

        title: apiReport
            ? formatWeekTitle(apiReport.weekStart)
            : dummyReport.title,

        dateRange: apiReport
            ? formatDateRange(apiReport.from, apiReport.to)
            : dummyReport.dateRange,

        totalFocusTime: apiReport
            ? formatFocusTime(apiReport.totalFocusDurationSeconds)
            : dummyReport.totalFocusTime,

        completedTasks: apiReport
            ? apiReport.completedTodoCount
            : dummyReport.completedTasks,
    };

    // 주간 목표 달성률은 기존 더미 데이터 유지
    const goalPercent =
        report.goalMinutes > 0
            ? Math.round(
                  (report.completedGoalMinutes /
                      report.goalMinutes) *
                      100,
              )
            : 0;

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

    // 주차 변경 애니메이션
    const changeWeek = (direction: -1 | 1) => {
        const nextDate = addDays(
            selectedDate,
            direction * 7,
        );

        if (direction === -1 && isFirstWeek) return;
        if (direction === 1 && isLastWeek) return;

        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (!finished) return;

            // 더미 데이터 인덱스는 기존 데이터 범위 안에서 순환
            setWeekIndex((currentIndex) => {
                const nextIndex =
                    currentIndex + direction;

                return (
                    (nextIndex + weeklyReports.length) %
                    weeklyReports.length
                );
            });

            setSelectedDate(nextDate);

            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
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
                    disabled={isFirstWeek}
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
                        {report.title}
                    </AppText>

                    <AppText
                        variant="reportDate"
                        style={styles.weekDateRange}
                    >
                        {report.dateRange}
                    </AppText>
                </View>

                <Pressable
                    onPress={goNextWeek}
                    disabled={isLastWeek}
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

            <Animated.View
                style={{ opacity: contentOpacity }}
            >
                {/* API 로딩 및 오류 메시지 */}
                {isLoading && (
                    <View style={styles.statusContainer}>
                        <AppText
                            variant="bodySmall"
                            color={COLORS.gray500}
                        >
                            주간 리포트를 불러오는 중이에요.
                        </AppText>
                    </View>
                )}

                {!isLoading && errorMessage && (
                    <View style={styles.errorContainer}>
                        <AppText
                            variant="bodySmall"
                            color={COLORS.gray700}
                        >
                            {errorMessage}
                        </AppText>
                        <AppText
                            variant="bodySmall"
                            color={COLORS.gray500}
                        >
                            현재 기존 더미 데이터로 표시하고 있어요.
                        </AppText>
                    </View>
                )}

                {/* 캐릭터 + 말풍선 */}
                <View style={styles.characterSection}>
                    <Image
                        source={ReportCharacter}
                        style={styles.characterImage}
                        resizeMode="contain"
                    />

                    <View
                        style={styles.messageBubbleWrapper}
                    >
                        <MessageBubble
                            textStyle={styles.messageText}
                        >
                            이번 주는{' '}
                            <Text style={styles.highlightDay}>
                                {report.peakFocusDay}
                            </Text>
                            에 가장 오래 집중했어요.
                        </MessageBubble>
                    </View>
                </View>

                {/* 주간 목표: 기존 더미 데이터 유지 */}
                <View style={styles.goalCardWrapper}>
                    <GoalProgressCard
                        title="주간 목표"
                        percent={goalPercent}
                    />
                </View>

                {/* 통계 카드 */}
                <StatCardGrid
                    items={[
                        {
                            label: '총 집중 시간',
                            value: report.totalFocusTime,
                        },
                        {
                            label: '완료한 작업',
                            value: `${report.completedTasks}개`,
                        },
                        {
                            label: '연속 기록',
                            value: `${report.streak}일`,
                        },
                        {
                            label: '시간 예측 정확도',
                            value: `${report.predictionAccuracy}%`,
                        },
                    ]}
                />

                {/* 시간대별 집중도: 기존 더미 데이터 유지 */}
                <View style={styles.chartSection}>
                    <FocusHeatmap
                        rows={report.focusGrid}
                        responsive
                    />
                </View>

                {/* 요일별 과제 소요 시간: 기존 더미 데이터 유지 */}
                <View style={styles.barChartSection}>
                    <TaskDurationBarChart
                        data={report.taskDuration}
                        variant="weekly"
                        barGap={12}
                    />
                </View>
            </Animated.View>
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

    highlightDay: {
        fontFamily: 'SUIT-ExtraBold',
        color: COLORS.orange600,
        fontSize: 13,
    },

    goalCardWrapper: {
        marginBottom: 20,
    },

    chartSection: {
        marginTop: 20,
    },

    barChartSection: {
        marginTop: 36,
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
