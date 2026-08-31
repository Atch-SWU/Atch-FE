import { CategoryKey } from '../constants/token';

export interface TaskParam {
  title: string;
  category: CategoryKey;
  estimateText: string;
}

export type RootStackParamList = {
  Onboarding: undefined;
  Main: undefined;
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
