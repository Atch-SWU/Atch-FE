export const reportMessages = [
  '이번주는 집중을 꽤나 잘했는걸?',
  '지난주보다 더 성장했어!',
  '오늘 집중도는 아주 좋았다?',
  '이 정도면 정말 잘하고 있는데?',
];

export interface WeeklyReportData {
  title: string;
  goalMinutes: number;
  completedGoalMinutes: number;
  totalFocusTime: string;
  completedTasks: number;
  streak: number;
  predictionAccuracy: number;

  focusGrid: {
    label: string;
    values: number[];
  }[];

  taskDuration: {
    day: string;
    minutes: number;
  }[];
}

export const weeklyReports: WeeklyReportData[] = [
  {
    title: '5월 첫째주',
    goalMinutes: 1020,
    completedGoalMinutes: 938,
    totalFocusTime: '15H 36M',
    completedTasks: 14,
    streak: 7,
    predictionAccuracy: 88,

    focusGrid: [
      {
        label: 'M',
        values: [0, 2, 0, 3, 0, 2, 3, 1, 0, 2, 0, 0],
      },
      {
        label: 'T',
        values: [0, 0, 2, 3, 2, 0, 3, 1, 0, 0, 2, 1],
      },
      {
        label: 'W',
        values: [1, 2, 0, 3, 3, 2, 0, 2, 1, 0, 1, 1],
      },
      {
        label: 'T',
        values: [0, 1, 0, 2, 3, 0, 2, 3, 0, 2, 0, 0],
      },
      {
        label: 'F',
        values: [0, 2, 0, 3, 0, 2, 2, 0, 3, 0, 3, 0],
      },
      {
        label: 'S',
        values: [2, 0, 1, 0, 2, 0, 3, 2, 0, 1, 0, 0],
      },
      {
        label: 'S',
        values: [0, 2, 0, 0, 2, 0, 1, 3, 0, 0, 1, 1],
      },
    ],

    taskDuration: [
      { day: 'MON', minutes: 0 },
      { day: 'TUE', minutes: 80 },
      { day: 'WED', minutes: 180 },
      { day: 'THU', minutes: 320 },
      { day: 'FRI', minutes: 40 },
      { day: 'SAT', minutes: 150 },
      { day: 'SUN', minutes: 110 },
    ],
  },

  {
    title: '5월 둘째주',
    goalMinutes: 1200,
    completedGoalMinutes: 1040,
    totalFocusTime: '17H 20M',
    completedTasks: 18,
    streak: 8,
    predictionAccuracy: 91,

    focusGrid: [
      {
        label: 'M',
        values: [1, 3, 2, 0, 3, 2, 1, 0, 2, 3, 0, 1],
      },
      {
        label: 'T',
        values: [2, 3, 0, 2, 3, 1, 0, 2, 3, 0, 3, 1],
      },
      {
        label: 'W',
        values: [0, 2, 3, 3, 1, 2, 3, 0, 1, 2, 3, 2],
      },
      {
        label: 'T',
        values: [3, 2, 1, 0, 3, 3, 2, 1, 0, 2, 0, 1],
      },
      {
        label: 'F',
        values: [2, 0, 3, 2, 3, 0, 1, 3, 2, 0, 3, 2],
      },
      {
        label: 'S',
        values: [0, 1, 2, 3, 0, 2, 1, 0, 3, 2, 2, 1],
      },
      {
        label: 'S',
        values: [1, 3, 0, 2, 3, 1, 0, 2, 3, 1, 1, 2],
      },
    ],

    taskDuration: [
      { day: 'MON', minutes: 90 },
      { day: 'TUE', minutes: 180 },
      { day: 'WED', minutes: 240 },
      { day: 'THU', minutes: 360 },
      { day: 'FRI', minutes: 120 },
      { day: 'SAT', minutes: 200 },
      { day: 'SUN', minutes: 160 },
    ],
  },

  {
    title: '5월 셋째주',
    goalMinutes: 900,
    completedGoalMinutes: 720,
    totalFocusTime: '12H 00M',
    completedTasks: 11,
    streak: 5,
    predictionAccuracy: 84,

    focusGrid: [
      {
        label: 'M',
        values: [0, 1, 2, 0, 3, 1, 0, 2, 0, 1, 0, 0],
      },
      {
        label: 'T',
        values: [1, 2, 0, 3, 1, 0, 2, 0, 1, 0, 3, 0],
      },
      {
        label: 'W',
        values: [0, 3, 1, 2, 0, 3, 1, 0, 2, 1, 2, 2],
      },
      {
        label: 'T',
        values: [2, 0, 3, 1, 0, 2, 0, 1, 3, 0, 2, 0],
      },
      {
        label: 'F',
        values: [0, 2, 1, 0, 3, 2, 0, 1, 0, 2, 3, 0],
      },
      {
        label: 'S',
        values: [1, 0, 2, 3, 0, 1, 2, 0, 1, 0, 3, 0],
      },
      {
        label: 'S',
        values: [0, 1, 0, 2, 3, 0, 1, 2, 0, 1, 2, 2],
      },
    ],

    taskDuration: [
      { day: 'MON', minutes: 30 },
      { day: 'TUE', minutes: 90 },
      { day: 'WED', minutes: 150 },
      { day: 'THU', minutes: 220 },
      { day: 'FRI', minutes: 60 },
      { day: 'SAT', minutes: 110 },
      { day: 'SUN', minutes: 80 },
    ],
  },
];

