// ===== 홈 =====
export interface HomeTask {
  id: string;
  title: string;
  /** 상위 작업명 (없을 수 있음) */
  parent?: string;
  estimateText: string;
}

export const HOME_TASKS: HomeTask[] = [
  { id: 'h1', title: '주간 회의 준비', parent: '팀 주간 보고', estimateText: '예상 45분' },
  { id: 'h2', title: '일정 자료 정리', parent: '팀 주간 보고', estimateText: '예상 30분' },
  { id: 'h3', title: '알고리즘 문제 풀이', estimateText: '예상 1시간' },
];

/** 진행중인 작업 (없으면 null) */
export const HOME_IN_PROGRESS: { taskId: string; estimateText: string; progressText: string; percent: number } | null = {
  taskId: 'h1',
  estimateText: '예상 소요시간 45분',
  progressText: '45분 진행',
  percent: 45,
};

export const HOME_STATS = { weekDone: 18, completionRate: 89, grade: 'B등급', rewardPercent: 2 };

// ===== 투두리스트 =====
export interface DayTask {
  id: string;
  /** 상위 태스크 이름 (세부 분량일 때 위에 작게 표시) */
  parent?: string;
  title: string;
  estimateText: string;
}

export interface InProgressTask {
  id: string;
  badgeLabel: string;
  title: string;
  estimateText: string;
  progressText: string;
  percent: number;
}

export interface DoneTask {
  id: string;
  title: string;
  subText: string;
}

/** 오늘(2026-5-19) 진행중 태스크 */
export const IN_PROGRESS: InProgressTask = {
  id: 'p1',
  badgeLabel: '오늘 마감!',
  title: '기획안 초안 작성',
  estimateText: '예상 소요시간 45분',
  progressText: '45분 진행',
  percent: 45,
};

export const TODAY_TASKS: DayTask[] = [
  { id: '1', parent: '기획안 초안 작성', title: '래퍼런스 3개 모으기', estimateText: '예상 15분' },
  { id: '2', parent: '기획안 초안 작성', title: '핵심 메시지 한 줄 정하기', estimateText: '예상 10분' },
  { id: '3', title: '디자인 피드백 정리', estimateText: '예상 10분' },
];

export const DONE_TASKS: DoneTask[] = [
  { id: 'd1', title: '자료스크랩', subText: '30분 집중' },
];

// ===== 날짜별 투두 (key: `${year}-${monthIndex}-${day}`, monthIndex 0-based) =====
export const dateKey = (y: number, m: number, day: number) => `${y}-${m}-${day}`;

export const TASKS_BY_DATE: Record<string, DayTask[]> = {
  [dateKey(2026, 4, 19)]: TODAY_TASKS,
  [dateKey(2026, 4, 21)]: [
    { id: 'd21a', title: '논문 리뷰 정리', estimateText: '예상 60분' },
  ],
  [dateKey(2026, 4, 22)]: [
    { id: 'd22a', title: '스터디 발표 준비', estimateText: '예상 90분' },
    { id: 'd22b', title: '운동 기록', estimateText: '예상 30분' },
  ],
  [dateKey(2026, 5, 3)]: [
    { id: 'd53a', title: '월초 회고 작성', estimateText: '예상 40분' },
  ],
};

export const tasksForDate = (y: number, m: number, day: number): DayTask[] =>
  TASKS_BY_DATE[dateKey(y, m, day)] ?? [];


// ===== 완료작업 목록 (날짜별) =====
export const COMPLETED_BY_DATE: Record<string, DoneTask[]> = {
  [dateKey(2026, 4, 19)]: [
    { id: 'c1', title: '일정 자료 준비', subText: '32분 집중' },
    { id: 'c2', title: '독서 30페이지 읽기', subText: '32분 집중' },
    { id: 'c3', title: '알고리즘 문제 풀기', subText: '58분 집중' },
  ],
};

export const completedForDate = (y: number, m: number, day: number): DoneTask[] =>
  COMPLETED_BY_DATE[dateKey(y, m, day)] ?? [];
