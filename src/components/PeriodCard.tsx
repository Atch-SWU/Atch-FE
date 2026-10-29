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
export const fmtDate = (d: Date) => `${d.getFullYear()}. ${pad(d.getMonth() + 1)}. ${pad(d.getDate())}.`;
export const fmtTime = (d: Date) => {
  let h = d.getHours();
  const ampm = h < 12 ? 'AM' : 'PM';
  h = h % 12;
  if (h === 0) h = 12;
  return `${ampm} ${pad(h)}:${pad(d.getMinutes())}`;
};

function Pill({
  label, active, width, iconType, onPress,
}: { label: string | null; active: boolean; width: number; iconType: 'date' | 'time'; onPress: () => void }) {
  const iconColor = active ? COLORS.primary : COLORS.iconWeak;
  return (
    <Pressable onPress={onPress} style={[styles.pill, { width }, active && styles.pillActive]}>
      {label != null ? (
        <AppText variant="formPillText" color={active ? COLORS.primary : COLORS.textBody}>{label}</AppText>
      ) : iconType === 'date' ? (
        <CalendarIcon width={18} height={18} color={iconColor} />
      ) : (
        <ClockOutline width={18} height={18} color={iconColor} />
      )}
    </Pressable>
  );
}

const defaultTime = (hour: number) => {
  const d = new Date();
  d.setHours(hour, 0, 0, 0);
  return d;
};

/** iOS 네이티브 시간 피커 (실시간 반영, 확인 버튼 없음 — 필을 다시 누르면 닫힘) */
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

/** 기간 설정 (피그마 6:4316 / 6:5083 / 6:5219): 행 3개 각 55h r12, 간격 4, 피커는 해당 카드 안에서 확장 */
export default function PeriodCard(props: PeriodCardProps) {
  const {
    allDay, onToggleAllDay,
    startDate, startTime, endDate, endTime,
    onChangeStartDate, onChangeStartTime, onChangeEndDate, onChangeEndTime,
  } = props;
  const [open, setOpen] = useState<OpenKey>(null);
  const toggle = (k: Exclude<OpenKey, null>) => setOpen(open === k ? null : k);

  const renderRow = (
    label: string,
    dKey: 'startDate' | 'endDate',
    tKey: 'startTime' | 'endTime',
    date: Date | null,
    time: Date | null,
    onDate: (d: Date) => void,
    onTime: (d: Date) => void,
    defaultHour: number,
    minDate: Date,
  ) => (
    <View style={styles.card}>
      <View style={styles.row}>
        <AppText variant="formRowText" color={COLORS.textStrong}>{label}</AppText>
        <View style={styles.pills}>
          <Pill label={date ? fmtDate(date) : null} active={open === dKey} width={108} iconType="date" onPress={() => toggle(dKey)} />
          {!allDay && (
            <Pill
              label={time ? fmtTime(time) : null}
              active={open === tKey}
              width={89}
              iconType="time"
              onPress={() => {
                if (open !== tKey && !time) onTime(defaultTime(defaultHour));
                toggle(tKey);
              }}
            />
          )}
        </View>
      </View>
      {open === dKey && (
        <>
          <View style={styles.divider} />
          <Calendar value={date} minDate={minDate} onSelect={(d) => { onDate(d); setOpen(null); }} />
        </>
      )}
      {open === tKey && !allDay && (
        <>
          <View style={styles.divider} />
          <TimePicker value={time ?? defaultTime(defaultHour)} onChange={onTime} />
        </>
      )}
    </View>
  );

  return (
    <View style={styles.wrap}>
      <View style={[styles.card, styles.row]}>
        <AppText variant="formRowText" color={COLORS.textStrong}>하루 종일</AppText>
        <ToggleSwitch variant="form" value={allDay} onValueChange={onToggleAllDay} />
      </View>
      {renderRow('시작', 'startDate', 'startTime', startDate, startTime, onChangeStartDate, onChangeStartTime, 18, new Date())}
      {renderRow('종료', 'endDate', 'endTime', endDate, endTime, onChangeEndDate, onChangeEndTime, 19, startDate ?? new Date())}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 4 },
  card: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    backgroundColor: COLORS.surface, paddingHorizontal: 21, overflow: 'hidden',
  },
  row: { height: 53, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  divider: { height: 1, backgroundColor: COLORS.border },
  pills: { flexDirection: 'row', gap: 6 },
  pill: { height: 36, borderRadius: 12, backgroundColor: COLORS.formPillBg, alignItems: 'center', justifyContent: 'center' },
  pillActive: { backgroundColor: COLORS.fillSoft },
  timeWrap: { paddingVertical: 4 },
});