/** 오늘의 집중 세션 한 건 — 백엔드 연동 전까지 쓰는 더미 데이터 구조 */
export interface FocusSessionData {
  /** 시작 시각, "HH:MM" */
  time: string;
  title: string;
  durationMinutes: number;
  completed: boolean;
  /** 이 세션 안에서의 중단 횟수 */
  interruptions: number;
}

export interface DailyReportData {
  date: string;
  goalPercent: number;
  focusTime: string;
  completedTasks: number;
  /** 중단 횟수 */
  interruptions: number;
  /** 평균 집중 시간 */
  avgFocusTime: string;
  focusGrid: number[];
  /** 오늘의 집중 세션 목록 */
  focusSessions: FocusSessionData[];
}

export const dailyReports: DailyReportData[] = [
  {
    date: '5월 7일',
    goalPercent: 92,
    focusTime: '4H 36M',
    completedTasks: 5,
    interruptions: 2,
    avgFocusTime: '55M',
    focusSessions: [
      {
        time: '10:10',
        title: '기획안 작성',
        durationMinutes: 52,
        completed: true,
        interruptions: 1,
      },
      {
        time: '11:20',
        title: '자료 조사',
        durationMinutes: 25,
        completed: false,
        interruptions: 2,
      },
      {
        time: '18:20',
        title: '디자인 시안 검토',
        durationMinutes: 40,
        completed: true,
        interruptions: 2,
      },
    ],
    focusGrid: [
      0, 1, 2, 0, 3,
      2, 0, 1, 3, 0,
      2, 3, 1, 0, 2,
      0, 1, 3, 2, 0,
      1, 0, 2, 3, 1,
    ],
  },

  {
    date: '5월 8일',
    goalPercent: 78,
    focusTime: '3H 54M',
    completedTasks: 4,
    interruptions: 4,
    avgFocusTime: '39M',
    focusSessions: [
      {
        time: '09:15',
        title: '이메일 정리',
        durationMinutes: 20,
        completed: true,
        interruptions: 0,
      },
      {
        time: '10:40',
        title: '회의 준비',
        durationMinutes: 35,
        completed: false,
        interruptions: 2,
      },
      {
        time: '13:30',
        title: '디자인 리뷰',
        durationMinutes: 50,
        completed: true,
        interruptions: 1,
      },
      {
        time: '16:00',
        title: '코드 리팩토링',
        durationMinutes: 45,
        completed: true,
        interruptions: 1,
      },
    ],
    focusGrid: [
      1, 0, 2, 3, 0,
      2, 1, 0, 2, 3,
      0, 2, 3, 1, 0,
      3, 0, 1, 2, 3,
      0, 1, 2, 0, 2,
    ],
  },

  {
    date: '5월 9일',
    goalPercent: 96,
    focusTime: '4H 48M',
    completedTasks: 7,
    interruptions: 1,
    avgFocusTime: '1H 08M',
    focusSessions: [
      {
        time: '07:30',
        title: '아침 루틴 정리',
        durationMinutes: 15,
        completed: true,
        interruptions: 0,
      },
      {
        time: '09:00',
        title: '기획서 초안',
        durationMinutes: 60,
        completed: true,
        interruptions: 1,
      },
      {
        time: '10:30',
        title: '클라이언트 미팅',
        durationMinutes: 40,
        completed: true,
        interruptions: 0,
      },
      {
        time: '12:30',
        title: '디자인 시스템 정리',
        durationMinutes: 50,
        completed: true,
        interruptions: 1,
      },
      {
        time: '14:20',
        title: '코드 리뷰',
        durationMinutes: 35,
        completed: true,
        interruptions: 0,
      },
      {
        time: '16:00',
        title: 'QA 테스트',
        durationMinutes: 45,
        completed: true,
        interruptions: 1,
      },
      {
        time: '19:10',
        title: '회고 작성',
        durationMinutes: 20,
        completed: true,
        interruptions: 0,
      },
    ],
    focusGrid: [
      3, 2, 1, 3, 2,
      0, 3, 2, 1, 3,
      2, 3, 0, 2, 1,
      3, 2, 3, 1, 0,
      2, 1, 3, 2, 3,
    ],
  },
];

export function getIntensityColor(value: number) {
  switch (value) {
    case 0:
      return '#F7F9F9';
    case 1:
      return '#DEF6FB';
    case 2:
      return '#68DCE8';
    case 3:
      return '#2FCCDC';
    default:
      return '#F7F9F9';
  }
}