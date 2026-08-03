import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AppText from './AppText';
import ToggleSwitch from './ToggleSwitch';
import Calendar from './Calendar';
import CalendarIcon from '../assets/icon/calendar.svg';
import ClockOutline from '../assets/icon/clock-outline.svg';
import { COLORS } from '../constants/token';

type OpenKey = 'startDate' | 'startTime' | 'endDate' | 'endTime' | null;

interface PeriodCardProps {
  allDay: boolean;
  onToggleAllDay: (v: boolean) => void;
  startDate: Date | null;
  startTime: Date | null;
  endDate: Date | null;
  endTime: Date | null;
  onChangeStartDate: (d: Date) => void;
  onChangeStartTime: (d: Date) => void;
  onChangeEndDate: (d: Date) => void;
  onChangeEndTime: (d: Date) => void;
}

const pad = (n: number) => String(n).padStart(2, '0');
const fmtDate = (d: Date) => `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`;
const fmtTime = (d: Date) => {
  let h = d.getHours();
  const ampm = h < 12 ? 'AM' : 'PM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${ampm} ${pad(h)}:${pad(d.getMinutes())}`;
};
const defaultTime = () => {
  const d = new Date();
  d.setHours(18, 0, 0, 0);
  return d;
};

function Pill({
  label, active, minWidth, iconType, onPress,
}: {
  label: string | null;
  active: boolean;
  minWidth: number;
  iconType: 'date' | 'time';
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={[styles.pill, { minWidth }]}>
      {label != null ? (
        <AppText variant="formText" color={active ? COLORS.pillActiveText : COLORS.pillText}>{label}</AppText>
      ) : iconType === 'date' ? (
        <CalendarIcon width={18} height={18} color={active ? COLORS.pillActiveText : COLORS.pillIcon} />
      ) : (
        <ClockOutline width={18} height={18} color={active ? COLORS.pillActiveText : COLORS.pillIcon} />
      )}
    </Pressable>
  );
}

/** iOS 네이티브 시간 피커 (실시간 반영, 버튼 없음) */
function TimePicker({ value, onChange }: { value: Date; onChange: (d: Date) => void }) {
  return (
    <View style={styles.timeWrap}>
      <DateTimePicker
        value={value}
        mode="time"
        display="spinner"
        minuteInterval={5}
        textColor={COLORS.textMain}
        onChange={(_e: unknown, d?: Date) => { if (d) onChange(d); }}
      />
    </View>
  );
}

/** 기간 설정 카드 */
export default function PeriodCard(props: PeriodCardProps) {
  const {
    allDay, onToggleAllDay,
    startDate, startTime, endDate, endTime,
    onChangeStartDate, onChangeStartTime, onChangeEndDate, onChangeEndTime,
  } = props;
  const [open, setOpen] = useState<OpenKey>(null);

  const openTime = (key: 'startTime' | 'endTime', current: Date | null, setter: (d: Date) => void) => {
    if (open === key) { setOpen(null); return; }
    if (current == null) setter(defaultTime());
    setOpen(key);
  };

  return (
    <View style={styles.card}>
      <View style={styles.rowToggle}>
        <AppText variant="formText" color={COLORS.formRowLabel}>하루 종일</AppText>
        <ToggleSwitch value={allDay} onValueChange={onToggleAllDay} />
      </View>

      <View style={styles.divider} />

      <View style={styles.row}>
        <AppText variant="formText" color={COLORS.formRowLabel}>시작</AppText>
        <View style={styles.pills}>
          <Pill label={startDate ? fmtDate(startDate) : null} active={open === 'startDate'} minWidth={108} iconType="date" onPress={() => setOpen(open === 'startDate' ? null : 'startDate')} />
          {!allDay && (
            <Pill label={startTime ? fmtTime(startTime) : null} active={open === 'startTime'} minWidth={89} iconType="time" onPress={() => openTime('startTime', startTime, onChangeStartTime)} />
          )}
        </View>
      </View>
      {open === 'startDate' && <Calendar value={startDate} onSelect={(d) => { onChangeStartDate(d); setOpen(null); }} />}
      {open === 'startTime' && <TimePicker value={startTime ?? defaultTime()} onChange={onChangeStartTime} />}

      <View style={styles.divider} />

      <View style={styles.row}>
        <AppText variant="formText" color={COLORS.formRowLabel}>종료</AppText>
        <View style={styles.pills}>
          <Pill label={endDate ? fmtDate(endDate) : null} active={open === 'endDate'} minWidth={108} iconType="date" onPress={() => setOpen(open === 'endDate' ? null : 'endDate')} />
          {!allDay && (
            <Pill label={endTime ? fmtTime(endTime) : null} active={open === 'endTime'} minWidth={89} iconType="time" onPress={() => openTime('endTime', endTime, onChangeEndTime)} />
          )}
        </View>
      </View>
      {open === 'endDate' && <Calendar value={endDate} onSelect={(d) => { onChangeEndDate(d); setOpen(null); }} />}
      {open === 'endTime' && <TimePicker value={endTime ?? defaultTime()} onChange={onChangeEndTime} />}
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: COLORS.inputBorder, borderRadius: 16, paddingHorizontal: 22 },
  rowToggle: { height: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  row: { height: 51, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: COLORS.formDivider },
  pills: { flexDirection: 'row', gap: 7 },
  pill: { backgroundColor: COLORS.pillBg, borderRadius: 12, paddingHorizontal: 14, height: 36, alignItems: 'center', justifyContent: 'center' },
  timeWrap: { paddingBottom: 8 },
});
