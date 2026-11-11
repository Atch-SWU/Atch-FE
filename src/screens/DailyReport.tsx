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
import MessageBubble from '../components/MessageBubble';
import GoalProgressCard from '../components/GoalProgressCard';
import StatCardGrid from '../components/StatCardGrid';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import FocusSessionList from '../components/FocusSessionList';

import {
    getDailyReport,
    getDailyTodoHistory,
    getTimeComparisons,
    getFocusPatterns,
    type DailyReportResponse,
    type DailyTodoHistoryResponse,
    type TimeComparisonResponse,
    type FocusPatternsResponse,
} from '../api/report';
import type { FocusSessionData } from '../data/reportDummyData';
import { formatKoreanDate, toDateString } from '../utils/date';

const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

const pad2 = (n: number) => String(n).padStart(2, '0');

// 날짜에 일수를 더하거나 빼기
function addDays(date: Date, amount: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + amount);

    return result;
}

// 초 단위 시간을 "4H 36M" 형식으로 변환
function formatFocusTime(seconds: number): string {
    const safeSeconds = Math.max(0, seconds);
    const hours = Math.floor(safeSeconds / 3600);
    const minutes = Math.floor((safeSeconds % 3600) / 60);

    return `${hours}H ${pad2(minutes)}M`;
}

// UTC ISO 시각을 서울 기준 "HH:mm"으로 변환
function formatSeoulTime(iso: string | null): string | null {
    if (!iso) return null;

    const ms = new Date(iso).getTime();
    if (Number.isNaN(ms)) return null;

    const seoul = new Date(ms + SEOUL_OFFSET_MS);

    return `${pad2(seoul.getUTCHours())}:${pad2(seoul.getUTCMinutes())}`;
}

// 0~23시를 "오전 10시" 형식으로 변환
function formatHourLabel(hour: number): string {
    const ampm = hour < 12 ? '오전' : '오후';
    const h12 = hour % 12 === 0 ? 12 : hour % 12;

    return `${ampm} ${h12}시`;
}

// 시간대별 집중 시간(초) 24칸으로 합치기 (종료 세션 + 실행 중 세션)
function getHourlySeconds(patterns: FocusPatternsResponse | null): number[] {
    const hourly = new Array<number>(24).fill(0);

    if (!patterns || !Array.isArray(patterns.hours)) return hourly;

    patterns.hours.forEach((item) => {
        if (item.hour >= 0 && item.hour < 24) {
            hourly[item.hour] +=
                (item.closedDurationSeconds ?? 0) +
                (item.liveDurationSeconds ?? 0);
        }
    });

    return hourly;
}

// 2시간 단위 막대 데이터 (0시~24시, 라벨은 구간 시작 시각)
function buildHourBars(
    hourly: number[],
): { day: string; minutes: number }[] {
    const bars: { day: string; minutes: number }[] = [];

    for (let start = 0; start < 24; start += 2) {
        bars.push({
            day: String(start),
            minutes: (hourly[start] + hourly[start + 1]) / 60,
        });
    }

    return bars;
}

// 집중 시간이 가장 긴 시간대 (모든 값이 0이면 null)
function getPeakHour(hourly: number[]): number | null {
    let peakHour: number | null = null;
    let peakSeconds = 0;

    hourly.forEach((seconds, hour) => {
        if (seconds > peakSeconds) {
            peakSeconds = seconds;
            peakHour = hour;
        }
    });

    return peakHour;
}

// 완료한 작업(소요 시간 비교)과 미완료 작업(배정 이력)을 세션 목록으로 변환
function buildSessions(
    comparisons: TimeComparisonResponse | null,
    history: DailyTodoHistoryResponse | null,
): FocusSessionData[] {
    const sessions: FocusSessionData[] = [];
    const completedIds = new Set<number>();

    (comparisons?.items ?? []).forEach((item) => {
        completedIds.add(item.todoId);

        sessions.push({
            time: formatSeoulTime(item.completedAt) ?? '--:--',
            title: item.title,
            durationMinutes: Math.round(
                item.actualDurationSeconds / 60,
            ),
            completed: true,
        });
    });

    (history?.items ?? []).forEach((item) => {
        if (
            item.statusAtDayEnd === 'COMPLETED' ||
            completedIds.has(item.todoId)
        ) {
            return;
        }

        sessions.push({
            time: formatSeoulTime(item.startAtSnapshot) ?? '--:--',
            title: item.currentTitle,
            durationMinutes: null,
            completed: false,
        });
    });

    return sessions.sort((a, b) => a.time.localeCompare(b.time));
}

interface DailyData {
    report: DailyReportResponse;
    history: DailyTodoHistoryResponse | null;
    comparisons: TimeComparisonResponse | null;
    patterns: FocusPatternsResponse | null;
}

