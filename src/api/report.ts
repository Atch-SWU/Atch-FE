import { apiClient } from './apiClient';

// 통계 상태
// LIVE=오늘 실시간, FINALIZED=과거 확정, PENDING_FINALIZATION=확정 대기, UNAVAILABLE=자료 없음
export type ReportState =
    | 'LIVE'
    | 'FINALIZED'
    | 'PENDING_FINALIZATION'
    | 'UNAVAILABLE';

// 일간 리포트 API 응답 타입 (주간 리포트의 days 항목과 동일)
// 배정 수·완료율은 미확정이거나 자료가 없으면 null이며, null을 0으로 표시하지 않는다.
// completionRate 는 0~1 비율이다.
export interface DailyReportResponse {
    date: string;
    state: ReportState;
    assignedCount: number | null;
    completedAssignedCount: number | null;
    completionRate: number | null;
    completedTodoCount: number;
    overdueAssignedCount: number | null;
    closedFocusDurationSeconds: number;
    liveFocusDurationSeconds: number;
    pauseCount: number;
    resumeCount: number;
    asOf: string;
}

// 주간 리포트 API 응답 타입
export interface WeeklyReportResponse {
    weekStart: string;
    from: string;
    to: string;

    days: DailyReportResponse[];

    assignedCount: number | null;
    completedAssignedCount: number | null;
    completionRate: number | null;
    completedTodoCount: number;
    totalFocusDurationSeconds: number;
    elapsedDayCount: number;
    averageDailyFocusDurationSeconds: number;
    asOf: string;
}

// 주간 리포트 조회
export const getWeeklyReport = (date?: string) => {
    const query = date
        ? `?date=${encodeURIComponent(date)}`
        : '';

    return apiClient.get<WeeklyReportResponse>(
        `/api/v1/reports/weekly${query}`,
    );
};

// 소요 시간 비교 항목
// 예상시간은 분, 실제시간·오차는 초 단위이며 오차는 (실제 - 예상)이다.
// AI 제안이 없으면 AI 관련 필드는 null.
export interface TimeComparisonItem {
    todoId: number;
    title: string;
    completedAt: string | null;
    userEstimatedDurationMinutes: number | null;
    aiEstimatedDurationMinutes: number | null;
    selectedEstimateType: 'USER' | 'AI' | null;
    actualDurationSeconds: number;
    userErrorSeconds: number | null;
    aiErrorSeconds: number | null;
}

// 소요 시간 비교 API 응답 타입
export interface TimeComparisonResponse {
    from: string;
    to: string;
    items: TimeComparisonItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    asOf: string;
}

// 소요 시간 비교 조회
export const getTimeComparisons = (
    from: string,
    to: string,
    page: number = 0,
    size: number = 20,
) => {
    const query = [
        `from=${encodeURIComponent(from)}`,
        `to=${encodeURIComponent(to)}`,
        `page=${page}`,
        `size=${size}`,
    ].join('&');

    return apiClient.get<TimeComparisonResponse>(
        `/api/v1/reports/time-comparisons?${query}`,
    );
};

// 시간대별 집중 패턴 응답 타입
export interface FocusPatternHour {
    hour: number;
    closedDurationSeconds: number;
    liveDurationSeconds: number;
}

// 요일별 집중 패턴 응답 타입
export interface FocusPatternWeekday {
    dayOfWeek:
        | 'MONDAY'
        | 'TUESDAY'
        | 'WEDNESDAY'
        | 'THURSDAY'
        | 'FRIDAY'
        | 'SATURDAY'
        | 'SUNDAY';

    completedTodoCount: number;
    totalDurationSeconds: number;
    averageDurationSeconds: number | null;
}

// 시간대·요일별 집중 패턴 API 응답 타입
export interface FocusPatternsResponse {
    from: string;
    to: string;
    hours: FocusPatternHour[];
    weekdays: FocusPatternWeekday[];
    asOf: string;
}

// 시간대·요일별 집중 패턴 조회
export const getFocusPatterns = (
    from: string,
    to: string,
) => {
    const query = [
        `from=${encodeURIComponent(from)}`,
        `to=${encodeURIComponent(to)}`,
    ].join('&');

    return apiClient.get<FocusPatternsResponse>(
        `/api/v1/reports/focus-patterns?${query}`,
    );
};

// 일별 배정 이력 항목
export interface DailyTodoSnapshotItem {
    todoId: number;
    // 조회 시점의 제목이며 과거 제목이 아님
    currentTitle: string;
    statusAtDayEnd: 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';
    startAtSnapshot: string | null;
    dueAtSnapshot: string | null;
    completedAtSnapshot: string | null;
    wasRolledOver: boolean;
    wasOverdue: boolean;
    snapshotAt: string;
}

// 일별 배정 이력 API 응답 타입
export interface DailyTodoHistoryResponse {
    date: string;
    state: ReportState;
    items: DailyTodoSnapshotItem[];
    asOf: string;
}

// 일간 집계 조회 (date 생략 시 서울 기준 오늘)
export const getDailyReport = (date?: string) => {
    const query = date
        ? `?date=${encodeURIComponent(date)}`
        : '';

    return apiClient.get<DailyReportResponse>(
        `/api/v1/reports/daily${query}`,
    );
};

// 일별 배정 이력 조회 (date 생략 시 서울 기준 오늘)
export const getDailyTodoHistory = (date?: string) => {
    const query = date
        ? `?date=${encodeURIComponent(date)}`
        : '';

    return apiClient.get<DailyTodoHistoryResponse>(
        `/api/v1/reports/daily/todos${query}`,
    );
};
