import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { ApiError } from '../api/apiClient';
import { TokenRefreshError } from '../api/tokenRefresh';
import { changePassword } from '../api/accountApi';
import { clearTokens } from '../api/tokenStorage';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

// 영어 대소문자 + 특수문자(!@#$%*) 각 하나 이상, 8~16자 — 회원가입/비밀번호 찾기 화면과 동일한 규칙.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%*])[A-Za-z0-9!@#$%*]{8,16}$/;

export default function ChangePasswordScreen({ navigation }: Props) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [currentPasswordError, setCurrentPasswordError] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const isNewPasswordValid = PASSWORD_REGEX.test(newPassword);
    const isNewPasswordConfirmed = newPasswordConfirm.length > 0 && newPasswordConfirm === newPassword;
    const showMismatch = newPasswordConfirm.length > 0 && newPasswordConfirm !== newPassword;

    // 현재 비밀번호는 형식 검사가 아니라 "일치 여부"만 확인하는 필드라
    // 체크 배지는 입력 여부 + 이전 제출에서 틀리지 않았는지로만 활성화됨.
    const isCurrentPasswordChecked = currentPassword.length > 0 && !currentPasswordError;

    // 세 필드를 모두 조건에 맞게 채웠을 때만 변경하기 버튼 활성화
    // (현재 비밀번호: 입력됨 / 새 비밀번호: 규칙 충족 / 새 비밀번호 확인: 일치)
    const canSubmit =
        currentPassword.length > 0 &&
        isNewPasswordValid &&
        isNewPasswordConfirmed &&
        !isSubmitting;

    const handleChangeCurrentPassword = (text: string) => {
        setCurrentPassword(text);
        if (currentPasswordError) setCurrentPasswordError(false);
    };

    // 로그인 정보를 정리하고 로그인 화면으로 이동
    const goToLogin = async () => {
        await clearTokens();
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    const handleSubmit = async () => {
        if (!canSubmit) return;

        setIsSubmitting(true);
        setSubmitError(null);
        setCurrentPasswordError(false);

        try {
            await changePassword(currentPassword, newPassword);

            // 변경 성공(204): 모든 기기에서 다시 로그인해야 하므로 토큰을 지우고 로그인 화면으로 이동
            await goToLogin();
            Alert.alert('비밀번호가 변경되었어요', '새 비밀번호로 다시 로그인해 주세요.');
        } catch (error) {
            if (error instanceof ApiError && error.status === 403) {
                // 현재 비밀번호 불일치
                setCurrentPasswordError(true);
            } else if (
                (error instanceof ApiError && error.status === 401) ||
                (error instanceof TokenRefreshError && error.status === 401)
            ) {
                // 로그인 정보가 만료됨
                await goToLogin();
            } else if (error instanceof Error) {
                setSubmitError(error.message);
            } else {
                setSubmitError('비밀번호를 변경하지 못했어요. 다시 시도해 주세요.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                    <ChevronLeft width={20} height={20} color={COLORS.black} />
                </Pressable>
                <AppText variant="titleSmall" color={COLORS.textMain} style={styles.headerTitle}>
                    비밀번호 변경
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* 현재 비밀번호 */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={[styles.fieldTitle, styles.firstFieldTitle]}>
                    현재 비밀번호
                </AppText>
                <View style={styles.fieldWithBadge}>
                    <FormInput
                        value={currentPassword}
                        onChangeText={handleChangeCurrentPassword}
                        placeholder=""
                        variant="filled"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <View style={[styles.checkBadge, isCurrentPasswordChecked ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
                        <CheckIcon width={12} height={12} color={COLORS.white} />
                    </View>
                </View>
                {currentPasswordError && (
                    <AppText variant="statCaption" color={COLORS.primary} style={styles.hintText}>
                        비밀번호가 일치하지 않습니다.
                    </AppText>
                )}

                {/* 새 비밀번호 — 위(현재 비밀번호)와의 간격은 평소 30, 에러 문구가 뜨면 더 벌어지게 */}
                <AppText
                    variant="authFieldLabel"
                    color={COLORS.black}
                    style={[styles.fieldTitle, currentPasswordError ? styles.newPasswordTitleError : styles.newPasswordTitleNormal]}
                >
                    새 비밀번호
                </AppText>
                <View style={styles.fieldWithBadge}>
                    <FormInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder=""
                        variant="filled"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <View style={[styles.checkBadge, isNewPasswordValid ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
                        <CheckIcon width={12} height={12} color={COLORS.white} />
                    </View>
                </View>
                <AppText variant="statCaption" color={COLORS.gray500} style={styles.hintText}>
                    영어 대소문자/특수문자 (!@#$%*) 각 하나 이상인 8-16자
                </AppText>

                {/* 새 비밀번호 확인 — 바로 위 힌트 문구와의 간격 31 */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={[styles.fieldTitle, styles.confirmPasswordTitle]}>
                    새 비밀번호 확인
                </AppText>
                <View style={styles.fieldWithBadge}>
                    <FormInput
                        value={newPasswordConfirm}
                        onChangeText={setNewPasswordConfirm}
                        placeholder=""
                        variant="filled"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <View style={[styles.checkBadge, isNewPasswordConfirmed ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
                        <CheckIcon width={12} height={12} color={COLORS.white} />
                    </View>
                </View>
                {showMismatch && (
                    <AppText variant="statCaption" color={COLORS.primary} style={styles.hintText}>
                        비밀번호가 일치하지 않습니다.
                    </AppText>
                )}

                {/* 서버 오류 등 변경 실패 안내 */}
                {submitError && (
                    <AppText variant="statCaption" color={COLORS.primary} style={styles.hintText}>
                        {submitError}
                    </AppText>
                )}
            </ScrollView>

            <View style={styles.bottomBar}>
                <AppButton
                    label="변경하기"
                    variant="primary"
                    textVariant="authButtonText"
                    onPress={handleSubmit}
                    disabled={!canSubmit}
                    style={styles.submitBtn}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.screenH,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 8,
    },

    backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },

    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    scroll: { flex: 1 },
    content: { paddingBottom: 24 },

    // 큰 비밀번호 라벨 세 개 — 화면 왼쪽 끝에서 29만큼 (root의 SPACING.screenH 위에 추가로 들어감)
    fieldTitle: { marginLeft: 29 - SPACING.screenH },
    firstFieldTitle: { marginTop: 24 },
    // 현재 비밀번호 입력창과의 간격 30 — 에러 문구(비밀번호가 일치하지 않습니다)가 뜨면 더 벌어지게
    newPasswordTitleNormal: { marginTop: 30 },
    newPasswordTitleError: { marginTop: 46 },
    // 새 비밀번호 힌트 문구와의 간격 31
    confirmPasswordTitle: { marginTop: 31 },

    fieldWithBadge: {
        marginTop: 8,
        justifyContent: 'center',
    },

    checkBadge: {
        position: 'absolute',
        right: 16,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkBadgeActive: { backgroundColor: COLORS.black },
    checkBadgeInactive: { backgroundColor: COLORS.gray300 },

    hintText: { marginTop: 6, marginLeft: 8 },

    // 변경하기 버튼은 화면 크기와 무관하게 항상 하단에 붙어야 하므로 ScrollView 밖의
    // 고정 영역(bottomBar)에 배치 — SafeAreaView가 flex 컬럼이라 자동으로 하단에 고정됨.
    bottomBar: { paddingTop: 10, paddingBottom: 6 },
    submitBtn: { height: 52, borderRadius: 16 },
});
