export interface TaskParam {
  /** 서버 Todo ID (완료 처리에 사용) */
  id?: number;
  title: string;
  estimateText: string;
  /** 작업 정보 팝업용 메모 (없으면 '-') */
  memo?: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  SignUpComplete: undefined;
  FindPassword: undefined;
  Main: undefined;
  Settings: undefined;
  ProfileManage: undefined;
  MyInfo: undefined;
  ChangePassword: undefined;
  AppSettings: undefined;
  PushSettings: undefined;
  TaskCreate: undefined;
  CompletedTasks: undefined;
  Timer: { task: TaskParam; /** 이 작업 다음에 보여줄 작업 */ nextTask?: TaskParam | null };
  SessionComplete: {
    taskTitle: string;
    taskDate: string;
    /** 실제 소요(초) */
    elapsedSec: number;
    /** 예상 소요(초) */
    estimateSec: number;
    pauseCount: number;
    nextTask: TaskParam | null;
  };
};
