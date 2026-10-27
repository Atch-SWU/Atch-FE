import { useRef, useEffect, useState } from 'react';
import { View, Pressable, Animated, PanResponder, LayoutAnimation, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import AppText from './AppText';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import ChevronRight from '../assets/icon/chevron-right.svg';
import { COLORS } from '../constants/token';

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

// ===== 피그마 규격 (6:7827 주간 / 6:3986 월간) =====
const WEEK_H = 58;          // 주간 박스 높이
const BOX_W = 44;           // 일반 날짜 박스 폭
const BOX_SEL_W = 66;       // 선택된 날짜 박스 폭
const BOX_GAP = 5;
const BOX_RADIUS = 14;
const MONTH_RADIUS = 22;
const MONTH_PAD_H = 23;
const MONTH_TITLE_TOP = 24;
const MONTH_WEEKDAY_TOP = 69;
const MONTH_DAY_TOP = 111;
const MONTH_ROW_H = 46;
const MONTH_BOTTOM_PAD = 24;
const MONTH_CELL_W = 24;
const MONTH_SEL_SIZE = 36;

const monthHeight = (rows: number) => MONTH_DAY_TOP + MONTH_ROW_H * (rows - 1) + 22 + MONTH_BOTTOM_PAD;

export type SelDate = { y: number; m: number; day: number };

type Props = {
  selected: SelDate;
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

/** 주간 박스 캘린더 ↔ 월간 카드 캘린더 (핸들 드래그로 펼치기/접기) */
export default function WeekCalendar({ selected, onSelectDate, onGrab, onRelease }: Props) {
  const progress = useRef(new Animated.Value(0)).current; // 0=주간, 1=월간
  const grab = useRef(new Animated.Value(0)).current;
  const progressVal = useRef(0);
  const startProgress = useRef(0);
  const prevP = useRef(0);
  const distRef = useRef(1);
  const [monthActive, setMonthActive] = useState(false);

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

  // 월간 셀 (7열 고정)
  const firstDow = new Date(viewY, viewM, 1).getDay();
  const daysInMonth = new Date(viewY, viewM + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows = cells.length / 7;
  const H_MONTH = monthHeight(rows);
  distRef.current = H_MONTH - WEEK_H;

  // 주간 (선택일이 속한 주)
  const selObj = new Date(selected.y, selected.m, selected.day);
  const sunday = new Date(selObj);
  sunday.setDate(selObj.getDate() - selObj.getDay());
  const weekDays: SelDate[] = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return { y: d.getFullYear(), m: d.getMonth(), day: d.getDate() };
  });

  const bodyHeight = progress.interpolate({ inputRange: [0, 1], outputRange: [WEEK_H, H_MONTH] });
  const weekOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 0, 0] });
  const monthOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const bodyRadius = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, MONTH_RADIUS] });
  const handleColor = grab.interpolate({ inputRange: [0, 1], outputRange: [COLORS.fillDisabled, COLORS.primary] });
  const handleWidth = grab.interpolate({ inputRange: [0, 1], outputRange: [40, 48] });

  const snap = (to: number) =>
    Animated.spring(progress, { toValue: to, useNativeDriver: false, bounciness: 4, speed: 14 }).start();

  const changeMonth = (delta: number) => {
    let m = viewM + delta;
    let y = viewY;
    if (m < 0) { m = 11; y -= 1; }
    else if (m > 11) { m = 0; y += 1; }
    setViewM(m);
    setViewY(y);
    tap(() => Haptics.selectionAsync());
  };

  const onDayPress = (d: SelDate) => {
    tap(() => Haptics.selectionAsync());
    if (progressVal.current <= 0.5) {
      try { LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut); } catch {}
    }
    onSelectDate(d);
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
        tap(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Rigid));
      },
      onPanResponderMove: (_e, g) => {
        let p = startProgress.current + g.dy / distRef.current;
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
        if (Math.abs(g.dy) < 6) snap(startProgress.current > 0.5 ? 0 : 1);
        else snap(progressVal.current > 0.5 ? 1 : 0);
      },
    })
  ).current;

  return (
    <View>
      <Animated.View style={[styles.body, { height: bodyHeight, borderRadius: bodyRadius }]}>
        {/* ===== 주간: 날짜 박스 7개 ===== */}
        <Animated.View
          style={[styles.weekLayer, { opacity: weekOpacity }]}
          pointerEvents={monthActive ? 'none' : 'auto'}
        >
          {weekDays.map((d) => {
            const sel = sameDay(d, selected);
            return (
              <Pressable
                key={`w-${d.m}-${d.day}`}
                onPress={() => onDayPress(d)}
                style={[styles.box, sel ? styles.boxSel : styles.boxIdle]}
              >
                <AppText variant="weekDayLabel" color={sel ? COLORS.textMain : COLORS.textWeak}>
                  {WEEKDAYS[new Date(d.y, d.m, d.day).getDay()]}
                </AppText>
                <AppText
                  variant={sel ? 'weekDayNumSel' : 'weekDayNum'}
                  color={sel ? COLORS.primary : COLORS.textStrong}
                  style={styles.boxNum}
                >
                  {d.day}
                </AppText>
              </Pressable>
            );
          })}
        </Animated.View>

        {/* ===== 월간: 흰 카드 ===== */}
        <Animated.View
          style={[styles.monthLayer, { height: H_MONTH, opacity: monthOpacity }]}
          pointerEvents={monthActive ? 'auto' : 'none'}
        >
          <View style={styles.monthHead}>
            <AppText variant="monthTitle" color={COLORS.textStrong}>{`${viewY}년 ${viewM + 1}월`}</AppText>
            <View style={styles.monthArrows}>
              <Pressable hitSlop={12} onPress={() => changeMonth(-1)} style={styles.arrowBtn}>
                <ChevronLeft width={18} height={18} color={COLORS.iconWeak} />
              </Pressable>
              <Pressable hitSlop={12} onPress={() => changeMonth(1)} style={styles.arrowBtn}>
                <ChevronRight width={18} height={18} color={COLORS.iconWeak} />
              </Pressable>
            </View>
          </View>

          <View style={styles.monthWeekdays}>
            {WEEKDAYS.map((w) => (
              <View key={w} style={styles.monthCell}>
                <AppText variant="monthWeekday" color={COLORS.textPlaceholder}>{w}</AppText>
              </View>
            ))}
          </View>

          <View style={styles.monthDays}>
            {Array.from({ length: rows }).map((_, r) => (
              <View key={r} style={styles.monthRow}>
                {cells.slice(r * 7, r * 7 + 7).map((d, c) => {
                  if (d == null) return <View key={c} style={styles.monthCell} />;
                  const cellDate: SelDate = { y: viewY, m: viewM, day: d };
                  const sel = sameDay(cellDate, selected);
                  return (
                    <Pressable
                      key={c}
                      style={styles.monthCell}
                      hitSlop={{ top: 12, bottom: 12, left: 10, right: 10 }}
                      onPress={() => onDayPress(cellDate)}
                    >
                      {sel ? <View style={styles.monthSelBox} /> : null}
                      <AppText
                        variant={sel ? 'monthDaySel' : 'monthDay'}
                        color={sel ? COLORS.textInverse : COLORS.textStrong}
                      >
                        {d}
                      </AppText>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </Animated.View>
      </Animated.View>

      {/* 핸들: 캘린더 아래 여백에 배치 (레이아웃 간격은 피그마 그대로 유지) */}
      <View {...pan.panHandlers} style={styles.handleWrap}>
        <Animated.View style={[styles.handle, { backgroundColor: handleColor, width: handleWidth }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  body: { overflow: 'hidden' },
  // 주간
  weekLayer: { position: 'absolute', top: 0, left: 0, right: 0, height: WEEK_H, flexDirection: 'row', gap: BOX_GAP },
  box: {
    height: WEEK_H, borderRadius: BOX_RADIUS, alignItems: 'center', backgroundColor: COLORS.surface,
  },
  boxIdle: { flexGrow: BOX_W, flexBasis: 0, paddingTop: 8 },
  boxSel: {
    flexGrow: BOX_SEL_W, flexBasis: 0, paddingTop: 7,
    backgroundColor: COLORS.primarySoft, borderWidth: 1, borderColor: COLORS.primary,
  },
  boxNum: { marginTop: 7 },
  // 월간
  monthLayer: {
    position: 'absolute', top: 0, left: 0, right: 0,
    backgroundColor: COLORS.surface, borderRadius: MONTH_RADIUS, paddingHorizontal: MONTH_PAD_H,
  },
  monthHead: {
    position: 'absolute', top: MONTH_TITLE_TOP, left: MONTH_PAD_H, right: MONTH_PAD_H, height: 25,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  monthArrows: { flexDirection: 'row', gap: 21 },
  arrowBtn: { width: 18, height: 25, alignItems: 'center', justifyContent: 'center' },
  monthWeekdays: {
    position: 'absolute', top: MONTH_WEEKDAY_TOP, left: MONTH_PAD_H, right: MONTH_PAD_H,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  monthDays: { position: 'absolute', top: MONTH_DAY_TOP, left: MONTH_PAD_H, right: MONTH_PAD_H },
  monthRow: { height: MONTH_ROW_H, flexDirection: 'row', justifyContent: 'space-between' },
  monthCell: { width: MONTH_CELL_W, alignItems: 'center' },
  monthSelBox: {
    position: 'absolute', top: -7, left: (MONTH_CELL_W - MONTH_SEL_SIZE) / 2,
    width: MONTH_SEL_SIZE, height: MONTH_SEL_SIZE, borderRadius: BOX_RADIUS,
    backgroundColor: COLORS.primary,
  },
  // 핸들
  handleWrap: {
    position: 'absolute', left: 0, right: 0, bottom: -27, height: 24,
    alignItems: 'center', justifyContent: 'center',
  },
  handle: { height: 4, borderRadius: 2 },
});
