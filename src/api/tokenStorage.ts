
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'atch_access_token';
const REFRESH_TOKEN_KEY = 'atch_refresh_token';
const USER_EMAIL_KEY = 'atch_user_email';

// 토큰 저장
export async function saveTokens(
    accessToken: string,
    refreshToken: string,
): Promise<void> {
    try {
        if (Platform.OS === 'web') {
            localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
            localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
            return;
        }

        await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    } catch (error) {
        await clearTokens().catch(() => {});
        throw error;
    }
}

// Access Token 조회
export async function getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    }

    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

// Refresh Token 조회
export async function getRefreshToken(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    }

    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

// 로그인한 사용자의 이메일 저장
// (서버에 회원 정보 조회 API가 없어, 로그인·회원가입 때 입력한 이메일을 보관해 내 정보 화면에 표시)
export async function saveUserEmail(email: string): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.setItem(USER_EMAIL_KEY, email);
        return;
    }

    await SecureStore.setItemAsync(USER_EMAIL_KEY, email);
}

// 저장된 사용자 이메일 조회 (없으면 null)
export async function getUserEmail(): Promise<string | null> {
    if (Platform.OS === 'web') {
        return localStorage.getItem(USER_EMAIL_KEY);
    }

    return SecureStore.getItemAsync(USER_EMAIL_KEY);
}

// 저장된 토큰과 사용자 이메일 삭제
export async function clearTokens(): Promise<void> {
    if (Platform.OS === 'web') {
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_EMAIL_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    await SecureStore.deleteItemAsync(USER_EMAIL_KEY);
}
