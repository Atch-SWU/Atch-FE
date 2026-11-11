import { useCallback, useEffect, useRef, useState } from 'react';

/** 초 단위 카운트다운. start(60)을 호출하면 1초마다 줄어 0이 되면 멈춘다. */
export default function useCountdown() {
    const [remaining, setRemaining] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const clear = () => {
        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }
    };

    const start = useCallback((seconds: number) => {
        clear();
        setRemaining(seconds);

        timerRef.current = setInterval(() => {
            setRemaining((prev) => {
                if (prev <= 1) {
                    clear();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    // 화면을 떠날 때 타이머 정리
    useEffect(() => clear, []);

    return { remaining, start };
}