export default function DailyReport() {
    // 처음에는 오늘 날짜를 조회
    const [selectedDate, setSelectedDate] = useState(
        () => new Date(),
    );

    const [data, setData] = useState<DailyData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(
        null,
    );

    const contentOpacity = useRef(new Animated.Value(1)).current;

    // 날짜가 바뀔 때마다 API 조회
    useEffect(() => {
        let isActive = true;

        async function fetchDailyReport() {
            setIsLoading(true);
            setErrorMessage(null);
            setData(null);

            const date = toDateString(selectedDate);

            // 일간 집계가 핵심이고, 나머지는 실패해도 화면은 표시
            const [reportResult, historyResult, comparisonResult, patternResult] =
                await Promise.allSettled([
                    getDailyReport(date),
                    getDailyTodoHistory(date),
                    getTimeComparisons(date, date, 0, 100),
                    getFocusPatterns(date, date),
                ]);

            if (!isActive) return;

            if (reportResult.status === 'fulfilled') {
                setData({
                    report: reportResult.value,
                    history:
                        historyResult.status === 'fulfilled'
                            ? historyResult.value
                            : null,
                    comparisons:
                        comparisonResult.status === 'fulfilled'
                            ? comparisonResult.value
                            : null,
                    patterns:
                        patternResult.status === 'fulfilled'
                            ? patternResult.value
                            : null,
                });
            } else {
                setErrorMessage(
                    reportResult.reason instanceof Error
                        ? reportResult.reason.message
                        : '일간 리포트를 불러오지 못했습니다.',
                );
            }

            setIsLoading(false);
        }

        fetchDailyReport();

        return () => {
            isActive = false;
        };
    }, [selectedDate]);

    const todayString = toDateString(new Date());
    const selectedString = toDateString(selectedDate);
    const isToday = selectedString === todayString;

    // 최근 3년보다 오래된 날짜로는 이동하지 않음
    const minimumDate = addDays(new Date(), 1);
    minimumDate.setFullYear(minimumDate.getFullYear() - 3);

    const isFirstDay = selectedString <= toDateString(minimumDate);

    // 오늘보다 미래로는 이동하지 않음
    const isLastDay = selectedString >= todayString;

    const changeDay = (direction: -1 | 1) => {
        if (direction === -1 && isFirstDay) return;
        if (direction === 1 && isLastDay) return;

        const nextDate = addDays(selectedDate, direction);

        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            // 애니메이션 완료 여부와 관계없이 반드시 날짜를 이동
            setIsLoading(true);
            setErrorMessage(null);
            setData(null);

            setSelectedDate(nextDate);

            // 로딩이 끝나 콘텐츠가 다시 나타날 때 보이도록 투명도 복구
            contentOpacity.setValue(1);
        });
    };

    const goPreviousDay = () => changeDay(-1);
    const goNextDay = () => changeDay(1);

    // 화면 표시용 값 계산
    const report = data?.report ?? null;

    const focusSeconds = report
        ? report.closedFocusDurationSeconds +
          report.liveFocusDurationSeconds
        : 0;

    const hourly = getHourlySeconds(data?.patterns ?? null);
    const hourBars = buildHourBars(hourly);
    const peakHour = getPeakHour(hourly);

    const sessions = buildSessions(
        data?.comparisons ?? null,
        data?.history ?? null,
    );

    // 평균 집중시간: 완료한 작업의 실제 집중시간 평균
    const comparisonItems = data?.comparisons?.items ?? [];
    const avgFocusTime =
        comparisonItems.length > 0
            ? `${Math.round(
                  comparisonItems.reduce(
                      (sum, item) => sum + item.actualDurationSeconds,
                      0,
                  ) /
                      comparisonItems.length /
                      60,
              )}M`
            : '0M';

    // 완료율(0~1)이 null(배정 없음·미확정)이면 0%로 취급
    const completionRate = report?.completionRate ?? 0;

    // 모든 값이 0이고 표시할 세션도 없으면 빈 화면을 보여줌
    const isAllZero =
        report !== null &&
        report.completedTodoCount === 0 &&
        focusSeconds === 0 &&
        report.pauseCount === 0 &&
        completionRate === 0 &&
        sessions.length === 0;

    return (
        <View style={styles.container}>
            {/* 날짜 이동 */}
            <View style={styles.dateHeader}>
                <Pressable
                    onPress={goPreviousDay}
                    disabled={isFirstDay || isLoading}
                    style={[styles.arrowButton, { left: 0 }]}
                >
                    <RoundedChevron
                        direction="left"
                        color={
                            isFirstDay
                                ? COLORS.gray300
                                : COLORS.gray700
                        }
                        width={9}
                        height={15}
                        strokeWidth={2.2}
                    />
                </Pressable>

                <AppText
                    variant="reportDate"
                    color={COLORS.black}
                >
                    {formatKoreanDate(selectedDate)}
                </AppText>

                <Pressable
                    onPress={goNextDay}
                    disabled={isLastDay || isLoading}
                    style={[styles.arrowButton, { right: 0 }]}
                >
                    <RoundedChevron
                        direction="right"
                        color={
                            isLastDay
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
                        일간 리포트를 불러오는 중이에요.
                    </AppText>
                </View>
            ) : (
                <Animated.View style={{ opacity: contentOpacity }}>
                    {/* 일간 리포트 API 오류 */}
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

                    {/* 집계 대기 중인 날짜 안내 */}
                    {report?.state === 'PENDING_FINALIZATION' && (
                        <View style={styles.errorContainer}>
                            <AppText
                                variant="bodySmall"
                                color={COLORS.gray500}
                            >
                                기록을 집계하는 중이에요
                            </AppText>
                        </View>
                    )}

                    {report && isAllZero ? (
                        <View style={styles.emptySection}>
                            <Image
                                source={ReportCharacter}
                                style={styles.emptyImage}
                                resizeMode="contain"
                            />

                            <AppText
                                variant="bodyTask"
                                color={COLORS.gray400}
                                style={styles.emptyText}
                            >
                                {isToday
                                    ? '오늘 완료된 작업이 없어요'
                                    : '완료된 작업이 없어요'}
                            </AppText>
                        </View>
                    ) : report ? (
                        <>
                            {/* 캐릭터 이미지 + 멘트 */}
                            <View style={styles.characterSection}>
                                <Image
                                    source={ReportCharacter}
                                    style={styles.characterImage}
                                    resizeMode="contain"
                                />

                                {peakHour !== null && (
                                    <View style={styles.messageBubbleWrapper}>
                                        <MessageBubble
                                            textStyle={styles.messageText}
                                        >
                                            {isToday ? '오늘은' : '이 날은'}{' '}
                                            <Text style={styles.highlightTime}>
                                                {formatHourLabel(peakHour)}
                                            </Text>
                                            에 집중력이 가장 높았어요!
                                        </MessageBubble>
                                    </View>
                                )}
                            </View>

                            {/* 일간 목표 */}
                            <View style={styles.goalCardWrapper}>
                                <GoalProgressCard
                                    title={
                                        isToday ? '오늘 목표' : '일간 목표'
                                    }
                                    percent={Math.round(
                                        completionRate * 100,
                                    )}
                                />
                            </View>

                            {/* 일간 통계 */}
                            <StatCardGrid
                                items={[
                                    {
                                        label: '총 집중 시간',
                                        value: formatFocusTime(focusSeconds),
                                    },
                                    {
                                        label: '완료한 작업',
                                        value: `${report.completedTodoCount}개`,
                                    },
                                    {
                                        label: '일시정지',
                                        value: `${report.pauseCount}회`,
                                    },
                                    {
                                        label: '평균 집중시간',
                                        value: avgFocusTime,
                                    },
                                ]}
                            />

                            {/* 시간대별 집중도 */}
                            {data?.patterns && (
                                <View style={styles.chartSection}>
                                    <TaskDurationBarChart
                                        data={hourBars}
                                        chartPaddingH={24}
                                        barGap={5}
                                        baseBarWidth={4}
                                    />
                                </View>
                            )}

                            {/* 집중 세션 */}
                            <View style={styles.sessionSection}>
                                <AppText
                                    variant="sectionLabelLg"
                                    color={COLORS.black}
                                >
                                    {isToday
                                        ? '오늘의 집중 세션'
                                        : '집중 세션'}
                                </AppText>

                                <View style={styles.sessionListWrapper}>
                                    {sessions.length > 0 ? (
                                        <FocusSessionList
                                            sessions={sessions}
                                        />
                                    ) : (
                                        <AppText
                                            variant="bodySmall"
                                            color={COLORS.gray400}
                                        >
                                            기록된 집중 세션이 없어요
                                        </AppText>
                                    )}
                                </View>
                            </View>
                        </>
                    ) : null}
                </Animated.View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },

    dateHeader: {
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

    chartSection: {
        marginTop: 20,
    },

    sessionSection: {
        marginTop: 36,
    },

    sessionListWrapper: {
        marginTop: 12,
    },

    emptySection: {
        alignItems: 'center',
        paddingTop: 130,
        paddingBottom: 40,
    },

    emptyImage: {
        width: 216,
        height: 180,
        opacity: 0.3,
    },

    emptyText: {
        marginTop: 20,
        fontFamily: 'SUIT-Regular',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray400,
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
