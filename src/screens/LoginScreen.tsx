import { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

import AuthLogo from '../assets/icon/auth-logo.svg';
import AuthWordmark from '../assets/icon/auth-wordmark.svg';
import GoogleIcon from '../assets/icon/social-google.svg';
import AppleIcon from '../assets/icon/social-apple.svg';
import KakaoIcon from '../assets/icon/social-kakao.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = () => {
        // TODO: 실제 로그인 API 연동 전까지는 임시로 홈으로 이동.
        navigation.replace('Main');
    };

    const handleFindPassword = () => {
        // TODO: 비밀번호 찾기 화면 연결.
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    const handleGoogleLogin = () => {
        // TODO: 구글 소셜 로그인 연동.
    };

    const handleAppleLogin = () => {
        // TODO: 애플 소셜 로그인 연동.
    };

    const handleKakaoLogin = () => {
        // TODO: 카카오 소셜 로그인 연동.
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 48,
                    paddingBottom: insets.bottom + 32,
                },
            ]}
        >
            <View style={styles.topGroup}>
                <View style={styles.logoArea}>
                    <AuthLogo width={104} height={107} />
                    <AuthWordmark width={84} height={37} style={styles.wordmark} />
                </View>

                <View style={styles.form}>
                    <FormInput
                        value={userId}
                        onChangeText={setUserId}
                        placeholder="아이디"
                        variant="filled"
                        placeholderColor={COLORS.authInputPlaceholder}
                        autoCapitalize="none"
                    />
                    <FormInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder="비밀번호"
                        variant="filled"
                        secureTextEntry
                        placeholderColor={COLORS.authInputPlaceholder}
                        autoCapitalize="none"
                    />
                </View>

                <AppButton
                    label="로그인"
                    variant="primary"
                    textVariant="authButtonText"
                    onPress={handleLogin}
                    style={styles.loginButton}
                />

                <View style={styles.linkRow}>
                    <TouchableOpacity onPress={handleFindPassword}>
                        <AppText variant="authLinkText" color={COLORS.black}>
                            비밀번호 찾기
                        </AppText>
                    </TouchableOpacity>

                    <View style={styles.linkDivider} />

                    <TouchableOpacity onPress={handleSignUp}>
                        <AppText variant="authLinkText" color={COLORS.black}>
                            회원가입
                        </AppText>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.socialRow}>
                <TouchableOpacity
                    style={[styles.socialButton, styles.socialButtonOutlined]}
                    onPress={handleGoogleLogin}
                >
                    <GoogleIcon width={22} height={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.socialButtonOutlined]}
                    onPress={handleAppleLogin}
                >
                    <AppleIcon width={22} height={22} />
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.socialButton, styles.socialButtonOutlined, styles.socialButtonKakao]}
                    onPress={handleKakaoLogin}
                >
                    <KakaoIcon width={30} height={30} />
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.screenH,
    },

    topGroup: {},

    logoArea: {
        marginTop: 100,
        alignItems: 'center',
    },

    wordmark: {
        marginTop: 12,
    },

    form: {
        marginTop: 67,
        gap: 12,
    },

    loginButton: {
        width: 155,
        height: 50,
        alignSelf: 'center',
        marginTop: 31,
        borderRadius: 16,
    },

    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 12,
        marginTop: 28,
    },

    linkDivider: {
        width: 1,
        height: 12,
        backgroundColor: COLORS.black,
    },

    socialRow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 17,
        marginTop: 26,
    },

    socialButton: {
        width: 49,
        height: 49,
        borderRadius: 24.5,
        alignItems: 'center',
        justifyContent: 'center',
    },

    socialButtonOutlined: {
        backgroundColor: COLORS.background,
        borderWidth: 1,
        borderColor: COLORS.socialBtnBorder,
    },

    socialButtonKakao: {
        backgroundColor: COLORS.kakaoBtnBg,
    },
});
