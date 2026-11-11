import { BASE_URL } from './config';

// 비밀번호 재설정 API (로그인 전 호출이라 Authorization 헤더 없이 fetch 사용)
// 1) POST /auth/password-reset/code    → 204 (가입 여부와 관계없이 항상 204)
// 2) POST /auth/password-reset/verify  → { resetToken, expiresIn }
// 3) POST /auth/password-reset         → 204 (자동 로그인 안 함)

export class PasswordResetError extends Error {
    status: number;
    code?: string;

    constructor(status: number, message: string, code?: string) {
        super(message);
        this.name = 'PasswordResetError';
        this.status = status;
        this.code = code;
    }
}

const NETWORK_MESSAGE = '서버에 연결할 수 없어요. 네트워크를 확인해 주세요.';

async function post(path: string, body: unknown) {
    let response: Response;

    try {
        response = await fetch(`${BASE_URL}/api/v1/auth/${path}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Accept: '*/*',
            },
            body: JSON.stringify(body),
        });
    } catch {
        throw new PasswordResetError(0, NETWORK_MESSAGE);
    }

    if (response.ok) {
        return response.status === 204
            ? null
            : await response.json().catch(() => null);
    }

    const errorData = await response.json().catch(() => null);

    throw new PasswordResetError(
        response.status,
        errorData?.message ?? `요청에 실패했어요. (${response.status})`,
        errorData?.code,
    );
}

export const requestPasswordResetCode = (email: string) =>
    post('password-reset/code', { email });

export const verifyPasswordResetCode = async (
    email: string,
    code: string,
): Promise<string> => {
    const data = await post('password-reset/verify', { email, code });

    if (typeof data?.resetToken !== 'string' || !data.resetToken) {
        throw new PasswordResetError(200, '인증 토큰을 받지 못했어요. 다시 시도해 주세요.');
    }

    return data.resetToken;
};

export const resetPassword = (
    email: string,
    resetToken: string,
    newPassword: string,
) => post('password-reset', { email, resetToken, newPassword });
