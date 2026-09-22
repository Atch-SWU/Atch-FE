import { useMemo, useRef, useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Animated,
} from 'react-native';

import AppText from '../components/AppText';
import { COLORS } from '../constants/token';
import ReportCharacter from '../assets/icon/match.svg';

import RoundedChevron from '../components/RoundedChevron';
import {
    weeklyReports,
    reportMessages,
} from '../data/reportDummyData';
import MessageBubble from '../components/MessageBubble';
import FocusHeatmap from '../components/FocusHeatmap';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import GoalProgressCard from '../components/GoalProgressCard';
import StatCardGrid from '../components/StatCardGrid';

export default function WeeklyReport() {
    const [weekIndex, setWeekIndex] = useState(0);

    // 주차 전환 시 콘텐츠 높이가 순간적으로 스냅되는(깜빡이는) 느낌을 줄이기 위한 페이드 트랜지션.
    const contentOpacity = useRef(new Animated.Value(1)).current;

    const report = weeklyReports[weekIndex];

    const goalPercent = Math.round(
        (report.completedGoalMinutes / report.goalMinutes) * 100
    );

    const message = useMemo(() => {
        const randomIndex = Math.floor(
            Math.random() * reportMessages.length,
        );

        return reportMessages[randomIndex];
    }, [weekIndex]);

    const isFirstWeek = weekIndex === 0;
    const isLastWeek =
        weekIndex === weeklyReports.length - 1;

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
                    style={styles.arrowButton}
                >
                    <RoundedChevron
                        direction="left"
                        color={isFirstWeek ? COLORS.grey300 : COLORS.grey400}
                    />
                </Pressable>

                <AppText
                    variant="bodyTask"
                    color={COLORS.textMain}
                >
                    {report.title}
                </AppText>

                <Pressable
                    onPress={goNextWeek}
                    disabled={isLastWeek}
                    style={styles.arrowButton}
                >
                    <RoundedChevron
                        direction="right"
                        color={isLastWeek ? COLORS.grey300 : COLORS.grey400}
                    />
                </Pressable>

            </View>

            <Animated.View style={{ opacity: contentOpacity }}>

            {/* 캐릭터 + 말풍선 */}
            <View style={styles.characterSection}>

                <ReportCharacter
                    width={160}
                    height={170}
                />

                <View style={styles.messageBubbleWrapper}>
                    <MessageBubble textStyle={styles.messageText}>
                        {message}
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
            <View style={styles.section}>

                <AppText
                    variant="sectionLabelLg"
                    color={COLORS.grey800}
                >
                    시간대별 집중도
                </AppText>

                <FocusHeatmap rows={report.focusGrid} responsive />

            </View>

            {/* 요일별 과제 소요 시간 */}
            <View style={styles.section}>

                <AppText
                    variant="sectionLabelLg"
                    color={COLORS.grey800}
                >
                    요일별 과제 소요 시간
                </AppText>

                <TaskDurationBarChart data={report.taskDuration} />

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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 34,
    },

    arrowButton: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },

    characterSection: {
        alignItems: 'center',
        paddingBottom: 31,
    },


    messageBubbleWrapper: {
        width: '100%',
        marginTop: 12,
        alignItems: 'center',
    },

    messageText: {
        fontSize: 14,
        lineHeight: 20,
        color: COLORS.textMain,
    },

    goalCardWrapper: {
        marginBottom: 21,
    },

    section: {
        marginTop: 36,
    },

});
