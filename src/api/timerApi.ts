import { apiClient } from './apiClient';
import type { TodoResponse, TodoStatus } from './todoApi';

// ===== 타입 (스웨거 api-docs.json 기준) =====

export type TimerStateKind = 'IDLE' | 'RUNNING' | 'PAUSED' | 'SWITCH_WAITING';

export interface SwitchWait {
  switchId: string;
  targetTodoId: number;
  requestedAt: string;
  /** 이 시각(UTC) 이후에 확정 API 호출 가능 */
  readyAt: string;
  expiresAt: string;
}

/** 서버 기준 현재 타이머. 대상이 없으면 IDLE + null 식별자 */
export interface TimerState {
  state: TimerStateKind;
  focusTodoId: number | null;
  focusTodoTitle: string | null;
  todoStatus: TodoStatus | null;
  /** 실행 중인 세션 ID (일시정지 요청에 사용) */
  sessionId: number | null;
  /** 집중 대상 투두의 가장 최근 세션 ID (시작/재개/전환 요청에 사용) */
  latestSessionId: number | null;
  sessionStartedAt: string | null;
  closedDurationSeconds: number;
  currentSessionElapsedSeconds: number;
  /** 종료 구간 합계 + 실행 중 경과 */
  totalDurationSeconds: number;
  remainingEstimatedSeconds: number;
  estimateOverrunSeconds: number;
  pendingSwitch: SwitchWait | null;
  serverTime: string;
}

export interface SessionItem {
  id: number;
  todoId: number;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number | null;
  endReason: 'PAUSED' | 'COMPLETED' | 'SWITCHED' | null;
}

interface SessionPage {
  items: SessionItem[];
  page: number;
  totalElements: number;
  hasNext: boolean;
}

export interface NextTodo {
  id: number;
  title: string;
  currentScheduleDate: string;
  dueAt: string;
  estimatedDurationMinutes: number;
}

export interface CompletionSummary {
  todo: TodoResponse;
  pauseCount: number;
  resumeCount: number;
  switchCount: number;
  deadlineOverrunSeconds: number;
  estimateOverrunSeconds: number;
  nextTodos: NextTodo[];
}

export interface SwitchResponse {
  switchId: string;
  /** WAITING = 대기 필요, STARTED = 바로 전환되어 시작됨 */
  state: 'WAITING' | 'STARTED';
  sourceTodoId: number;
  targetTodoId: number;
  requestedAt: string;
  readyAt: string;
  expiresAt: string;
  timer: TimerState;
}

export interface TimerSettings {
  taskSwitchRestrictionEnabled: boolean;
  taskSwitchWaitMinutes: number;
}

// ===== 호출 =====

const TIMER = '/api/v1/timer';
const TODOS = '/api/v1/todos';

export const getCurrentTimer = () => apiClient.get<TimerState>(`${TIMER}/current`);

export const startTimer = (todoId: number, expectedLastSessionId: number | null) =>
  apiClient.post<TimerState>(`${TODOS}/${todoId}/timer/start`, { expectedLastSessionId });

export const pauseTimer = (todoId: number, sessionId: number) =>
  apiClient.post<TimerState>(`${TODOS}/${todoId}/timer/pause`, { sessionId });

export const resumeTimer = (todoId: number, lastSessionId: number) =>
  apiClient.post<TimerState>(`${TODOS}/${todoId}/timer/resume`, { lastSessionId });

/** 투두의 가장 최근 세션 ID (한 번도 시작하지 않았으면 null). 세션 목록은 오래된 순이라 마지막 페이지를 본다. */
export async function fetchLatestSessionId(todoId: number): Promise<number | null> {
  let page = 0;
  let latest: number | null = null;
  for (;;) {
    const res = await apiClient.get<SessionPage>(`${TODOS}/${todoId}/sessions?page=${page}&size=100`);
    for (const s of res.items) if (latest == null || s.id > latest) latest = s.id;
    if (!res.hasNext) return latest;
    page += 1;
  }
}

export const getCompletionSummary = (todoId: number) =>
  apiClient.get<CompletionSummary>(`${TODOS}/${todoId}/completion-summary`);

export const requestSwitch = (sourceTodoId: number, targetTodoId: number, sourceSessionId: number) =>
  apiClient.post<SwitchResponse>(`${TIMER}/switches`, { sourceTodoId, targetTodoId, sourceSessionId });

export const confirmSwitch = (switchId: string) =>
  apiClient.post<SwitchResponse>(`${TIMER}/switches/${switchId}/confirm`);

export const cancelSwitch = (switchId: string) => apiClient.delete<void>(`${TIMER}/switches/${switchId}`);

export const getTimerSettings = () => apiClient.get<TimerSettings>('/api/v1/settings/timer');
