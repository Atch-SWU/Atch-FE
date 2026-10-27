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
import { dailyReports } from '../data/reportDummyData';
import MessageBubble from '../components/MessageBubble';
import GoalProgressCard from '../components/GoalProgressCard';
import StatCardGrid from '../components/StatCardGrid';
import TaskDurationBarChart from '../components/TaskDurationBarChart';
import FocusSessionList from '../components/FocusSessionList';

// TODO: 실제 시간대별 집중도 데이터 연동 전까지 쓰는 임시 UI용 더미 값 (6시~24시).
const FOCUS_HOUR_BARS = [
    { day: '6', minutes: 4 },
    { day: '8', minutes: 22 },
    { day: '10', minutes: 48 },
    { day: '12', minutes: 14 },
    { day: '14', minutes: 9 },
    { day: '16', minutes: 30 },
    { day: '18', minutes: 21 },
    { day: '20', minutes: 7 },
    { day: '22', minutes: 3 },
    { day: '24', minutes: 0 },
];

export default function DailyReport() {
    const [dayIndex, setDayIndex] = useState(0);

    const contentOpacity = useRef(new Animated.Value(1)).current;

    const report = dailyReports[dayIndex];

    const isFirstDay = dayIndex === 0;
    const isLastDay = dayIndex === dailyReports.length - 1;

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
                    {report.date} {report.dayOfWeek}
                </AppText>

                <Pressable
                    onPress={goNextDay}
                    disabled={isLastDay}
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

            <Animated.View style={{ opacity: contentOpacity }}>
                {/* 완료한 작업이 없는 경우 */}
                {report.completedTasks === 0 ? (
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
                            오늘 완료된 작업이 없어요
                        </AppText>
                    </View>
                ) : (
                    <>
                        {/* 캐릭터 이미지 + 랜덤 멘트 */}
                        <View style={styles.characterSection}>
                            <Image
                                source={ReportCharacter}
                                style={styles.characterImage}
                                resizeMode="contain"
                            />

                            <View style={styles.messageBubbleWrapper}>
                                <MessageBubble
                                    textStyle={styles.messageText}
                                >
                                    오늘은{' '}
                                    <Text style={styles.highlightTime}>
                                        {report.peakFocusTime}
                                    </Text>
                                    에 집중력이 가장 높았어요!
                                </MessageBubble>
                            </View>
                        </View>

                        {/* 일간 목표 */}
                        <View style={styles.goalCardWrapper}>
                            <GoalProgressCard
                                title="오늘 목표"
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
                        <View style={styles.chartSection}>
                            <TaskDurationBarChart
                                data={FOCUS_HOUR_BARS}
                                chartPaddingH={24}
                                barGap={5}
                                baseBarWidth={4}
                            />
                        </View>

                        {/* 오늘의 집중 세션 */}
                        <View style={styles.sessionSection}>
                            <AppText
                                variant="sectionLabelLg"
                                color={COLORS.black}
                            >
                                오늘의 집중 세션
                            </AppText>

                            <View style={styles.sessionListWrapper}>
                                <FocusSessionList
                                    sessions={report.focusSessions}
                                />
                            </View>
                        </View>
                    </>
                )}
            </Animated.View>
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
});