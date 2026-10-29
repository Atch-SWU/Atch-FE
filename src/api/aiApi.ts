import { apiClient } from './apiClient';
import type { TodoInput, TodoResponse } from './todoApi';

// ===== 타입 (스웨거 api-docs.json 기준) =====

/** 일정 (서울 기준 날짜/시각). 하루종일이면 시각은 null */
export interface Schedule {
  startDate: string;
  startTime: string | null;
  dueDate: string;
  dueTime: string | null;
  allDay: boolean;
}

export interface AiDraft {
  draftId: string;
}

export interface DecompositionStep {
  draftId: string;
  position: number;
  title: string;
}

export interface TaskDecomposition {
  decompositionDraftId: string;
  sourceTaskName: string | null;
  steps: DecompositionStep[];
}

/** 작업 하나의 시간 예측 결과 (사용하는 필드만) */
export interface TimePredictionResult {
  draftId: string;
  userEstimatedDurationMinutes: number;
  /** 최종 제안시간(분) */
  aiEstimatedDurationMinutes: number;
  mode: 'HYBRID' | 'STATISTICAL_BASELINE';
}

export interface TimePrediction {
  prediction: TimePredictionResult;
  /** 투두 저장 시 estimateChoice 에 그대로 복사 (10분 유효) */
  predictionToken: string;
}

export interface TimePredictionBatch {
  predictions: TimePredictionResult[];
  totalUserEstimatedDurationMinutes: number;
  totalAiEstimatedDurationMinutes: number;
  predictionToken: string;
}

export interface DecomposedTaskInput {
  draftId: string;
  title: string;
  userEstimatedDurationMinutes: number;
}

export interface EstimateChoice {
  draftId: string;
  selectedEstimateType: 'USER' | 'AI';
  predictionToken?: string;
}

export interface DecomposedCreateInput extends Schedule {
  creationRequestId: string;
  decompositionDraftId: string;
  sourceTaskName: string;
  memo?: string | null;
  tasks: DecomposedTaskInput[];
  estimateChoice?: EstimateChoice;
}

interface DecomposedCreateResponse {
  items: { draftId: string; todo: TodoResponse }[];
}

// ===== 호출 =====

const AI = '/api/v1/ai';

/** 저장 전 새 작업의 AI 초안 발급 */
export const createDraft = () => apiClient.post<AiDraft>(`${AI}/drafts`, {});

export const decomposeTask = (input: Schedule & {
  draftId: string;
  title: string;
  taskDescription?: string | null;
  memo?: string | null;
}) => apiClient.post<TaskDecomposition>(`${AI}/task-decompositions`, input);

export const predictTime = (input: {
  draftId: string;
  title: string;
  memo?: string | null;
  userEstimatedDurationMinutes: number;
}) => apiClient.post<TimePrediction>(`${AI}/time-predictions`, input);

export const predictTimeBatch = (input: {
  decompositionDraftId: string;
  sourceTaskName: string;
  memo?: string | null;
  tasks: DecomposedTaskInput[];
}) => apiClient.post<TimePredictionBatch>(`${AI}/time-predictions/batch`, input);

export const createDecomposedTodos = (input: DecomposedCreateInput) =>
  apiClient.post<DecomposedCreateResponse>('/api/v1/todos/decomposed', input);

export type { TodoInput };
