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
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%*])[A-Za-z0-9!@#$%*]{8,16}$/;

export default function SignUpScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [nickname, setNickname] = useState('');

    const [termsVisible, setTermsVisible] = useState(false);

    // 인증번호 전송 완료 여부
    const [authCodeSent, setAuthCodeSent] = useState(false);

    // 인증번호 확인 완료 여부
    const [authVerified, setAuthVerified] = useState(false);

    const isPasswordValid = PASSWORD_REGEX.test(password);

    const isPasswordConfirmed =
        passwordConfirm.length > 0 &&
        passwordConfirm === password;

    const showMismatch =
        passwordConfirm.length > 0 &&
        passwordConfirm !== password;

    // 모든 필수 입력이 완료되어야 회원가입 버튼 활성화
    const canSubmit =
        email.trim() !== '' &&
        authCode.trim() !== '' &&
        authVerified &&
        isPasswordValid &&
        isPasswordConfirmed &&
        nickname.trim() !== '';

    const handleSendAuthCode = () => {
        if (email.trim() === '') return;

        // TODO: 이메일 인증번호 전송 API 연동
        setAuthCodeSent(true);
    };

    const handleVerifyAuthCode = () => {
        // 숫자 6자리일 때만 인증 성공
        if (!/^\d{6}$/.test(authCode)) return;

        // TODO: 인증번호 확인 API 연동
        setAuthVerified(true);
    };

    const handleSignUp = () => {
        if (!canSubmit) return;

        setTermsVisible(true);
    };

    const handleAgreeAndSignUp = () => {
        // TODO: 회원가입 API 연동
        setTermsVisible(false);
        navigation.replace('SignUpComplete');
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={8}
                >
                    <ChevronLeft
                        width={24}
                        height={24}
                        color={COLORS.black}
                    />
                </Pressable>

                <AppText
                    variant="sectionHeader"
                    color={COLORS.black}
                    style={styles.headerTitle}
                >
                    회원가입
                </AppText>

                <View style={styles.headerSpacer} />
            </View>

            <ScrollView
                style={styles.scroll}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
            >
                {/* 아이디 (이메일) */}
                <AppText
                    variant="signupFieldLabel"
                    color={COLORS.gray700}
                    style={styles.firstLabel}
                >
                    아이디 (이메일)
                </AppText>

                <View style={styles.row}>
                    <View style={styles.rowField}>
                        <FormInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="이메일 주소"
                            variant="filled"
                            placeholderColor={COLORS.gray400}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <AppButton
                        label="인증번호 전송"
                        variant="primary"
                        textVariant="signupButtonText"
                        textColor={COLORS.white}
                        onPress={handleSendAuthCode}
                        style={styles.sendCodeBtn}
                    />
                </View>

                {/* 인증번호 입력 */}
                {authCodeSent && (
                    <>
                        <AppText
                            variant="signupFieldLabel"
                            color={COLORS.gray700}
                            style={styles.label}
                        >
                            인증번호 입력
                        </AppText>

                        <View style={styles.row}>
                            <View style={styles.rowField}>
                                <FormInput
                                    value={authCode}
                                    onChangeText={(text) =>
                                        setAuthCode(
                                            text
                                                .replace(/[^0-9]/g, '')
                                                .slice(0, 6)
                                        )
                                    }
                                    placeholder="6자리"
                                    variant="filled"
                                    placeholderColor={COLORS.gray400}
                                    keyboardType="number-pad"
                                />
                            </View>

                            <AppButton
                                label="확인"
                                variant="primary"
                                textVariant="signupButtonText"
                                textColor={COLORS.white}
                                onPress={handleVerifyAuthCode}
                                style={styles.verifyBtn}
                            />
                        </View>
                    </>
                )}

                {/* 비밀번호 / 비밀번호 확인 */}
                {authVerified && (
                    <>
                        <AppText
                            variant="signupFieldLabel"
                            color={COLORS.gray700}
                            style={styles.label}
                        >
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

                            <View
                                style={[
                                    styles.checkBadge,
                                    isPasswordValid
                                        ? styles.checkBadgeActive
                                        : styles.checkBadgeInactive,
                                ]}
                            >
                                <CheckIcon
                                    width={14}
                                    height={14}
                                    color={COLORS.white}
                                />
                            </View>
                        </View>

                        <AppText
                            variant="statCaption"
                            color={COLORS.gray500}
                            style={styles.hintText}
                        >
                            영어 대소문자/특수문자 (!@#$%*) 각 하나 이상인 8-16자
                        </AppText>

                        {/* 비밀번호 확인 */}
                        <AppText
                            variant="signupFieldLabel"
                            color={COLORS.gray700}
                            style={styles.label}
                        >
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

                            <View
                                style={[
                                    styles.checkBadge,
                                    isPasswordConfirmed
                                        ? styles.checkBadgeActive
                                        : styles.checkBadgeInactive,
                                ]}
                            >
                                <CheckIcon
                                    width={14}
                                    height={14}
                                    color={COLORS.white}
                                />
                            </View>
                        </View>

                        {showMismatch && (
                            <AppText
                                variant="statCaption"
                                color={COLORS.error}
                                style={styles.hintText}
                            >
                                비밀번호가 일치하지 않습니다.
                            </AppText>
                        )}

                        {/* 닉네임 */}
                        {isPasswordConfirmed && (
                            <>
                                <AppText
                                    variant="signupFieldLabel"
                                    color={COLORS.gray700}
                                    style={styles.label}
                                >
                                    닉네임
                                </AppText>

                                <View style={styles.nicknameInput}>
                                    <FormInput
                                        value={nickname}
                                        onChangeText={setNickname}
                                        placeholder="닉네임을 입력해주세요"
                                        variant="filled"
                                        placeholderColor={COLORS.gray400}
                                        autoCapitalize="none"
                                    />
                                </View>
                            </>
                        )}
                    </>
                )}
            </ScrollView>

            {/* 회원가입 버튼 */}
            <View style={styles.bottomBar}>
                <AppButton
                    label="회원 가입"
                    variant="primary"
                    textVariant="authButtonText"
                    textColor={COLORS.white}
                    onPress={handleSignUp}
                    style={[
                        styles.signUpBtn,
                        !canSubmit && styles.signUpBtnDisabled,
                    ]}
                />
            </View>

            {/* 약관 동의 */}
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
        backgroundColor: COLORS.white,
        paddingHorizontal: 21,
    },

    // 상단 헤더
    header: {
        height: 30,
        marginTop: 17,
        marginBottom: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },

    backBtn: {
        width: 24,
        height: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },

    headerTitle: {
        flex: 1,
        textAlign: 'center',
    },

    headerSpacer: {
        width: 6,
    },

    scroll: {
        flex: 1,
    },

    content: {
        paddingBottom: 24,
    },

    firstLabel: {
        marginTop: 24,
    },

    label: {
        marginTop: 28,
    },

    row: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },

    rowField: {
        flex: 1,
    },

    sendCodeBtn: {
        width: 118,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.gray800,
    },

    verifyBtn: {
        width: 76,
        height: 50,
        borderRadius: 12,
        backgroundColor: COLORS.gray800,
    },

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

    checkBadgeActive: {
        backgroundColor: COLORS.gray800,
    },

    checkBadgeInactive: {
        backgroundColor: COLORS.gray400,
    },

    hintText: {
        marginTop: 6,
        marginLeft: 8,
    },

    bottomBar: {
        paddingTop: 10,
        paddingBottom: 6,
    },

    signUpBtn: {
        height: 60,
        borderRadius: 16,
        backgroundColor: COLORS.gray800,
    },

    signUpBtnDisabled: {
        backgroundColor: COLORS.gray400,
    },

    nicknameInput: {
        marginTop: 8,
    }
});