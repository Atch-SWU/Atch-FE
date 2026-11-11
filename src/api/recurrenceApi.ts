import { apiClient } from './apiClient';

/** 반복 추천 전체 설정 (GET /api/v1/settings/recurrence) */
export interface RecurrenceSettings {
    /** 새 반복 패턴 감지·추천 사용 여부 */
    repeatRecommendationEnabled?: boolean;
}

// 반복 추천 설정 조회
export const getRecurrenceSettings = () =>
    apiClient.get<RecurrenceSettings | null>('/api/v1/settings/recurrence');

/**
 * 반복 추천 설정 변경 (PATCH /api/v1/settings/recurrence)
 * - 끄면 새 반복 패턴 감지·추천을 멈추고, 다시 켜면 기존 유효 기록을 재평가한다.
 * - 이미 등록된 반복 일정(Rule)의 자동 생성에는 영향을 주지 않는다.
 */
export const updateRecurrenceSettings = (enabled: boolean) =>
    apiClient.patch<unknown>('/api/v1/settings/recurrence', {
        repeatRecommendationEnabled: enabled,
    });

/**
 * 등록된 반복 일정 개수 (GET /api/v1/recurrence-rules)
 * 활성·비활성 규칙을 모두 포함하며 삭제된 규칙은 제외된다.
 * 응답 구조가 스웨거에 정의돼 있지 않아 배열 / totalElements / items·content 형태를 모두 허용한다.
 */
export async function getRecurrenceRuleCount(): Promise<number> {
    const data = await apiClient.get<unknown>(
        '/api/v1/recurrence-rules?page=0&size=100',
    );

    if (Array.isArray(data)) return data.length;

    if (data && typeof data === 'object') {
        const page = data as {
            totalElements?: unknown;
            items?: unknown;
            content?: unknown;
        };

        if (typeof page.totalElements === 'number') {
            return page.totalElements;
        }
        if (Array.isArray(page.items)) return page.items.length;
        if (Array.isArray(page.content)) return page.content.length;
    }

    return 0;
}
