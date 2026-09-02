import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import TermsAgreementSheet from '../components/TermsAgreementSheet';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUp'>;

// 영어 대소문자 + 특수문자(!@#$%*) 각 하나 이상, 8~16자
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%*])[A-Za-z0-9!@#$%*]{8,16}$/;

export default function SignUpScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');
    const [termsVisible, setTermsVisible] = useState(false);

    const isPasswordValid = PASSWORD_REGEX.test(password);
    const isPasswordConfirmed = passwordConfirm.length > 0 && passwordConfirm === password;
    const showMismatch = passwordConfirm.length > 0 && passwordConfirm !== password;
    const canSubmit =
        email.trim() !== '' &&
        authCode.trim() !== '' &&
        nickname.trim() !== '' &&
        isPasswordValid &&
        isPasswordConfirmed;

    const handleSendAuthCode = () => {
        // TODO: 이메일 인증번호 전송 API 연동.
    };

    const handleVerifyAuthCode = () => {
        // TODO: 인증번호 확인 API 연동.
    };

    const handleSignUp = () => {
        // 아이디/비밀번호 등 필수 입력이 모두 통과된 상태에서만 약관 동의 시트를 띄움.
        if (!canSubmit) return;
        setTermsVisible(true);
    };

    const handleAgreeAndSignUp = () => {
        // TODO: 회원가입 API 연동.
        setTermsVisible(false);
        navigation.replace('SignUpComplete');
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
                    <ChevronLeft width={20} height={20} color={COLORS.headerBackIcon} />
                </Pressable>
                <AppText variant="titleSmall" color={COLORS.textMain} style={styles.headerTitle}>
                    회원가입
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
            >
                {/* 아이디(이메일) */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={styles.firstLabel}>
                    아이디 (이메일)
                </AppText>
                <View style={styles.row}>
                    <View style={styles.rowField}>
                        <FormInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="이메일 주소"
                            variant="filled"
                            placeholderColor={COLORS.grey500}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>
                    <AppButton
                        label="인증번호 전송"
                        variant="primary"
                        textVariant="sectionLabel"
                        textColor={COLORS.grey900}
                        onPress={handleSendAuthCode}
                        style={styles.sendCodeBtn}
                    />
                </View>

                {/* 인증번호 입력 */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={styles.label}>
                    인증번호 입력
                </AppText>
                <View style={styles.row}>
                    <View style={styles.rowField}>
                        <FormInput
                            value={authCode}
                            onChangeText={setAuthCode}
                            placeholder="6자리"
                            variant="filled"
                            placeholderColor={COLORS.grey500}
                            keyboardType="number-pad"
                        />
                    </View>
                    <AppButton
                        label="확인"
                        variant="primary"
                        textVariant="sectionLabel"
                        textColor={COLORS.grey900}
                        onPress={handleVerifyAuthCode}
                        style={styles.verifyBtn}
                    />
                </View>

                {/* 비밀번호 */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={styles.label}>
                    비밀번호
                </AppText>
                <View style={styles.fieldWithBadge}>
                    <FormInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder=""
                        variant="filled"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <View style={[styles.checkBadge, isPasswordValid ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
                        <CheckIcon width={12} height={12} color={COLORS.white} />
                    </View>
                </View>
                <AppText variant="statCaption" color={COLORS.tipText} style={styles.hintText}>
                    영어 대소문자/특수문자 (!@#$%*) 각 하나 이상인 8-16자
                </AppText>

                {/* 비밀번호 확인 */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={styles.label}>
                    비밀번호 확인
                </AppText>
                <View style={styles.fieldWithBadge}>
                    <FormInput
                        value={passwordConfirm}
                        onChangeText={setPasswordConfirm}
                        placeholder=""
                        variant="filled"
                        secureTextEntry
                        autoCapitalize="none"
                    />
                    <View style={[styles.checkBadge, isPasswordConfirmed ? styles.checkBadgeActive : styles.checkBadgeInactive]}>
                        <CheckIcon width={12} height={12} color={COLORS.white} />
                    </View>
                </View>
                {showMismatch && (
                    <AppText variant="statCaption" color={COLORS.tipText} style={styles.hintText}>
                        비밀번호가 일치하지 않습니다.
                    </AppText>
                )}

                {/* 닉네임 */}
                <AppText variant="authFieldLabel" color={COLORS.black} style={styles.label}>
                    닉네임
                </AppText>
                <View style={styles.field}>
                    <FormInput
                        value={nickname}
                        onChangeText={setNickname}
                        placeholder="한/영 2-8자"
                        variant="filled"
                        placeholderColor={COLORS.grey500}
                    />
                </View>
            </ScrollView>

            <View style={styles.bottomBar}>
                <AppButton
                    label="회원 가입"
                    variant="primary"
                    textVariant="authButtonText"
                    onPress={handleSignUp}
                    style={styles.signUpBtn}
                />
            </View>

            {termsVisible && (
                <TermsAgreementSheet
                    visible={termsVisible}
                    onClose={() => setTermsVisible(false)}
                    onAgree={handleAgreeAndSignUp}
                />
            )}
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

    backBtn: {
        width: 30,
        height: 30,
        borderRadius: 15,
        backgroundColor: COLORS.headerBackBg,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    scroll: { flex: 1 },
    content: { paddingBottom: 24 },

    firstLabel: { marginTop: 24 },
    label: { marginTop: 28 },
    field: { marginTop: 8 },

    row: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    rowField: { flex: 1 },

    sendCodeBtn: { width: 118, height: 50, borderRadius: 16, backgroundColor: COLORS.main80 },
    verifyBtn: { width: 76, height: 50, borderRadius: 16, backgroundColor: COLORS.main80 },

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

    bottomBar: { paddingTop: 10, paddingBottom: 6 },
    signUpBtn: { height: 52, borderRadius: 16 },
});
