import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import ChevronRight from '../assets/icon/chevron-right.svg';
import { COLORS } from '../constants/token';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

interface CalendarProps {
  value: Date | null;
  onSelect: (d: Date) => void;
}

/** 인라인 월 캘린더 (피그마 날짜 피커) */
export default function Calendar({ value, onSelect }: CalendarProps) {
  const init = value ?? new Date();
  const [viewY, setViewY] = useState(init.getFullYear());
  const [viewM, setViewM] = useState(init.getMonth());

  const firstDow = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const prevMonth = () => (viewM === 0 ? (setViewY(viewY - 1), setViewM(11)) : setViewM(viewM - 1));
  const nextMonth = () => (viewM === 11 ? (setViewY(viewY + 1), setViewM(0)) : setViewM(viewM + 1));

  const isSel = (d: number) =>
    value != null && value.getFullYear() === viewY && value.getMonth() === viewM && value.getDate() === d;

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <AppText variant="monthTitle" color={COLORS.textStrong}>{viewY}년 {viewM + 1}월</AppText>
        <View style={styles.navRow}>
          <Pressable hitSlop={10} onPress={prevMonth}>
            <ChevronLeft width={18} height={18} color={COLORS.iconWeak} />
          </Pressable>
          <Pressable hitSlop={10} onPress={nextMonth} style={styles.next}>
            <ChevronRight width={18} height={18} color={COLORS.iconWeak} />
          </Pressable>
        </View>
      </View>

      <View style={styles.rowWeek}>
        {WEEKDAYS.map((w) => (
          <View key={w} style={styles.cellHead}>
            <AppText variant="monthWeekday" color={COLORS.textPlaceholder}>{w}</AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {cells.map((d, i) => (
          <View key={i} style={styles.cell}>
            {d != null ? (
              <Pressable onPress={() => onSelect(new Date(viewY, viewM, d))} style={[styles.day, isSel(d) && styles.daySel]}>
                <AppText variant={isSel(d) ? 'monthDaySel' : 'monthDay'} color={isSel(d) ? COLORS.textInverse : COLORS.textStrong}>{d}</AppText>
              </Pressable>
            ) : null}
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingTop: 16, paddingBottom: 12 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  navRow: { flexDirection: 'row', alignItems: 'center' },
  next: { marginLeft: 18 },
  rowWeek: { flexDirection: 'row', marginBottom: 4 },
  cellHead: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', height: 28 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: { width: `${100 / 7}%`, alignItems: 'center', justifyContent: 'center', height: 46 },
  day: { width: 36, height: 36, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  daySel: { backgroundColor: COLORS.primary },
});
