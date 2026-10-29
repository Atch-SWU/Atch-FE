
import { BASE_URL } from './config';
import { getAccessToken } from './tokenStorage';

// 주간 리포트 API 응답 타입
export interface WeeklyReportResponse {
    weekStart: string;
    from: string;
    to: string;

    days: {
        date: string;
        state: string;
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
    }[];

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
export async function getWeeklyReport(
    date?: string,
): Promise<WeeklyReportResponse> {
    const accessToken = await getAccessToken();

    if (!accessToken) {
        throw new Error('로그인이 필요합니다. 다시 로그인해 주세요.');
    }

    const params = date
        ? `?date=${encodeURIComponent(date)}`
        : '';

    const response = await fetch(
        `${BASE_URL.replace(/\/$/, '')}/api/v1/reports/weekly${params}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    const data = await response.json();

    if (!response.ok) {
        throw new Error(
            data.message ?? `주간 리포트 조회 실패 (${response.status})`,
        );
    }

    return data as WeeklyReportResponse;
}
