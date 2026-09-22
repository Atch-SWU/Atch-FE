import { CategoryKey } from '../constants/token';

export interface TaskParam {
  title: string;
  category: CategoryKey;
  estimateText: string;
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
  Timer: { task: TaskParam };
  SessionComplete: {
    taskTitle: string;
    taskDate: string;
    elapsedText: string;
    pauseCount: number;
    overText: string;
    nextTask: TaskParam | null;
  };
};
