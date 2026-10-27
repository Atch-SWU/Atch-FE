import * as SecureStore from 'expo-secure-store';

const ACCESS_TOKEN_KEY = 'atch_access_token';
const REFRESH_TOKEN_KEY = 'atch_refresh_token';

// Access Token과 Refresh Token 저장
export async function saveTokens(
    accessToken: string,
    refreshToken: string,
): Promise<void> {
    try {
        await SecureStore.setItemAsync(
            ACCESS_TOKEN_KEY,
            accessToken,
        );

        await SecureStore.setItemAsync(
            REFRESH_TOKEN_KEY,
            refreshToken,
        );
    } catch (error) {
        await SecureStore.deleteItemAsync(
            ACCESS_TOKEN_KEY,
        ).catch(() => {});

        await SecureStore.deleteItemAsync(
            REFRESH_TOKEN_KEY,
        ).catch(() => {});

        // 호출한 쪽에 오류 전달
        throw error;
    }
}

// 저장된 Access Token 조회
export async function getAccessToken(): Promise<string | null> {
    return SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
}

// 저장된 Refresh Token 조회
export async function getRefreshToken(): Promise<string | null> {
    return SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
}

// 저장된 토큰 삭제
export async function clearTokens(): Promise<void> {
    await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}
