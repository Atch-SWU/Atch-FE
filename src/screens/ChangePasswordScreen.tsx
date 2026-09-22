import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ChangePassword'>;

// 영어 대소문자 + 특수문자(!@#$%*) 각 하나 이상, 8~16자 — 회원가입/비밀번호 찾기 화면과 동일한 규칙.
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%*])[A-Za-z0-9!@#$%*]{8,16}$/;

// TODO: 실제로는 서버에 현재 비밀번호를 검증 요청해야 함 — 지금은 목업 값과 비교.
const MOCK_CURRENT_PASSWORD = 'Password1!';

export default function ChangePasswordScreen({ navigation }: Props) {
    const [currentPassword, setCurrentPassword] = useState('');
    const [currentPasswordError, setCurrentPasswordError] = useState(false);
    const [newPassword, setNewPassword] = useState('');
    const [newPasswordConfirm, setNewPasswordConfirm] = useState('');

    const isNewPasswordValid = PASSWORD_REGEX.test(newPassword);
    const isNewPasswordConfirmed = newPasswordConfirm.length > 0 && newPasswordConfirm === newPassword;
    const showMismatch = newPasswordConfirm.length > 0 && newPasswordConfirm !== newPassword;

    // 현재 비밀번호는 형식 검사가 아니라 "일치 여부"만 확인하는 필드라
    // 체크 배지는 입력 여부 + 이전 제출에서 틀리지 않았는지로만 활성화됨.
    const isCurrentPasswordChecked = currentPassword.length > 0 && !currentPasswordError;

    const handleChangeCurrentPassword = (text: string) => {
        setCurrentPassword(text);
        if (currentPasswordError) setCurrentPasswordError(false);
    };

    const handleFindPassword = () => {
        navigation.navigate('FindPassword');
    };

    const handleSubmit = () => {
        if (currentPassword !== MOCK_CURRENT_PASSWORD) {
            setCurrentPasswordError(true);
            return;
        }
        if (!isNewPasswordValid || !isNewPasswordConfirmed) return;

        // TODO: 비밀번호 변경 API 연동.
        navigation.goBack();
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
                    <AppText variant="statCaption" color={COLORS.tipText} style={styles.hintText}>
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
                <AppText variant="statCaption" color={COLORS.tipText} style={styles.hintText}>
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
                    <AppText variant="statCaption" color={COLORS.tipText} style={styles.hintText}>
                        비밀번호가 일치하지 않습니다.
                    </AppText>
                )}
            </ScrollView>

            <View style={styles.bottomBar}>
                <AppButton
                    label="비밀번호 찾기"
                    variant="soft"
                    textVariant="authButtonText"
                    textColor={COLORS.mutedBtnText}
                    onPress={handleFindPassword}
                    style={[styles.findPasswordBtn, styles.findPasswordBtnBg]}
                />
                <AppButton
                    label="변경하기"
                    variant="primary"
                    textVariant="authButtonText"
                    onPress={handleSubmit}
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
    checkBadgeActive: { backgroundColor: COLORS.grey900 },
    checkBadgeInactive: { backgroundColor: COLORS.grey300 },

    hintText: { marginTop: 6, marginLeft: 8 },

    // 두 버튼은 화면 크기와 무관하게 항상 하단에 붙어야 하므로 ScrollView 밖의
    // 고정 영역(bottomBar)에 배치 — SafeAreaView가 flex 컬럼이라 자동으로 하단에 고정됨.
    bottomBar: { paddingTop: 10, paddingBottom: 6, gap: 16 },
    findPasswordBtn: { height: 52, borderRadius: 16 },
    findPasswordBtnBg: { backgroundColor: COLORS.mutedBtnBg },
    submitBtn: { height: 52, borderRadius: 16 },
});
