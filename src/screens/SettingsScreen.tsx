import { useCallback, useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Alert,
    Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ChevronLeft from '../assets/icon/chevron-left-bold.svg';
import ChevronRight from '../assets/icon/chevron-right-bold.svg';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import {
    getRefreshToken,
    clearTokens,
} from '../api/tokenStorage';
import { BASE_URL } from '../api/config';
import {
    getRecurrenceSettings,
    updateRecurrenceSettings,
    getRecurrenceRuleCount,
} from '../api/recurrenceApi';
import { getTimerSettings, updateTimerSettings } from '../api/timerApi';

// 작업 전환 제한 대기 시간(분) 기본값 / 범위
const DEFAULT_WAIT_MINUTES = 10;
const MIN_WAIT_MINUTES = 1;
const MAX_WAIT_MINUTES = 60;

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
    // 서비스 설정 토글 기본값은 모두 off
    // taskSwitchLimitEnabled: 작업 전환 제한, recurrenceEnabled: 반복 일정 추천
    const [taskSwitchLimitEnabled, setTaskSwitchLimitEnabled] = useState(false);
    const [recurrenceEnabled, setRecurrenceEnabled] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // 로그아웃 확인 팝업 상태
    const [logoutModalVisible, setLogoutModalVisible] = useState(false);

    // 반복 일정 추천 켜기/끄기 확인 팝업 ('on'=켜기 확인, 'off'=끄기 확인)
    const [recurrenceModal, setRecurrenceModal] = useState<'on' | 'off' | null>(null);
    const [isUpdatingRecurrence, setIsUpdatingRecurrence] = useState(false);
    const [recurrenceError, setRecurrenceError] = useState<string | null>(null);

    // 작업 전환 제한 팝업 (제한 대기 시간 설정)
    const [waitMinutes, setWaitMinutes] = useState(DEFAULT_WAIT_MINUTES);
    const [waitModalVisible, setWaitModalVisible] = useState(false);
    const [draftMinutes, setDraftMinutes] = useState(DEFAULT_WAIT_MINUTES);
    const [isUpdatingTimer, setIsUpdatingTimer] = useState(false);
    const [timerError, setTimerError] = useState<string | null>(null);

    // 등록된 반복 일정 개수 (반복 일정 관리 박스에 표시)
    const [recurrenceRuleCount, setRecurrenceRuleCount] = useState(0);

    // 화면에 들어올 때마다 서버의 반복 추천 설정과 등록된 반복 일정 개수를 조회
    useFocusEffect(
        useCallback(() => {
            let isActive = true;

            getRecurrenceSettings()
                .then((settings) => {
                    if (
                        isActive &&
                        typeof settings?.repeatRecommendationEnabled === 'boolean'
                    ) {
                        setRecurrenceEnabled(settings.repeatRecommendationEnabled);
                    }
                })
                .catch(() => {});

            getRecurrenceRuleCount()
                .then((count) => {
                    if (isActive) setRecurrenceRuleCount(count);
                })
                .catch(() => {});

            getTimerSettings()
                .then((settings) => {
                    if (!isActive) return;
                    if (typeof settings?.taskSwitchRestrictionEnabled === 'boolean') {
                        setTaskSwitchLimitEnabled(settings.taskSwitchRestrictionEnabled);
                    }
                    if (typeof settings?.taskSwitchWaitMinutes === 'number') {
                        setWaitMinutes(settings.taskSwitchWaitMinutes);
                    }
                })
                .catch(() => {});

            return () => {
                isActive = false;
            };
        }, []),
    );

    const openWaitModal = () => {
        setDraftMinutes(waitMinutes);
        setTimerError(null);
        setWaitModalVisible(true);
    };

    // 작업 전환 제한: 켤 때는 대기 시간 팝업을 띄우고, 끌 때는 바로 반영
    const handleTaskSwitchToggle = async () => {
        if (isUpdatingTimer) return;

        if (!taskSwitchLimitEnabled) {
            openWaitModal();
            return;
        }

        setIsUpdatingTimer(true);
        try {
            await updateTimerSettings({ taskSwitchRestrictionEnabled: false });
            setTaskSwitchLimitEnabled(false);
        } catch (error) {
            Alert.alert(
                '설정 변경 실패',
                error instanceof Error
                    ? error.message
                    : '설정을 변경하지 못했어요. 다시 시도해 주세요.',
            );
        } finally {
            setIsUpdatingTimer(false);
        }
    };

    const closeWaitModal = () => {
        if (isUpdatingTimer) return;
        setWaitModalVisible(false);
        setTimerError(null);
    };

    const changeDraftMinutes = (delta: number) => {
        setDraftMinutes((prev) =>
            Math.min(MAX_WAIT_MINUTES, Math.max(MIN_WAIT_MINUTES, prev + delta)),
        );
    };

    const confirmWaitMinutes = async () => {
        if (isUpdatingTimer) return;

        setIsUpdatingTimer(true);
        setTimerError(null);

        try {
            const result = await updateTimerSettings({
                taskSwitchRestrictionEnabled: true,
                taskSwitchWaitMinutes: draftMinutes,
            });

            setTaskSwitchLimitEnabled(true);
            setWaitMinutes(result?.taskSwitchWaitMinutes ?? draftMinutes);
            setWaitModalVisible(false);
        } catch (error) {
            setTimerError(
                error instanceof Error
                    ? error.message
                    : '설정을 변경하지 못했어요. 다시 시도해 주세요.',
            );
        } finally {
            setIsUpdatingTimer(false);
        }
    };

    // 토글을 누르면 바로 바꾸지 않고, 켜기/끄기 확인 팝업을 먼저 띄움
    const openRecurrenceModal = () => {
        setRecurrenceError(null);
        setRecurrenceModal(recurrenceEnabled ? 'off' : 'on');
    };

    const closeRecurrenceModal = () => {
        if (isUpdatingRecurrence) return;

        setRecurrenceModal(null);
        setRecurrenceError(null);
    };

    // 팝업의 오른쪽 버튼(켜기 / 끄고 초기화)을 눌렀을 때만 설정 변경
    const confirmRecurrenceChange = async () => {
        if (!recurrenceModal || isUpdatingRecurrence) return;

        const nextEnabled = recurrenceModal === 'on';

        setIsUpdatingRecurrence(true);
        setRecurrenceError(null);

        try {
            await updateRecurrenceSettings(nextEnabled);

            setRecurrenceEnabled(nextEnabled);
            setRecurrenceModal(null);

            // 켠 뒤에는 관리 박스에 표시할 반복 일정 개수를 다시 조회
            if (nextEnabled) {
                getRecurrenceRuleCount()
                    .then(setRecurrenceRuleCount)
                    .catch(() => {});
            }
        } catch (error) {
            setRecurrenceError(
                error instanceof Error
                    ? error.message
                    : '설정을 변경하지 못했어요. 다시 시도해 주세요.',
            );
        } finally {
            setIsUpdatingRecurrence(false);
        }
    };

    // 로그아웃 API
    const handleLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        try {
            // 현재 기기의 Refresh Token 조회
            const refreshToken = await getRefreshToken();

            if (!refreshToken) {
                // 저장된 토큰이 없다면 로컬 토큰을 정리하고 로그인 화면으로 이동
                await clearTokens();
                navigation.replace('Login');
                return;
            }

            // 서버 로그아웃 요청
            // 명세에 따라 Authorization 헤더는 보내지 않음
            const response = await fetch(
                `${BASE_URL}/api/v1/auth/logout`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        refreshToken,
                    }),
                },
            );

            // 로그아웃 성공 또는 이미 폐기된 세션
            if (response.status === 204) {
                await clearTokens();
                navigation.replace('Login');
                return;
            }

            // 서버 세션 폐기 여부를 확인할 수 없음
            if (response.status === 503) {
                Alert.alert(
                    '로그아웃 실패',
                    '서버에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.',
                );
                return;
            }

            // 기타 HTTP 오류
            const errorData = await response
                .json()
                .catch(() => null);

            Alert.alert(
                '로그아웃 실패',
                errorData?.message ??
                '로그아웃 중 오류가 발생했습니다. 다시 시도해 주세요.',
            );
        } catch {
            // 네트워크 오류 또는 로컬 토큰 삭제 오류
            Alert.alert(
                '로그아웃 실패',
                '서버 연결 또는 로그인 정보 처리 중 문제가 발생했습니다. 네트워크를 확인한 후 다시 시도해 주세요.',
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    // 팝업에서 로그아웃을 확인한 경우에만 API 실행
    const confirmLogout = () => {
        setLogoutModalVisible(false);
        handleLogout();
    };

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
                        작업 전환 제한
                    </AppText>

                    <Pressable
                        onPress={handleTaskSwitchToggle}
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                taskSwitchLimitEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    taskSwitchLimitEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>


                {/* 제한 대기 시간 (작업 전환 제한이 켜져 있을 때만 표시) */}
                {taskSwitchLimitEnabled && (
                    <Pressable
                        style={styles.toggleCardSecond}
                        onPress={openWaitModal}
                    >
                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.black}
                            style={styles.infoLabel}
                        >
                            제한 대기 시간
                        </AppText>

                        <View style={styles.manageRight}>
                            <AppText
                                variant="settingsRowLabel"
                                color={COLORS.gray500}
                                style={styles.manageCount}
                            >
                                {waitMinutes}분
                            </AppText>

                            <ChevronRight
                                width={7}
                                height={13}
                                color={COLORS.gray600}
                            />
                        </View>
                    </Pressable>
                )}

                <View style={styles.toggleCardSecond}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.infoLabel}
                    >
                        반복 일정 추천
                    </AppText>

                    <Pressable
                        onPress={openRecurrenceModal}
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                recurrenceEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    recurrenceEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>

                {/* 반복 일정 관리 (반복 일정 추천이 켜져 있을 때만 표시) */}
                {recurrenceEnabled && (
                    <Pressable style={styles.toggleCardSecond}>
                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.black}
                            style={styles.infoLabel}
                        >
                            반복 일정 관리
                        </AppText>

                        <View style={styles.manageRight}>
                            <AppText
                                variant="settingsRowLabel"
                                color={COLORS.gray500}
                                style={styles.manageCount}
                            >
                                {recurrenceRuleCount}개
                            </AppText>

                            <ChevronRight
                                width={7}
                                height={13}
                                color={COLORS.gray600}
                            />
                        </View>
                    </Pressable>
                )}
            </View>

            {/* 로그아웃 */}
            <Pressable
                style={styles.logoutButton}
                onPress={() => setLogoutModalVisible(true)}
                disabled={isLoggingOut}
            >
                <AppText
                    variant="settingsRowLabel"
                    color={COLORS.gray800}
                    style={styles.logoutText}
                >
                    {isLoggingOut ? '로그아웃 중...' : '로그아웃'}
                </AppText>
            </Pressable>

            {/* 로그아웃 확인 커스텀 팝업 */}
            <Modal
                visible={logoutModalVisible}
                transparent={true}
                animationType="fade"
                statusBarTranslucent
                onRequestClose={() => setLogoutModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.black}
                            style={styles.modalTitle}
                        >
                            로그아웃 하시겠습니까?
                        </AppText>

                        <View style={styles.modalButtonContainer}>
                            {/* 아니오 버튼 */}
                            <Pressable
                                style={styles.cancelButton}
                                onPress={() =>
                                    setLogoutModalVisible(false)
                                }
                            >
                                <AppText
                                    variant="settingsRowLabel"
                                    color={COLORS.gray500}
                                    style={styles.modalButtonText}
                                >
                                    아니오
                                </AppText>
                            </Pressable>

                            {/* 로그아웃 확인 버튼 */}
                            <Pressable
                                style={styles.confirmButton}
                                onPress={confirmLogout}
                            >
                                <AppText
                                    variant="settingsRowLabel"
                                    color={COLORS.white}
                                    style={styles.modalButtonText}
                                >
                                    로그아웃
                                </AppText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 작업 전환 제한 대기 시간 설정 팝업 */}
            <Modal
                visible={waitModalVisible}
                transparent={true}
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeWaitModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.black}
                            style={styles.modalTitle}
                        >
                            제한 대기 시간
                        </AppText>

                        {/* - [ n분 ] + */}
                        <View style={styles.stepperRow}>
                            <Pressable
                                style={styles.stepperButton}
                                onPress={() => changeDraftMinutes(-1)}
                                disabled={isUpdatingTimer}
                            >
                                <View style={styles.iconBarH} />
                            </Pressable>

                            <AppText
                                variant="settingsRowLabel"
                                color={COLORS.black}
                                style={styles.minutesText}
                            >
                                {draftMinutes}분
                            </AppText>

                            <Pressable
                                style={styles.stepperButton}
                                onPress={() => changeDraftMinutes(1)}
                                disabled={isUpdatingTimer}
                            >
                                <View style={styles.iconBarH} />
                                <View style={styles.iconBarV} />
                            </Pressable>
                        </View>

                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.gray500}
                            style={styles.waitDescription}
                        >
                            1분~60분 사이로 설정할 수 있어요.
                        </AppText>

                        {timerError && (
                            <AppText
                                variant="statCaption"
                                color={COLORS.primary}
                                style={styles.modalErrorText}
                            >
                                {timerError}
                            </AppText>
                        )}

                        <View style={styles.modalButtonContainer}>
                            <Pressable
                                style={styles.cancelButton}
                                onPress={closeWaitModal}
                                disabled={isUpdatingTimer}
                            >
                                <AppText
                                    variant="settingsRowLabel"
                                    color={COLORS.gray500}
                                    style={styles.modalButtonText}
                                >
                                    취소
                                </AppText>
                            </Pressable>

                            <Pressable
                                style={[
                                    styles.confirmButton,
                                    isUpdatingTimer && styles.confirmButtonDisabled,
                                ]}
                                onPress={confirmWaitMinutes}
                                disabled={isUpdatingTimer}
                            >
                                <AppText
                                    variant="settingsRowLabel"
                                    color={COLORS.white}
                                    style={styles.modalButtonText}
                                >
                                    저장
                                </AppText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>

            {/* 반복 일정 추천 켜기/끄기 확인 팝업 */}
            <Modal
                visible={recurrenceModal !== null}
                transparent={true}
                animationType="fade"
                statusBarTranslucent
                onRequestClose={closeRecurrenceModal}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.black}
                            style={styles.modalTitle}
                        >
                            {recurrenceModal === 'off'
                                ? '반복 일정 추천을 끌까요?'
                                : '반복 일정 추천을 켤까요?'}
                        </AppText>

                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.gray500}
                            style={styles.modalDescription}
                        >
                            {recurrenceModal === 'off'
                                ? '추천을 끌 경우 지금까지 쌓인\n반복 패턴이 모두 초기화돼요.'
                                : '자주 하는 작업 패턴을 분석해서\n반복 일정으로 제안해 드려요.'}
                        </AppText>

                        {recurrenceError && (
                            <AppText
                                variant="statCaption"
                                color={COLORS.primary}
                                style={styles.modalErrorText}
                            >
                                {recurrenceError}
                            </AppText>
                        )}

                        <View style={styles.modalButtonContainer}>
                            {/* 아니오 버튼 */}
                            <Pressable
                                style={styles.cancelButton}
                                onPress={closeRecurrenceModal}
                                disabled={isUpdatingRecurrence}
                            >
                                <AppText
                                    variant="settingsRowLabel"
                                    color={COLORS.gray500}
                                    style={styles.modalButtonText}
                                >
                                    아니오
                                </AppText>
                            </Pressable>

                            {/* 켜기 / 끄고 초기화 버튼 */}
                            <Pressable
                                style={[
                                    styles.confirmButton,
                                    isUpdatingRecurrence && styles.confirmButtonDisabled,
                                ]}
                                onPress={confirmRecurrenceChange}
                                disabled={isUpdatingRecurrence}
                            >
                                <AppText
                                    variant="settingsRowLabel"
                                    color={COLORS.white}
                                    style={styles.modalButtonText}
                                >
                                    {recurrenceModal === 'off' ? '끄고 초기화' : '켜기'}
                                </AppText>
                            </Pressable>
                        </View>
                    </View>
                </View>
            </Modal>
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.30)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 21,
    },

    modalContainer: {
        width: '100%',
        maxWidth: 460,
        paddingHorizontal: 30,
        paddingTop: 30,
        paddingBottom: 30,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
    },

    modalTitle: {
        fontFamily: 'SUIT-Bold',
        fontSize: 20,
        lineHeight: 24,
        color: COLORS.black,
        textAlign: 'center',
    },

    // 팝업 설명 문구 (두 줄)
    modalDescription: {
        marginTop: 8,
        fontFamily: 'SUIT-Medium',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray500,
        textAlign: 'center',
    },

    /* 제한 대기 시간 스테퍼 */
    stepperRow: {
        marginTop: 22,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 38,
    },

    stepperButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: COLORS.gray200,
        borderWidth: 1,
        borderColor: COLORS.gray300,
        alignItems: 'center',
        justifyContent: 'center',
    },

    iconBarH: {
        position: 'absolute',
        width: 16,
        height: 4,
        borderRadius: 1,
        backgroundColor: COLORS.gray600,
    },

    iconBarV: {
        position: 'absolute',
        width: 4,
        height: 16,
        borderRadius: 1,
        backgroundColor: COLORS.gray600,
    },

    minutesText: {
        fontFamily: 'SUIT-ExtraBold',
        fontSize: 40,
        lineHeight: 48,
        color: COLORS.black,
        textAlign: 'center',
    },

    waitDescription: {
        marginTop: 14,
        fontFamily: 'SUIT-Medium',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray500,
        textAlign: 'center',
    },

    modalErrorText: {
        marginTop: 10,
        textAlign: 'center',
    },

    modalButtonContainer: {
        width: '100%',
        flexDirection: 'row',
        gap: 12,
        marginTop: 22,
    },

    cancelButton: {
        flex: 1,
        height: 51,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.gray100,
    },

    confirmButton: {
        flex: 1,
        height: 51,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.black,
    },

    confirmButtonDisabled: {
        backgroundColor: COLORS.gray300,
    },

    /* 반복 일정 관리 박스 오른쪽: "N개" + 화살표 */
    manageRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },

    manageCount: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray500,
    },

    modalButtonText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        lineHeight: 20,
        textAlign: 'center',
    },
});