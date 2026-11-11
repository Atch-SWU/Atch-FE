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
import {
    requestPasswordResetCode,
    verifyPasswordResetCode,
    resetPassword,
    PasswordResetError,
} from '../api/passwordResetApi';
import useCountdown from '../hooks/useCountdown';
import NoticeModal from '../components/NoticeModal';

const SEND_COOLDOWN_SECONDS = 60;

type Props = NativeStackScreenProps<RootStackParamList, 'FindPassword'>;

// 영어 대소문자 + 특수문자(!@#$%*) 각 하나 이상, 8~16자
const PASSWORD_REGEX =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*[!@#$%*])[A-Za-z0-9!@#$%*]{8,16}$/;

export default function FindPasswordScreen({ navigation }: Props) {
    const [email, setEmail] = useState('');
    const [authCode, setAuthCode] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');

    // 60초 안에 다시 전송을 누르면 띄우는 안내 팝업
    const [cooldownNoticeVisible, setCooldownNoticeVisible] = useState(false);

    // 인증번호 재전송 대기(60초)
    const { remaining: sendCooldown, start: startSendCooldown } = useCountdown();

    // 인증 진행 상태
    const [codeSent, setCodeSent] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [verified, setVerified] = useState(false);
    const [resetToken, setResetToken] = useState<string | null>(null);

    // 인증 영역 / 제출 영역 안내 문구 (웹에서는 Alert가 보이지 않아 인라인으로 표시)
    const [authMessage, setAuthMessage] = useState<{ text: string; error: boolean } | null>(null);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // 이메일을 바꾸면 기존 인증은 무효
    const handleEmailChange = (text: string) => {
        setEmail(text);
        setCodeSent(false);
        setVerified(false);
        setResetToken(null);
        setAuthCode('');
        setAuthMessage(null);
    };

    const isPasswordValid = PASSWORD_REGEX.test(password);

    const isPasswordConfirmed =
        passwordConfirm.length > 0 &&
        passwordConfirm === password;

    const showMismatch =
        passwordConfirm.length > 0 &&
        passwordConfirm !== password;

    const canSubmit =
        email.trim() !== '' &&
        verified &&
        resetToken !== null &&
        isPasswordValid &&
        isPasswordConfirmed &&
        !isSubmitting;

    const handleSendAuthCode = async () => {
        const trimmedEmail = email.trim();

        if (!trimmedEmail) {
            setAuthMessage({ text: '이메일을 입력해 주세요.', error: true });
            return;
        }
        if (isSending || verified) return;

        // 60초가 지나기 전에는 전송하지 않고 안내 팝업만 표시
        if (sendCooldown > 0) {
            setCooldownNoticeVisible(true);
            return;
        }

        setIsSending(true);
        setAuthMessage(null);

        try {
            await requestPasswordResetCode(trimmedEmail);

            setCodeSent(true);
            setVerified(false);
            setResetToken(null);
            setAuthCode('');
            startSendCooldown(SEND_COOLDOWN_SECONDS);
            setAuthMessage({
                text: '인증번호를 보냈어요. 메일이 오지 않으면 60초 뒤에 다시 요청해 주세요.',
                error: false,
            });
        } catch (error) {
            const message =
                error instanceof PasswordResetError && error.status === 429
                    ? error.message || '인증번호 재전송은 60초 후에 가능해요.'
                    : error instanceof Error
                        ? error.message
                        : '인증번호 전송에 실패했어요.';

            setAuthMessage({ text: message, error: true });
        } finally {
            setIsSending(false);
        }
    };

    const handleVerifyAuthCode = async () => {
        const trimmedCode = authCode.trim();

        if (!codeSent) {
            setAuthMessage({ text: '먼저 인증번호를 전송해 주세요.', error: true });
            return;
        }
        if (!/^\d{6}$/.test(trimmedCode)) {
            setAuthMessage({ text: '인증번호 6자리를 입력해 주세요.', error: true });
            return;
        }
        if (isVerifying) return;

        setIsVerifying(true);
        setAuthMessage(null);

        try {
            const token = await verifyPasswordResetCode(email.trim(), trimmedCode);

            setResetToken(token);
            setVerified(true);
            setAuthMessage({ text: '인증이 완료되었어요.', error: false });
        } catch (error) {
            setVerified(false);
            setResetToken(null);

            const message =
                error instanceof PasswordResetError && error.status === 429
                    ? '인증번호 입력 횟수를 초과했어요. 인증번호를 다시 요청해 주세요.'
                    : error instanceof PasswordResetError && error.status === 400
                        ? error.message || '인증번호가 올바르지 않거나 만료되었어요.'
                        : error instanceof Error
                            ? error.message
                            : '인증번호 확인에 실패했어요.';

            setAuthMessage({ text: message, error: true });
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResetPassword = async () => {
        if (!canSubmit || !resetToken) return;

        setIsSubmitting(true);
        setSubmitError(null);

        try {
            await resetPassword(email.trim(), resetToken, password);

            Alert.alert('비밀번호 재설정 완료', '새 비밀번호로 로그인해 주세요.');
            navigation.replace('Login');
        } catch (error) {
            // 인증 증명은 1회용이라 실패하면 이메일 인증부터 다시 진행
            if (error instanceof PasswordResetError && error.status === 400) {
                setVerified(false);
                setResetToken(null);
                setCodeSent(false);
                setAuthCode('');
                setSubmitError(
                    `${error.message} 이메일 인증을 다시 진행해 주세요.`,
                );
            } else {
                setSubmitError(
                    error instanceof Error
                        ? error.message
                        : '비밀번호를 재설정하지 못했어요. 다시 시도해 주세요.',
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                    hitSlop={10}
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
                    비밀번호 재설정
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
                {/* 아이디(이메일) */}
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
                            onChangeText={handleEmailChange}
                            placeholder="이메일 주소"
                            editable={!codeSent && !isSending}
                            variant="filled"
                            placeholderColor={COLORS.gray400}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                    </View>

                    <AppButton
                        label={isSending ? '전송 중...' : '인증번호 전송'}
                        variant="primary"
                        textVariant="signupButtonText"
                        textColor={COLORS.white}
                        onPress={handleSendAuthCode}
                        style={styles.sendCodeBtn}
                        disabled={isSending}
                        locked={verified}
                    />
                </View>

                {/* 인증번호 입력 */}
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
                                    text.replace(/[^0-9]/g, '').slice(0, 6)
                                )
                            }
                            placeholder="6자리"
                            editable={!verified}
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
                        disabled={isVerifying}
                        locked={verified}
                    />
                </View>

                {authMessage && (
                    <AppText
                        variant="statCaption"
                        color={authMessage.error ? COLORS.error : COLORS.gray600}
                        style={styles.hintText}
                    >
                        {authMessage.text}
                    </AppText>
                )}

                {/* 비밀번호 재설정 */}
                <AppText
                    variant="signupFieldLabel"
                    color={COLORS.gray700}
                    style={styles.label}
                >
                    비밀번호 재설정
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
                    color={COLORS.gray600}
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

                {submitError && (
                    <AppText
                        variant="statCaption"
                        color={COLORS.error}
                        style={styles.hintText}
                    >
                        {submitError}
                    </AppText>
                )}
            </ScrollView>

            <View style={styles.bottomBar}>
                <AppButton
                    label="비밀번호 재설정"
                    variant="primary"
                    textVariant="authButtonText"
                    textColor={COLORS.white}
                    onPress={handleResetPassword}
                    style={[
                        styles.resetBtn,
                        !canSubmit && styles.resetBtnDisabled,
                    ]}
                />
            </View>

            <NoticeModal
                visible={cooldownNoticeVisible}
                message="인증번호 재전송은 60초 이후에 할 수 있어요."
                onClose={() => setCooldownNoticeVisible(false)}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.white,
        paddingHorizontal: 21,
    },

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
        width: 24,
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

    resetBtn: {
        height: 60,
        borderRadius: 12,
    },

    resetBtnDisabled: {
        backgroundColor: COLORS.gray300,
    },
});