import { apiClient } from './apiClient';

/** 주간 집계 (일부 필드만 사용). completionRate 는 0~1, 배정이 없으면 null */
export interface WeeklyReport {
  completedTodoCount: number | null;
  completionRate: number | null;
}

export const getWeeklyReport = () => apiClient.get<WeeklyReport>('/api/v1/reports/weekly');
