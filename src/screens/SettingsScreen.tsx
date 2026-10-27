import { useState } from 'react';
import { View, StyleSheet, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ChevronLeft from '../assets/icon/chevron-left-bold.svg';
import ChevronRight from '../assets/icon/chevron-right-bold.svg';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
    const [myInfoEnabled, setMyInfoEnabled] = useState(true);
    const [taskSwitchEnabled, setTaskSwitchEnabled] = useState(true);

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            {/* 상단 헤더 */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                    hitSlop={10}
                >
                    <ChevronLeft
                        width={7}
                        height={13}
                        color={COLORS.gray700}
                    />
                </Pressable>

                <AppText
                    variant="settingsHeaderTitle"
                    color={COLORS.black}
                    style={styles.headerTitle}
                >
                    설정
                </AppText>
            </View>

            {/* 개인정보 설정 */}
            <View style={styles.section}>
                <AppText
                    variant="settingsRowLabel"
                    color={COLORS.gray700}
                    style={styles.sectionTitle}
                >
                    개인정보 설정
                </AppText>

                {/* 내 정보관리 */}
                <Pressable
                    style={styles.infoCard}
                    onPress={() => navigation.navigate('MyInfo')}
                >
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.infoLabel}
                    >
                        내 정보관리
                    </AppText>

                    <ChevronRight
                        width={7}
                        height={13}
                        color={COLORS.gray600}
                    />
                </Pressable>
            </View>

            {/* 서비스 설정 */}
            <View style={styles.serviceSection}>
                <AppText
                    variant="settingsRowLabel"
                    color={COLORS.gray700}
                    style={styles.sectionTitle}
                >
                    서비스 설정
                </AppText>

                {/* 내 정보 관리 */}
                <View style={styles.toggleCard}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.infoLabel}
                    >
                        내 정보 관리
                    </AppText>

                    <Pressable
                        onPress={() => setMyInfoEnabled(!myInfoEnabled)}
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                myInfoEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    myInfoEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>

                {/* 작업 전환 제한 */}
                <View style={styles.toggleCardSecond}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.infoLabel}
                    >
                        작업 전환 제한
                    </AppText>

                    <Pressable
                        onPress={() =>
                            setTaskSwitchEnabled(!taskSwitchEnabled)
                        }
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                taskSwitchEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    taskSwitchEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>
            </View>
            <Pressable style={styles.logoutButton}>
                <AppText
                    variant="settingsRowLabel"
                    color={COLORS.gray800}
                    style={styles.logoutText}
                >
                    로그아웃
                </AppText>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.gray100,
        paddingHorizontal: 21,
    },

    header: {
        position: 'relative',
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 17,
    },

    backButton: {
        position: 'absolute',
        left: 0,
        top: 13,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        fontFamily: 'SUIT-Bold',
        fontSize: 18,
        lineHeight: 22,
        color: COLORS.black,
    },

    section: {
        marginTop: 26,
    },

    sectionTitle: {
        fontFamily: 'SUIT-Bold',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray700,
    },

    infoCard: {
        marginTop: 15,
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    infoLabel: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.black,
    },

    /* 서비스 설정 */
    serviceSection: {
        marginTop: 32,
    },

    toggleCard: {
        marginTop: 15,
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    toggleCardSecond: {
        marginTop: 10,
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 12,
        paddingHorizontal: 20,
        paddingVertical: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    /* 토글 */
    toggle: {
        width: 48,
        height: 29,
        borderRadius: 15,
        justifyContent: 'center',
        paddingHorizontal: 3,
    },

    toggleOn: {
        backgroundColor: COLORS.black,
        alignItems: 'flex-end',
    },

    toggleOff: {
        backgroundColor: COLORS.gray300,
        alignItems: 'flex-start',
    },

    toggleCircle: {
        width: 23,
        height: 23,
        borderRadius: 12,
        backgroundColor: COLORS.white,
    },

    circleOn: {
        marginRight: 0,
    },

    circleOff: {
        marginLeft: 0,
    },

    logoutButton: {
        position: 'absolute',
        bottom: 30,
        alignSelf: 'center',
    },

    logoutText: {
        fontFamily: 'SUIT-Medium',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray600,
        textDecorationLine: 'underline',
    },
});