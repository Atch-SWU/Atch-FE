import { useEffect, useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import WithdrawModal from '../components/WithdrawModal';
import ChevronLeft from '../assets/icon/chevron-left-bold.svg';
import ChevronRight from '../assets/icon/chevron-right-bold.svg';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { ApiError } from '../api/apiClient';
import { TokenRefreshError } from '../api/tokenRefresh';
import { withdrawAccount } from '../api/accountApi';
import { clearTokens, getUserEmail } from '../api/tokenStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'MyInfo'>;

export default function MyInfoScreen({ navigation }: Props) {
    // 로그인·회원가입 때 저장해 둔 사용자 이메일 (없으면 '-')
    const [userEmail, setUserEmail] = useState<string | null>(null);

    useEffect(() => {
        let isActive = true;

        getUserEmail()
            .then((email) => {
                if (isActive) setUserEmail(email);
            })
            .catch(() => {});

        return () => {
            isActive = false;
        };
    }, []);

    const [snsOneEnabled, setSnsOneEnabled] = useState(true);
    const [snsTwoEnabled, setSnsTwoEnabled] = useState(false);
    const [snsThreeEnabled, setSnsThreeEnabled] = useState(false);

    // 회원 탈퇴 모달
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [isWithdrawing, setIsWithdrawing] = useState(false);
    const [withdrawError, setWithdrawError] = useState<string | null>(null);

    // 로그인 정보를 정리하고 로그인 화면으로 이동
    const goToLogin = async () => {
        await clearTokens();
        setShowWithdrawModal(false);
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    // 탈퇴하기: 현재 비밀번호로 본인 확인 후 계정 삭제
    const handleWithdraw = async (currentPassword: string) => {
        if (isWithdrawing) return;

        setIsWithdrawing(true);
        setWithdrawError(null);

        try {
            await withdrawAccount(currentPassword);

            // 탈퇴 완료(204): 저장된 토큰을 지우고 로그인 화면으로 이동
            await goToLogin();
        } catch (error) {
            if (error instanceof ApiError && error.status === 403) {
                // 현재 비밀번호 불일치
                setWithdrawError('비밀번호가 일치하지 않습니다.');
            } else if (
                (error instanceof ApiError && error.status === 401) ||
                (error instanceof TokenRefreshError && error.status === 401)
            ) {
                // 로그인 정보가 만료되었거나 이미 삭제된 계정
                await goToLogin();
            } else if (error instanceof Error) {
                setWithdrawError(error.message);
            } else {
                setWithdrawError(
                    '탈퇴 처리 중 오류가 발생했습니다. 다시 시도해 주세요.',
                );
            }
        } finally {
            setIsWithdrawing(false);
        }
    };

    const closeWithdrawModal = () => {
        setShowWithdrawModal(false);
        setWithdrawError(null);
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
                    내 정보 관리
                </AppText>
            </View>

            {/* 내 정보 */}
            <View style={styles.section}>
                <AppText
                    variant="settingsRowLabel"
                    color={COLORS.gray700}
                    style={styles.sectionTitle}
                >
                    내 정보
                </AppText>

                {/* 이메일 */}
                <View style={styles.infoCard}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.cardLabel}
                    >
                        이메일
                    </AppText>

                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.gray400}
                        style={styles.email}
                    >
                        {userEmail ?? '-'}
                    </AppText>
                </View>

                {/* 비밀번호 변경 */}
                <Pressable
                    style={styles.infoCardSpacing}
                    onPress={() => navigation.navigate('ChangePassword')}
                >
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.cardLabel}
                    >
                        비밀번호 변경
                    </AppText>

                    <ChevronRight
                        width={7}
                        height={13}
                        color={COLORS.gray600}
                    />
                </Pressable>

                {/* 회원 탈퇴 */}
                <Pressable
                    style={styles.infoCardSpacing}
                    onPress={() => {
                        setWithdrawError(null);
                        setShowWithdrawModal(true);
                    }}
                >
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.cardLabel}
                    >
                        회원 탈퇴
                    </AppText>

                    <ChevronRight
                        width={7}
                        height={13}
                        color={COLORS.gray600}
                    />
                </Pressable>
            </View>

            {/* SNS 계정 연동 */}
            <View style={styles.snsSection}>
                <AppText
                    variant="settingsRowLabel"
                    color={COLORS.gray700}
                    style={styles.sectionTitle}
                >
                    SNS 계정 연동
                </AppText>

                <View style={styles.snsCard}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.cardLabel}
                    >
                        Apple 연동
                    </AppText>

                    <Pressable
                        onPress={() => setSnsOneEnabled(!snsOneEnabled)}
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                snsOneEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    snsOneEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>

                <View style={styles.snsCardSpacing}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.cardLabel}
                    >
                        카카오 연동
                    </AppText>

                    <Pressable
                        onPress={() => setSnsTwoEnabled(!snsTwoEnabled)}
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                snsTwoEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    snsTwoEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>

                <View style={styles.snsCardSpacing}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.cardLabel}
                    >
                        Google 연동
                    </AppText>

                    <Pressable
                        onPress={() => setSnsThreeEnabled(!snsThreeEnabled)}
                        hitSlop={8}
                    >
                        <View
                            style={[
                                styles.toggle,
                                snsThreeEnabled
                                    ? styles.toggleOn
                                    : styles.toggleOff,
                            ]}
                        >
                            <View
                                style={[
                                    styles.toggleCircle,
                                    snsThreeEnabled
                                        ? styles.circleOn
                                        : styles.circleOff,
                                ]}
                            />
                        </View>
                    </Pressable>
                </View>
            </View>

            {/* 회원 탈퇴 모달 */}
            <WithdrawModal
                visible={showWithdrawModal}
                onCancel={closeWithdrawModal}
                onConfirm={handleWithdraw}
                isSubmitting={isWithdrawing}
                errorMessage={withdrawError}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.gray100,
        paddingHorizontal: 21,
    },

    /* 상단 헤더 */
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

    /* 내 정보 */
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

    infoCardSpacing: {
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

    cardLabel: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.black,
    },

    email: {
        fontFamily: 'SUIT-Medium',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray400,
    },

    /* SNS 계정 연동 */
    snsSection: {
        marginTop: 32,
    },

    snsCard: {
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

    snsCardSpacing: {
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

});