/** 오늘의 집중 세션 한 건 — 백엔드 연동 전까지 쓰는 더미 데이터 */
export interface FocusSessionData {
  time: string;
  title: string;
  /** 집중 시간(분). 집계 값이 없으면 null */
  durationMinutes: number | null;
  completed: boolean;
  /** 이 세션 안에서의 중단 횟수. API가 제공하지 않으면 생략 */
  interruptions?: number;
}

export interface DailyReportData {
  date: string;
  dayOfWeek: string;
  goalPercent: number;
  focusTime: string;
  completedTasks: number;
  interruptions: number;
  /** 평균 집중 시간 */
  avgFocusTime: string;
  peakFocusTime: string;
  focusGrid: number[];
  /** 오늘의 집중 세션 목록 */
  focusSessions: FocusSessionData[];
}

export const dailyReports: DailyReportData[] = [
  {
    date: '10월 26일',
    dayOfWeek: '월요일',
    goalPercent: 92,
    focusTime: '4H 36M',
    completedTasks: 5,
    interruptions: 2,
    avgFocusTime: '55M',
    peakFocusTime: '오전 10시',
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
    date: '10월 27일',
    dayOfWeek: '화요일',
    goalPercent: 78,
    focusTime: '3H 54M',
    completedTasks: 4,
    interruptions: 4,
    avgFocusTime: '39M',
    peakFocusTime: '오전 12시',
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
    date: '10월 28일',
    dayOfWeek: '수요일',
    goalPercent: 96,
    focusTime: '4H 48M',
    completedTasks: 7,
    interruptions: 1,
    avgFocusTime: '1H 08M',
    peakFocusTime: '오후 10시',
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

  {
    date: '10월 29일',
    dayOfWeek: '목요일',
    goalPercent: 96,
    focusTime: '4H 48M',
    completedTasks: 0,
    interruptions: 1,
    avgFocusTime: '1H 08M',
    peakFocusTime: '오후 10시',
    focusSessions: [
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
      return '#F8F8F8';
    case 1:
      return '#FFF0E7';
    case 2:
      return '#FFD2C3';
    case 3:
      return '#FF8C66';
    default:
      return '#FF6734';
  }
}