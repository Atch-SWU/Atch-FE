const DOW = ['일', '월', '화', '수', '목', '금', '토'];

/** "5월 19일 화요일" */
export function formatKoreanDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일 ${DOW[d.getDay()]}요일`;
}

/** "오후 02:30" */
export function formatKoreanTime(d: Date): string {
  const h = d.getHours();
  const ampm = h < 12 ? '오전' : '오후';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${ampm} ${String(h12).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

/** 초 → "MM:SS" (분은 100 이상도 허용) */
export function formatClock(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

/** Date → "2026-10-29" (API의 date 형식) */
export function toDateString(d: Date): string {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

/** Date → "09:00:00" (API의 time 형식) */
export function toTimeString(d: Date): string {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:00`;
}

const SEOUL_OFFSET_MS = 9 * 60 * 60 * 1000;

/** epoch ms → 서울 기준 "YYYY-MM-DD" */
export function seoulDateFromMs(ms: number): string {
  return new Date(ms + SEOUL_OFFSET_MS).toISOString().slice(0, 10);
}
