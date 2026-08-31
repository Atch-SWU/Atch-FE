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
    dailyReports,
    reportMessages,
} from '../data/reportDummyData';
import MessageBubble from '../components/MessageBubble';
import GoalProgressCard from '../components/GoalProgressCard';
import StatCardGrid from '../components/StatCardGrid';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import FocusSessionList from '../components/FocusSessionList';

// TODO: 실제 시간대별 집중도 데이터 연동 전까지 쓰는 임시 UI용 더미 값 (14개, 6시~24시).
// 5개 지점(6/10/14/18/24시)에만 라벨을 달아 대략적인 느낌만 잡아둔 상태.
const FOCUS_HOUR_BARS = [
    { day: '6시', minutes: 15 },
    { day: '', minutes: 30 },
    { day: '', minutes: 45 },
    { day: '10시', minutes: 60 },
    { day: '', minutes: 80 },
    { day: '', minutes: 95 },
    { day: '', minutes: 105 },
    { day: '14시', minutes: 115 },
    { day: '', minutes: 100 },
    { day: '', minutes: 85 },
    { day: '18시', minutes: 70 },
    { day: '', minutes: 50 },
    { day: '', minutes: 30 },
    { day: '24시', minutes: 10 },
];

export default function DailyReport() {
    const [dayIndex, setDayIndex] = useState(0);

    // 날짜 전환 시 콘텐츠 높이가 순간적으로 스냅되는(깜빡이는) 느낌을 줄이기 위한 페이드 트랜지션.
    const contentOpacity = useRef(new Animated.Value(1)).current;

    const report = dailyReports[dayIndex];

    const message = useMemo(() => {
        const randomIndex = Math.floor(
            Math.random() * reportMessages.length,
        );

        return reportMessages[randomIndex];
    }, [dayIndex]);

    const isFirstDay = dayIndex === 0;
    const isLastDay =
        dayIndex === dailyReports.length - 1;

    const changeDay = (nextIndex: number) => {
        Animated.timing(contentOpacity, {
            toValue: 0,
            duration: 100,
            useNativeDriver: true,
        }).start(() => {
            setDayIndex(nextIndex);

            Animated.timing(contentOpacity, {
                toValue: 1,
                duration: 150,
                useNativeDriver: true,
            }).start();
        });
    };

    const goPreviousDay = () => {
        if (isFirstDay) return;

        changeDay(dayIndex - 1);
    };

    const goNextDay = () => {
        if (isLastDay) return;

        changeDay(dayIndex + 1);
    };

    return (
        <View style={styles.container}>

            {/* 날짜 이동 */}
            <View style={styles.dateHeader}>

                <Pressable
                    onPress={goPreviousDay}
                    disabled={isFirstDay}
                    style={styles.arrowButton}
                >
                    <RoundedChevron
                        direction="left"
                        color={isFirstDay ? COLORS.grey300 : COLORS.grey400}
                    />
                </Pressable>

                <AppText
                    variant="bodyTask"
                    color={COLORS.textMain}
                >
                    {report.date}
                </AppText>

                <Pressable
                    onPress={goNextDay}
                    disabled={isLastDay}
                    style={styles.arrowButton}
                >
                    <RoundedChevron
                        direction="right"
                        color={isLastDay ? COLORS.grey300 : COLORS.grey400}
                    />
                </Pressable>

            </View>

            <Animated.View style={{ opacity: contentOpacity }}>

            {/* 캐릭터 + 랜덤 멘트 */}
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

            {/* 일간 목표 */}
            <View style={styles.goalCardWrapper}>
                <GoalProgressCard
                    title="일간 목표"
                    percent={report.goalPercent}
                />
            </View>

            {/* 오늘의 통계 */}
            <StatCardGrid
                items={[
                    {
                        label: '총 집중 시간',
                        value: report.focusTime,
                    },
                    {
                        label: '완료한 작업',
                        value: `${report.completedTasks}개`,
                    },
                    {
                        label: '중단 횟수',
                        value: `${report.interruptions}회`,
                    },
                    {
                        label: '평균 집중시간',
                        value: report.avgFocusTime,
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

                <TaskDurationBarChart
                    data={FOCUS_HOUR_BARS}
                    chartPaddingH={24}
                    barGap={5}
                    baseBarWidth={4}
                />

            </View>

            {/* 오늘의 집중 세션 */}
            <View style={styles.section}>

                <AppText
                    variant="sectionLabelLg"
                    color={COLORS.grey800}
                >
                    오늘의 집중 세션
                </AppText>

                <View style={styles.sessionListWrapper}>
                    <FocusSessionList sessions={report.focusSessions} />
                </View>

            </View>

            </Animated.View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingBottom: 40,
    },

    dateHeader: {
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

    sessionListWrapper: {
        marginTop: 12,
    },

});
