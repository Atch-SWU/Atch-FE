import { BASE_URL } from './config';
import {
    getAccessToken,
    getRefreshToken,
    saveTokens,
    clearTokens,
} from './tokenStorage';

type RefreshResponse = {
    tokenType?: string;
    accessToken?: string;
    accessTokenExpiresIn?: number;
    refreshToken?: string;
    refreshTokenExpiresAt?: string;
    code?: string;
    message?: string;
};

export class TokenRefreshError extends Error {
    status: number;
    code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.name = 'TokenRefreshError';
        this.status = status;
        this.code = code;
    }
}

// 동시에 여러 요청이 들어와도 갱신 요청은 한 번만 실행
let refreshPromise: Promise<string> | null = null;

async function requestNewTokens(): Promise<string> {
    const refreshToken = await getRefreshToken();

    if (!refreshToken) {
        await clearTokens();

        throw new TokenRefreshError(
            401,
            '저장된 Refresh Token이 없습니다.',
        );
    }

    let response: Response;

    try {
        response = await fetch(
            `${BASE_URL}/api/v1/auth/token/refresh`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            },
        );
    } catch {
        // 네트워크 오류는 로그아웃 처리x
        throw new TokenRefreshError(
            0,
            '서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.',
        );
    }

    const data: RefreshResponse | null =
        await response.json().catch(() => null);

    if (response.status === 401) {
        await clearTokens();

        throw new TokenRefreshError(
            401,
            data?.message ?? '로그인 정보가 만료되었습니다.',
            data?.code,
        );
    }

    if (response.status === 503) {
        throw new TokenRefreshError(
            503,
            data?.message ?? '인증 서버에 일시적인 문제가 발생했습니다.',
            data?.code,
        );
    }

    if (response.status === 500) {
        throw new TokenRefreshError(
            500,
            data?.message ?? '토큰 갱신 중 서버 오류가 발생했습니다.',
            data?.code,
        );
    }

    if (!response.ok) {
        throw new TokenRefreshError(
            response.status,
            data?.message ?? '토큰 갱신에 실패했습니다.',
            data?.code,
        );
    }

    if (
        !data ||
        typeof data.accessToken !== 'string' ||
        typeof data.refreshToken !== 'string'
    ) {
        throw new TokenRefreshError(
            response.status,
            '토큰 갱신 응답 형식이 올바르지 않습니다.',
        );
    }

    // 새 Access Token과 Refresh Token을 함께 저장
    await saveTokens(data.accessToken, data.refreshToken);

    return data.accessToken;
}

export function refreshAccessToken(): Promise<string> {
    if (!refreshPromise) {
        refreshPromise = requestNewTokens().finally(() => {
            refreshPromise = null;
        });
    }

    return refreshPromise;
}


export async function fetchWithAuth(
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    let accessToken = await getAccessToken();

    // Access Token이 없으면 Refresh Token으로 갱신 시도
    if (!accessToken) {
        accessToken = await refreshAccessToken();
    }

    const request = (token: string) => {
        const headers = new Headers(options.headers);

        headers.set('Authorization', `Bearer ${token}`);

        return fetch(url, {
            ...options,
            headers,
        });
    };

    let response = await request(accessToken);

    // 인증 만료가 아니면 기존 응답 그대로 반환
    if (response.status !== 401) {
        return response;
    }

    // 다른 요청이 먼저 토큰을 갱신했는지 확인
    const latestToken = await getAccessToken();

    if (latestToken && latestToken !== accessToken) {
        accessToken = latestToken;
    } else {
        // 아직 갱신되지 않았다면 갱신 실행
        accessToken = await refreshAccessToken();
    }

    // 새로운 토큰으로 딱 한 번 재요청
    response = await request(accessToken);

    return response;
}