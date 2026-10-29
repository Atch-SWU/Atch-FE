import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';

import { fetchTodosByDate, getErrorMessage, TodoResponse, TodoStatus } from '../api/todoApi';

/** 날짜별 Todo 목록. 화면에 포커스가 돌아올 때마다 다시 불러온다. */
export function useTodosByDate(date: string, statuses?: TodoStatus[]) {
  const [items, setItems] = useState<TodoResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reqId = useRef(0);
  const statusKey = statuses ? statuses.join(',') : '';

  const load = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    setError(null);
    try {
      const list = await fetchTodosByDate(date, statusKey ? (statusKey.split(',') as TodoStatus[]) : undefined);
      if (id === reqId.current) setItems(list);
    } catch (e) {
      if (id === reqId.current) { setItems([]); setError(getErrorMessage(e)); }
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [date, statusKey]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  return { items, setItems, loading, error, reload: load };
}
