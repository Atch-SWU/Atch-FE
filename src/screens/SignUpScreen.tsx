import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { BASE_URL } from '../api/config';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import TermsAgreementSheet from '../components/TermsAgreementSheet';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { getOrCreateDeviceId } from '../utils/deviceId';
import * as SecureStore from 'expo-secure-store';

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

    // 서버에서 발급받은 회원가입 인증 토큰
    const [verificationToken, setVerificationToken] = useState<string | null>(null);

    // 인증번호 확인 API 요청 중인지 여부
    const [isVerifying, setIsVerifying] = useState(false);

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


    const handleSendAuthCode = async () => {
        const trimmedEmail = email.trim();

        try {
            const response = await fetch(
                `${BASE_URL}/api/v1/auth/email/code`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: '*/*',
                    },
                    body: JSON.stringify({
                        email: trimmedEmail,
                    }),
                },
            );

            if (response.status === 204) {
                setAuthCodeSent(true);
                setAuthCode('');
                setAuthVerified(false);
                return;
            }

            const errorData = await response.json().catch(() => null);

            if (response.status === 429) {
                Alert.alert(
                    '잠시만 기다려 주세요',
                    errorData?.message ??
                    '인증번호 재전송은 60초 후에 가능해요.',
                );
                return;
            }

            Alert.alert(
                '전송 실패',
                errorData?.message ??
                `인증번호 전송에 실패했어요. (${response.status})`,
            );
        } catch (error) {
            Alert.alert(
                '네트워크 오류',
                '서버에 연결할 수 없어요. 네트워크를 확인해 주세요.',
            );
        }
    };


    const handleVerifyAuthCode = async () => {
        const trimmedEmail = email.trim();
        const trimmedCode = authCode.trim();

        // 이메일과 인증번호 입력 확인

        if (!/^\d{6}$/.test(trimmedCode)) {
            Alert.alert('입력 확인', '인증번호 6자리를 입력해 주세요.');
            return;
        }

        if (isVerifying) return;

        setIsVerifying(true);

        try {
            const response = await fetch(
                `${BASE_URL}/api/v1/auth/email/verify`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: '*/*',
                    },
                    body: JSON.stringify({
                        email: trimmedEmail,
                        code: trimmedCode,
                    }),
                },
            );

            const responseData = await response.json().catch(() => null);

            // 인증 성공
            if (response.ok) {
                const token = responseData?.verificationToken;

                if (typeof token !== 'string' || !token) {
                    setAuthVerified(false);
                    setVerificationToken(null);

                    Alert.alert(
                        '인증 오류',
                        '인증 토큰을 응답받지 못했어요. 다시 시도해 주세요.',
                    );
                    return;
                }

                setVerificationToken(token);
                setAuthVerified(true);

                Alert.alert('인증 완료', '이메일 인증이 완료되었어요.');
                return;
            }

            // 인증번호 오류 또는 만료
            if (response.status === 400) {
                setAuthVerified(false);
                setVerificationToken(null);

                Alert.alert(
                    '인증 실패',
                    responseData?.message ??
                    '인증번호가 올바르지 않거나 만료되었어요.',
                );
                return;
            }

            // 인증번호 오입력 횟수 초과
            if (response.status === 429) {
                setAuthVerified(false);
                setVerificationToken(null);

                Alert.alert(
                    '인증 시도 초과',
                    responseData?.message ??
                    '인증번호 입력 횟수를 초과했어요. 인증번호를 다시 요청해 주세요.',
                );
                return;
            }

            Alert.alert(
                '인증 실패',
                responseData?.message ??
                `인증번호 확인에 실패했어요. (${response.status})`,
            );
        } catch (error) {
            Alert.alert(
                '네트워크 오류',
                '서버에 연결할 수 없어요. 네트워크를 확인해 주세요.',
            );
        } finally {
            setIsVerifying(false);
        }
    };


    const handleSignUp = () => {
        if (!canSubmit) return;

        setTermsVisible(true);
    };


    const handleAgreeAndSignUp = async () => {
        if (!verificationToken) {
            Alert.alert(
                '인증 필요',
                '이메일 인증을 다시 진행해 주세요.',
            );
            return;
        }

        try {
            // 기기 ID 가져오기
            const deviceId = await getOrCreateDeviceId();

            // 회원가입 요청 데이터
            const requestBody = {
                email: email.trim(),
                password,
                nickname: nickname.trim(),
                verificationToken,
                deviceId,
            };

            const response = await fetch(
                `${BASE_URL}/api/v1/auth/signup`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: '*/*',
                    },
                    body: JSON.stringify(requestBody),
                },
            );

            const responseData = await response
                .json()
                .catch(() => null);

            if (response.status === 201) {
                const { accessToken, refreshToken } = responseData ?? {};

                if (!accessToken || !refreshToken) {
                    Alert.alert(
                        '회원가입 완료',
                        '가입은 완료되었지만 로그인 정보를 확인할 수 없어요. 로그인 화면에서 다시 로그인해 주세요.',
                        [
                            {
                                text: '확인',
                                onPress: () => {
                                    setTermsVisible(false);
                                    navigation.replace('Login');
                                },
                            },
                        ],
                    );
                    return;
                }

                try {
                    await SecureStore.setItemAsync(
                        'atch_access_token',
                        accessToken,
                    );

                    await SecureStore.setItemAsync(
                        'atch_refresh_token',
                        refreshToken,
                    );
                } catch {
                    Alert.alert(
                        '회원가입 완료',
                        '가입은 완료되었지만 로그인 정보를 저장하지 못했어요. 로그인 화면에서 다시 로그인해 주세요.',
                        [
                            {
                                text: '확인',
                                onPress: () => {
                                    setTermsVisible(false);
                                    navigation.replace('Login');
                                },
                            },
                        ],
                    );
                    return;
                }

                setTermsVisible(false);
                navigation.replace('SignUpComplete');
                return;
            }

            const errorCode = responseData?.code;

            if (errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
                Alert.alert(
                    '이메일 인증 필요',
                    '이메일 인증을 다시 진행해 주세요.',
                );
                return;
            }

            if (errorCode === 'EMAIL_ALREADY_REGISTERED') {
                Alert.alert(
                    '이미 가입된 이메일',
                    '기존 계정으로 로그인해 주세요.',
                );
                return;
            }

            if (errorCode === 'SIGNUP_FAILED_REVERIFY') {
                Alert.alert(
                    '가입 상태 확인 필요',
                    '가입 여부를 확인한 뒤 다시 진행해 주세요. 회원가입 요청을 바로 재전송하지 마세요.',
                );
                return;
            }

            if (errorCode === 'SIGNUP_COMPLETED_LOGIN_FAILED') {
                Alert.alert(
                    '회원가입 완료',
                    '계정은 생성되었지만 자동 로그인에 실패했어요. 로그인 화면으로 이동해 주세요.',
                );
                // TODO: 로그인 화면으로 이동
                return;
            }

            Alert.alert(
                '회원가입 실패',
                responseData?.message ??
                `회원가입에 실패했어요. (${response.status})`,
            );
        } catch (error) {
            Alert.alert(
                '연결 오류',
                '서버 응답을 받지 못했어요. 가입 성공 여부를 확인하기 전에는 요청을 다시 보내지 마세요.',
            );
        }
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
                            onChangeText={(text) => {
                                setEmail(text);
                                setAuthVerified(false);
                                setVerificationToken(null);
                                setAuthCode('');
                            }}
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
        borderRadius: 12,
        backgroundColor: COLORS.gray800,
    },

    signUpBtnDisabled: {
        backgroundColor: COLORS.gray300,
    },

    nicknameInput: {
        marginTop: 8,
    }
});