import { apiClient, ApiError } from './apiClient';
import { formatMinutes } from '../utils/duration';
import { seoulDateFromMs } from '../utils/date';

export type TodoStatus = 'PENDING' | 'IN_PROGRESS' | 'PAUSED' | 'COMPLETED';

/** 서버 TodoResponse (시각은 UTC ISO, 날짜 기준은 Asia/Seoul) */
export interface TodoResponse {
  id: number;
  title: string;
  /** AI 분해 원본 작업명 (일반 Todo는 null) */
  sourceTaskName: string | null;
  memo: string | null;
  startAt: string;
  dueAt: string;
  currentScheduleDate: string;
  allDay: boolean;
  status: TodoStatus;
  completedAt: string | null;
  userEstimatedDurationMinutes: number;
  aiEstimatedDurationMinutes: number | null;
  /** 최종 적용되는 예상 시간(분) */
  estimatedDurationMinutes: number;
  /** 종료된 세션의 실제 소요 초 합계 */
  actualDurationSeconds: number;
  overdue: boolean;
  rolledOver: boolean;
}

interface TodoPageResponse {
  items: TodoResponse[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
}

/** 생성/수정 요청 (같은 필드) */
export interface TodoInput {
  title: string;
  memo?: string | null;
  /** "2026-10-29" */
  startDate: string;
  /** "09:00:00" (allDay면 null) */
  startTime: string | null;
  dueDate: string;
  dueTime: string | null;
  allDay: boolean;
  userEstimatedDurationMinutes: number;
  /** 저장 중복 방지용 UUID. 같은 저장을 재전송할 때는 같은 값을 유지 */
  creationRequestId?: string;
  /** AI 시간 예측을 연결해 저장할 때 (draftId 는 AI 초안, AI 선택 시 predictionToken 필수) */
  estimateChoice?: { draftId: string; selectedEstimateType: 'USER' | 'AI'; predictionToken?: string };
}

const BASE = '/api/v1/todos';

/** 해당 배정 날짜의 Todo 목록 (statuses 생략 시 전체 상태) */
export async function fetchTodosByDate(date: string, statuses?: TodoStatus[]): Promise<TodoResponse[]> {
  const params = [`date=${date}`, 'size=100'];
  if (statuses && statuses.length > 0) params.push(`status=${statuses.join(',')}`);
  const res = await apiClient.get<TodoPageResponse>(`${BASE}?${params.join('&')}`);
  return res.items;
}

export function createTodo(input: TodoInput): Promise<TodoResponse> {
  return apiClient.post<TodoResponse>(BASE, input);
}

export function updateTodo(id: number, input: TodoInput): Promise<TodoResponse> {
  return apiClient.put<TodoResponse>(`${BASE}/${id}`, input);
}

export function deleteTodo(id: number): Promise<void> {
  return apiClient.delete<void>(`${BASE}/${id}`);
}

export function completeTodo(id: number): Promise<TodoResponse> {
  return apiClient.post<TodoResponse>(`${BASE}/${id}/complete`);
}

export function reopenTodo(id: number): Promise<TodoResponse> {
  return apiClient.post<TodoResponse>(`${BASE}/${id}/reopen`);
}

/** 화면에 보여줄 에러 문구 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.code === 'TODO_PAUSE_REQUIRED') return '진행 중인 작업이에요. 먼저 일시정지해 주세요.';
    if (error.code === 'TODO_REOPEN_REQUIRED') return '완료된 작업이에요. 완료를 취소한 뒤 수정해 주세요.';
    if (error.status === 404) return '이미 삭제되었거나 찾을 수 없는 작업이에요.';
    return error.message;
  }
  return '알 수 없는 오류가 발생했어요.';
}

// ===== 화면 표시용 변환 =====

/** "예상 45분" / "예상 1시간 20분" */
export const estimateText = (t: TodoResponse) => `예상 ${formatMinutes(t.estimatedDurationMinutes)}`;

/** "45분 진행" */
export const progressText = (t: TodoResponse, seconds: number = t.actualDurationSeconds) => `${Math.floor(seconds / 60)}분 진행`;

/** 예상 시간 대비 진행률 0~100 */
export const progressPercent = (t: TodoResponse, seconds: number = t.actualDurationSeconds) =>
  t.estimatedDurationMinutes > 0
    ? Math.min(100, Math.round((seconds / 60 / t.estimatedDurationMinutes) * 100))
    : 0;

/** "30분 집중" */
export const focusText = (t: TodoResponse) => `${Math.round(t.actualDurationSeconds / 60)}분 집중`;

/** 마감일이 오늘(서울)인 미완료 작업인지. 마감 시각은 미포함 경계라 1ms 앞당겨 비교 */
export const isDueToday = (t: TodoResponse, todayStr: string) =>
  t.status !== 'COMPLETED' && seoulDateFromMs(Date.parse(t.dueAt) - 1) === todayStr;
