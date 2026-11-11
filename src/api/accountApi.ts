import { apiClient } from './apiClient';

/**
 * 회원 탈퇴 (POST /api/v1/users/me/withdrawal)
 * - 본인 확인을 위해 현재 비밀번호가 필요하다.
 * - 성공하면 204(본문 없음). 계정과 모든 데이터가 즉시 삭제되며 복구할 수 없다.
 * - 현재 비밀번호가 틀리면 403(CURRENT_PASSWORD_INVALID).
 */
export const withdrawAccount = (currentPassword: string) =>
    apiClient.post<void>('/api/v1/users/me/withdrawal', {
        currentPassword,
    });

/**
 * 비밀번호 변경 (PATCH /api/v1/users/me/password)
 * - 현재 비밀번호와 새 비밀번호를 보낸다. 이메일 인증은 필요 없다.
 * - 성공하면 204(본문 없음). 현재 기기를 포함한 모든 기기에서 다시 로그인해야 한다.
 * - 현재 비밀번호가 틀리면 403(CURRENT_PASSWORD_INVALID).
 */
export const changePassword = (
    currentPassword: string,
    newPassword: string,
) =>
    apiClient.patch<void>('/api/v1/users/me/password', {
        currentPassword,
        newPassword,
    });
