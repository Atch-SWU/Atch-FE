import { useCallback, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { getCurrentTimer, TimerState } from '../api/timerApi';

/** 서버 기준 현재 타이머. 화면에 포커스가 돌아올 때마다 다시 불러온다 (실패하면 null). */
export function useCurrentTimer() {
  const [timer, setTimer] = useState<TimerState | null>(null);

  const reload = useCallback(async () => {
    try {
      setTimer(await getCurrentTimer());
    } catch {
      setTimer(null);
    }
  }, []);

  useFocusEffect(useCallback(() => { reload(); }, [reload]));

  return { timer, reload };
}
