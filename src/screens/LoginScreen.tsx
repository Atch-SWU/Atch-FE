import { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
    Alert,
} from 'react-native';
import { saveTokens } from '../api/tokenStorage';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';
import { BASE_URL } from '../api/config';
import { getOrCreateDeviceId } from '../utils/deviceId';
import AtchLogo from '../assets/icon/atch-logo.svg';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

export default function LoginScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();

    const [userId, setUserId] = useState('');
    const [password, setPassword] = useState('');
    const [isLoggingIn, setIsLoggingIn] = useState(false);

    const handleLogin = async () => {
        const email = userId.trim();

        // 입력값 확인
        if (!email || !password) {
            Alert.alert(
                '로그인 안내',
                '이메일과 비밀번호를 입력해 주세요.'
            );
            return;
        }

        // 중복 로그인 요청 방지
        if (isLoggingIn) {
            return;
        }

        setIsLoggingIn(true);

        try {
            // 기기 고유 ID 가져오기
            const deviceId = await getOrCreateDeviceId();

            // 로그인 API 요청
            const response = await fetch(
                `${BASE_URL}/api/v1/auth/login`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Accept: 'application/json',
                    },
                    body: JSON.stringify({
                        email,
                        password,
                        deviceId,
                    }),
                }
            );

            // 응답 데이터 읽기
            const data = await response.json().catch(() => null);

            // 로그인 성공
            if (response.status === 200) {
                if (
                    !data?.accessToken ||
                    !data?.refreshToken
                ) {
                    Alert.alert(
                        '로그인 오류',
                        '서버 응답에 토큰 정보가 없습니다.'
                    );
                    return;
                }

                // 토큰 안전하게 저장
                try {
                    await saveTokens(data.accessToken, data.refreshToken);
                } catch (storageError) {
                    console.error('토큰 저장 오류:', storageError);

                    Alert.alert(
                        '로그인 오류',
                        '로그인 정보 저장에 실패했어요. 다시 시도해 주세요.'
                    );

                    return;
                }

                // 토큰 저장 성공 후 메인 화면으로 이동
                navigation.replace('Main');
                return;
            }

            // 이메일 또는 비밀번호 오류
            if (response.status === 401) {
                Alert.alert(
                    '로그인 실패',
                    '이메일 또는 비밀번호를 확인해 주세요.'
                );
                return;
            }

            // 그 외 서버 오류
            Alert.alert(
                '로그인 실패',
                data?.message ??
                `로그인에 실패했습니다. (${response.status})`
            );
        } catch (error) {
            console.error('로그인 오류:', error);

            Alert.alert(
                '연결 오류',
                '서버에 연결할 수 없습니다. 네트워크와 서버 상태를 확인해 주세요.'
            );
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleFindPassword = () => {
        navigation.navigate('FindPassword');
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    const handleSnsLogin = (
        type: 'kakao' | 'google' | 'apple'
    ) => {
        // TODO: SNS 로그인 API 연동
        console.log(`${type} 로그인`);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: 160,
                    paddingBottom: insets.bottom + 32,
                },
            ]}
        >

            {/* 로그인 상단 이미지 */}
            <View style={styles.logoSection}>
                <Image
                    source={require('../assets/icon/auth-logo.png')}
                    style={styles.topImage}
                    resizeMode="contain"
                />

                <AtchLogo
                    width={98}
                    height={39}
                />
            </View>

            {/* 입력 필드 */}
            <View style={styles.form}>
                <FormInput
                    value={userId}
                    onChangeText={setUserId}
                    placeholder="아이디"
                    variant="filled"
                    placeholderColor={COLORS.gray400}
                    textColor={COLORS.gray800}
                    focusBorderColor={COLORS.gray400}
                    autoCapitalize="none"
                    boxStyle={styles.input}
                />

                <FormInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="비밀번호"
                    variant="filled"
                    placeholderColor={COLORS.gray400}
                    textColor={COLORS.gray800}
                    focusBorderColor={COLORS.gray400}
                    secureTextEntry
                    autoCapitalize="none"
                    boxStyle={styles.input}
                />
            </View>

            {/* 로그인 버튼 */}
            <AppButton
                label={isLoggingIn ? '로그인 중...' : '로그인'}
                variant="primary"
                textVariant="authButtonText"
                onPress={handleLogin}
                style={styles.loginButton}
            />

            {/* 비밀번호 찾기 / 회원가입 */}
            <View style={styles.linkRow}>
                <TouchableOpacity onPress={handleSignUp}>
                    <AppText
                        variant="authLinkText"
                        color={COLORS.gray600}
                    >
                        회원가입
                    </AppText>
                </TouchableOpacity>

                <View style={styles.linkDivider} />

                <TouchableOpacity onPress={handleFindPassword}>
                    <AppText
                        variant="authLinkText"
                        color={COLORS.gray600}
                    >
                        비밀번호 찾기
                    </AppText>
                </TouchableOpacity>
            </View>

            {/* SNS 로그인 영역 */}
            <View style={styles.snsSection}>
                <AppText
                    variant="snsLoginText"
                    color={COLORS.gray400}
                >
                    SNS 계정으로 로그인하기
                </AppText>

                <View style={styles.snsButtonRow}>
                    <TouchableOpacity
                        style={[
                            styles.snsButton,
                            styles.googleButton,
                        ]}
                        onPress={() => handleSnsLogin('google')}
                    >
                        <Image
                            source={require('../assets/icon/social-google.png')}
                            style={styles.snsIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.snsButton,
                            styles.appleButton,
                        ]}
                        onPress={() => handleSnsLogin('apple')}
                    >
                        <Image
                            source={require('../assets/icon/social-apple.png')}
                            style={styles.snsIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[
                            styles.snsButton,
                            styles.kakaoButton,
                        ]}
                        onPress={() => handleSnsLogin('kakao')}
                    >
                        <Image
                            source={require('../assets/icon/social-kakao.png')}
                            style={styles.kakaoIcon}
                            resizeMode="contain"
                        />
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.gray100,
        paddingHorizontal: 21,
    },

    form: {
        gap: 10,
    },

    input: {
        height: 55,
        minHeight: 55,
        borderRadius: 12,
        paddingHorizontal: 20,
    },

    loginButton: {
        width: '100%',
        height: 60,
        borderRadius: 12,
        backgroundColor: COLORS.gray800,
        marginTop: 26,
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
        height: 15,
        backgroundColor: COLORS.gray300,
    },

    snsSection: {
        alignItems: 'center',
        marginTop: 59,
    },

    snsButtonRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        marginTop: 17,
    },

    snsButton: {
        width: 50,
        height: 50,
        borderRadius: 25,
        alignItems: 'center',
        justifyContent: 'center',
    },

    kakaoButton: {
        backgroundColor: '#FDDC3F',
    },

    googleButton: {
        backgroundColor: COLORS.white,
    },

    appleButton: {
        backgroundColor: COLORS.black,
    },

    snsIcon: {
        width: 20,
        height: 20,
    },

    kakaoIcon: {
        width: 35,
        height: 35,
    },

    /* 로그인 상단 이미지 */
    logoSection: {
        alignItems: 'center',
        marginBottom: 40,
    },

    topImage: {
        width: 134,
        height: 112,
    },

    bottomImage: {
        width: 98,
        height: 39,
        marginTop: 8,
    },
});
