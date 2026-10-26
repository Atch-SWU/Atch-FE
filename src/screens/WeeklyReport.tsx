import { useRef, useState } from 'react';
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
import { weeklyReports } from '../data/reportDummyData';
import MessageBubble from '../components/MessageBubble';
import FocusHeatmap from '../components/FocusHeatmap';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import GoalProgressCard from '../components/GoalProgressCard';
import StatCardGrid from '../components/StatCardGrid';

export default function WeeklyReport() {
    const [weekIndex, setWeekIndex] = useState(0);

    const contentOpacity = useRef(new Animated.Value(1)).current;

    const report = weeklyReports[weekIndex];

    const goalPercent = Math.round(
        (report.completedGoalMinutes / report.goalMinutes) * 100
    );


    const isFirstWeek = weekIndex === 0;
    const isLastWeek = weekIndex === weeklyReports.length - 1;

    const changeWeek = (nextIndex: number) => {
        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            setWeekIndex(nextIndex);

            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        });
    };

    const goPreviousWeek = () => {
        if (isFirstWeek) return;

        changeWeek(weekIndex - 1);
    };

    const goNextWeek = () => {
        if (isLastWeek) return;

        changeWeek(weekIndex + 1);
    };

    return (
        <View style={styles.container}>
            {/* 주차 이동 */}
            <View style={styles.weekHeader}>
                <Pressable
                    onPress={goPreviousWeek}
                    disabled={isFirstWeek}
                    style={[styles.arrowButton, { left: 0 }]}
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
                    style={[styles.arrowButton, { right: 0 }]}
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

            <Animated.View style={{ opacity: contentOpacity }}>
                {/* 캐릭터 + 말풍선 */}
                <View style={styles.characterSection}>
                    <Image
                        source={ReportCharacter}
                        style={styles.characterImage}
                        resizeMode="contain"
                    />

                    <View style={styles.messageBubbleWrapper}>
                        <MessageBubble textStyle={styles.messageText}>
                            이번 주는{' '}
                            <Text style={styles.highlightDay}>
                                {report.peakFocusDay}
                            </Text>
                            에 가장 오래 집중했어요.
                        </MessageBubble>
                    </View>
                </View>

                {/* 주간 목표 */}
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

                {/* 시간대별 집중도 */}
                <View style={styles.chartSection}>
                    <FocusHeatmap
                        rows={report.focusGrid}
                        responsive
                    />
                </View>

                {/* 요일별 과제 소요 시간 */}
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
});