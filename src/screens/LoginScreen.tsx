import { useState } from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import FormInput from '../components/FormInput';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

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
        navigation.navigate('FindPassword');
    };

    const handleSignUp = () => {
        navigation.navigate('SignUp');
    };

    const handleSnsLogin = (type: 'kakao' | 'google' | 'apple') => {
        // TODO: SNS 로그인 API 연동
        console.log(`${type} 로그인`);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: 310,
                    paddingBottom: insets.bottom + 32,
                },
            ]}
        >
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
                label="로그인"
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
});