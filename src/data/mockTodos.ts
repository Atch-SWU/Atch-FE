import { CategoryKey } from '../constants/token';

export interface TodoItem {
  id: string;
  title: string;
  category: CategoryKey;
  estimateText: string;
}

export interface CompletedItem {
  id: string;
  date: string;
  title: string;
  badgeText: string;
}

export const TODOS: TodoItem[] = [
  { id: '1', title: '주간회의 준비', category: 'work', estimateText: '예상 45분' },
  { id: '2', title: '팀 미팅 자료 준비', category: 'work', estimateText: '예상 45분' },
  { id: '3', title: '알고리즘 문제 풀이', category: 'study', estimateText: '예상 60분' },
  { id: 't', title: '세션 완료 테스트', category: 'study', estimateText: '예상 30초' },
];

export const COMPLETED: CompletedItem[] = [
  { id: '1', date: '5월 16일', title: '팀 미팅 자료 준비', badgeText: '5분 단축' },
  { id: '2', date: '5월 16일', title: '독서 20페이지', badgeText: '2분 초과' },
  { id: '3', date: '5월 14일', title: '알고리즘 문제 풀기', badgeText: '15분 단축' },
];

// ===== 투두리스트 메인화면용 =====
export interface WeekDay {
  wd: string;
  day: number;
  selected?: boolean;
  dot?: boolean;
}
export const WEEK: WeekDay[] = [
  { wd: '일', day: 17 },
  { wd: '월', day: 18 },
  { wd: '화', day: 19, selected: true, dot: true },
  { wd: '수', day: 20 },
  { wd: '목', day: 21, dot: true },
  { wd: '금', day: 22, dot: true },
  { wd: '토', day: 23 },
];

export interface DayTask {
  id: string;
  statusLabel: string;
  status: 'focus' | 'planned';
  title: string;
  time: string;
}
export const TODAY_TASKS: DayTask[] = [
  { id: '1', statusLabel: '집중중', status: 'focus', title: '주간 회의 준비', time: '45m' },
  { id: '2', statusLabel: '예정', status: 'planned', title: '디자인 피드백 정리', time: '1h' },
];

export interface OverdueTask {
  id: string;
  overLabel: string;
  title: string;
  percent: number;
  time: string;
}
export const OVERDUE: OverdueTask = {
  id: 'o1',
  overLabel: 'D+2 초과',
  title: '기획안 초안 작성',
  percent: 55,
  time: '2h',
};

export const DONE_TASKS: string[] = ['아침 스트레칭', '이메일 확인'];

// ===== 날짜별 일정(민트 점) & 투두 =====
// key: `${year}-${monthIndex}-${day}` (monthIndex 0-based, 4 = 5월)
export const dateKey = (y: number, m: number, day: number) => `${y}-${m}-${day}`;

export const TASKS_BY_DATE: Record<string, DayTask[]> = {
  [dateKey(2026, 4, 19)]: TODAY_TASKS,
  [dateKey(2026, 4, 21)]: [
    { id: 'd21a', statusLabel: '예정', status: 'planned', title: '논문 리뷰 정리', time: '1h' },
  ],
  [dateKey(2026, 4, 22)]: [
    { id: 'd22a', statusLabel: '예정', status: 'planned', title: '스터디 발표 준비', time: '2h' },
    { id: 'd22b', statusLabel: '예정', status: 'planned', title: '운동 기록', time: '30m' },
  ],
  [dateKey(2026, 4, 14)]: [
    { id: 'd14a', statusLabel: '완료', status: 'planned', title: '알고리즘 문제 풀기', time: '1h' },
  ],
  [dateKey(2026, 5, 3)]: [
    { id: 'd53a', statusLabel: '예정', status: 'planned', title: '월초 회고 작성', time: '40m' },
  ],
  [dateKey(2026, 5, 12)]: [
    { id: 'd512a', statusLabel: '예정', status: 'planned', title: '디자인 QA', time: '1h' },
  ],
};

/** 해당 날짜에 일정(있는/있던)이 있어 민트 점을 찍을지 */
export const hasEvent = (y: number, m: number, day: number) => dateKey(y, m, day) in TASKS_BY_DATE;

/** 해당 날짜의 할 일 목록 (없으면 빈 배열) */
export const tasksForDate = (y: number, m: number, day: number): DayTask[] =>
  TASKS_BY_DATE[dateKey(y, m, day)] ?? [];
