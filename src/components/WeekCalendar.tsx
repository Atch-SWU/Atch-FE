import { useRef, useEffect, useState } from 'react';
import { View, Pressable, Animated, PanResponder, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import AppText from './AppText';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import ChevronRight from '../assets/icon/chevron-right.svg';
import { COLORS } from '../constants/token';
import { hasEvent } from '../data/mockTodos';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// 레이아웃 상수 (높이 계산용)
const DAY_ROW_MT = 8;
const WEEK_DAY_H = 46;
const WEEK_DOT_MT = 11;
const DOT_H = 8;
const MONTH_ROW_H = 52;
const NAV_H = 40;

export type SelDate = { y: number; m: number; day: number };

type Props = {
  /** 현재 선택된 날짜 */
  selected: SelDate;
  /** 날짜 선택 시 (해당 날짜 투두 표시용) */
  onSelectDate: (d: SelDate) => void;
  /** 핸들을 잡을 때 (바깥 스크롤 잠금용) */
  onGrab?: () => void;
  /** 핸들을 놓을 때 (바깥 스크롤 해제용) */
  onRelease?: () => void;
};

const tap = (fn: () => Promise<unknown>) => {
  try {
    fn();
  } catch {}
};

const sameDay = (a: SelDate, b: SelDate) => a.y === b.y && a.m === b.m && a.day === b.day;

/** 주간 캘린더 (핸들 드래그 → 월별 펼치기 + 월 이동 + 날짜 탭 + 햅틱) */
export default function WeekCalendar({ selected, onSelectDate, onGrab, onRelease }: Props) {
  const progress = useRef(new Animated.Value(0)).current; // 0=주간, 1=월간
  const grab = useRef(new Animated.Value(0)).current; // 0=놓음, 1=잡음
  const progressVal = useRef(0);
  const startProgress = useRef(0);
  const prevP = useRef(0);
  const [monthActive, setMonthActive] = useState(false); // 월간 레이어 터치 활성

  // 월간 그리드에 표시할 연/월 (화살표로 이동)
  const [viewY, setViewY] = useState(selected.y);
  const [viewM, setViewM] = useState(selected.m);
  useEffect(() => {
    setViewY(selected.y);
    setViewM(selected.m);
  }, [selected.y, selected.m]);

  useEffect(() => {
    const id = progress.addListener(({ value }) => {
      progressVal.current = value;
      const active = value > 0.5;
      setMonthActive((prev) => (prev !== active ? active : prev));
    });
    return () => progress.removeListener(id);
  }, [progress]);

  // 월간 셀
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const monthCells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) monthCells.push(null);
  for (let d = 1; d <= daysInMonth; d++) monthCells.push(d);
  while (monthCells.length % 7 !== 0) monthCells.push(null);
  const rows = monthCells.length / 7;

  // 주간 셀 (선택된 날짜가 속한 주)
  const selDateObj = new Date(selected.y, selected.m, selected.day);
  const sunday = new Date(selDateObj);
  sunday.setDate(selDateObj.getDate() - selDateObj.getDay());
  const weekDays: SelDate[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
  });
  const selDow = selDateObj.getDay();

  const H_WEEK = DAY_ROW_MT + WEEK_DAY_H + WEEK_DOT_MT + DOT_H;
  const H_MONTH = DAY_ROW_MT + rows * MONTH_ROW_H;
  const DIST = H_MONTH - H_WEEK;

  const bodyHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [H_WEEK, H_MONTH] });
  const weekOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const monthOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const navHeight = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, NAV_H] });
  const navOpacity = progress.interpolate({ inputRange: [0, 0.6, 1], outputRange: [0, 0, 1] });

  const handleColor = grab.interpolate({ inputRange: [0, 1], outputRange: [COLORS.calHandle, COLORS.primary] });
  const handleWidth = grab.interpolate({ inputRange: [0, 1], outputRange: [40, 48] });
  const handleHeight = grab.interpolate({ inputRange: [0, 1], outputRange: [4, 5] });

  const snap = (to: number) =>
    Animated.spring(progress, { toValue: to, useNativeDriver: false, bounciness: 4, speed: 14 }).start();

  const changeMonth = (delta: number) => {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setViewM(m);
    setViewY(y);
    tap(() => Haptics.selectionAsync());
  };

  const onDayPress = (d: SelDate) => {
    tap(() => Haptics.selectionAsync());
    onSelectDate(d);
    // 월간 상태에서 날짜를 고르면 해당 주로 접기
    if (progressVal.current > 0.5) snap(0);
  };

  const pan = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dy) > 3,
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onPanResponderGrant: () => {
        startProgress.current = progressVal.current;
        prevP.current = progressVal.current;
        onGrab?.();
        Animated.timing(grab, { toValue: 1, duration: 120, useNativeDriver: false }).start();
        tap(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid)); // 달칵
      },
      onPanResponderMove: (_e, g) => {
        let p = startProgress.current + g.dy / DIST;
        if (p < 0) p = 0;
        if (p > 1) p = 1;
        if ((prevP.current < 0.5 && p >= 0.5) || (prevP.current >= 0.5 && p < 0.5)) {
          tap(() => Haptics.selectionAsync());
        }
        prevP.current = p;
        progress.setValue(p);
      },
      onPanResponderTerminate: () => {
        onRelease?.();
        Animated.timing(grab, { toValue: 0, duration: 180, useNativeDriver: false }).start();
      },
      onPanResponderRelease: (_e, g) => {
        onRelease?.();
        Animated.timing(grab, { toValue: 0, duration: 180, useNativeDriver: false }).start();
        if (Math.abs(g.dy) < 6) {
          snap(startProgress.current > 0.5 ? 0 : 1);
        } else {
          snap(progressVal.current > 0.5 ? 1 : 0);
        }
      },
    })
  ).current;

  return (
    <View>
      {/* 월 이동 헤더 (펼칠 때 나타남) */}
      <Animated.View style={[styles.navClip, { height: navHeight, opacity: navOpacity }]}>
        <View style={styles.navRow}>
          <Pressable hitSlop={12} onPress={() => changeMonth(-1)} style={styles.navBtn}>
            <ChevronLeft width={22} height={22} color={COLORS.calGridArrow} />
          </Pressable>
          <AppText variant="calHeader" color={COLORS.textMain}>{`${viewY}년 ${viewM + 1}월`}</AppText>
          <Pressable hitSlop={12} onPress={() => changeMonth(1)} style={styles.navBtn}>
            <ChevronRight width={22} height={22} color={COLORS.calGridArrow} />
          </Pressable>
        </View>
      </Animated.View>

      {/* 요일 헤더 */}
      <View style={styles.row}>
        {WEEKDAYS.map((w, i) => (
          <View key={w} style={styles.cell}>
            <AppText
              variant={i === selDow ? 'calWeekdaySel' : 'calWeekday'}
              color={i === selDow ? COLORS.calWeekdayActive : COLORS.calWeekday}
            >
              {w}
            </AppText>
          </View>
        ))}
      </View>

      {/* 애니메이션 바디 */}
      <Animated.View style={[styles.body, { height: bodyHeight }]}>
        {/* 주간 레이어 */}
        <Animated.View
          style={[styles.layer, { opacity: weekOpacity }]}
          pointerEvents={monthActive ? 'none' : 'auto'}
        >
          <View style={[styles.row, styles.dayRow]}>
            {weekDays.map((d) => {
              const sel = sameDay(d, selected);
              return (
                <Pressable key={`w-${d.m}-${d.day}`} style={styles.weekCol} onPress={() => onDayPress(d)}>
                  <View style={styles.weekDayInner}>
                    <AppText variant={sel ? 'calDaySel' : 'calDay'} color={sel ? COLORS.calSelected : COLORS.calDay}>
                      {d.day}
                    </AppText>
                  </View>
                  <View style={styles.weekDotSlot}>
                    {hasEvent(d.y, d.m, d.day) ? <View style={styles.dot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* 월간 레이어 */}
        <Animated.View
          style={[styles.layer, { opacity: monthOpacity }]}
          pointerEvents={monthActive ? 'auto' : 'none'}
        >
          <View style={[styles.grid, styles.dayRow]}>
            {monthCells.map((d, i) => {
              if (d == null) return <View key={`m-empty-${i}`} style={styles.monthCell} />;
              const cellDate: SelDate = { y: viewY, m: viewM, day: d };
              const sel = sameDay(cellDate, selected);
              return (
                <Pressable key={`m-${d}`} style={styles.monthCell} onPress={() => onDayPress(cellDate)}>
                  <View style={[styles.dayCircle, sel && styles.daySel]}>
                    <AppText
                      variant={sel ? 'calDaySel' : 'calDay'}
                      color={sel ? COLORS.calGridSelText : COLORS.calDay}
                    >
                      {d}
                    </AppText>
                  </View>
                  <View style={styles.monthDotSlot}>
                    {hasEvent(viewY, viewM, d) ? <View style={styles.dot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>
      </Animated.View>

      {/* 핸들 */}
      <View {...pan.panHandlers} style={styles.handleWrap}>
        <Animated.View
          style={[styles.handle, { backgroundColor: handleColor, width: handleWidth, height: handleHeight }]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  navClip: { overflow: 'hidden' },
  navRow: { height: NAV_H, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  navBtn: { paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row' },
  cell: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  body: { overflow: 'hidden' },
  layer: { position: 'absolute', top: 0, left: 0, right: 0 },
  dayRow: { marginTop: DAY_ROW_MT },
  weekCol: { flex: 1, alignItems: 'center' },
  weekDayInner: { height: WEEK_DAY_H, alignItems: 'center', justifyContent: 'center' },
  weekDotSlot: { height: DOT_H, marginTop: WEEK_DOT_MT, alignItems: 'center', justifyContent: 'center' },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: COLORS.calDot },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  monthCell: { width: `${100 / 7}%`, height: MONTH_ROW_H, alignItems: 'center', justifyContent: 'center' },
  dayCircle: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  daySel: { backgroundColor: COLORS.calGridSelBg },
  monthDotSlot: { height: DOT_H, justifyContent: 'center', marginTop: 2 },
  handleWrap: { alignItems: 'center', marginTop: 17, paddingVertical: 8 },
  handle: { borderRadius: 3 },
});
