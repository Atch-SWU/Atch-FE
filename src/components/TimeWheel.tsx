import { useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

const ITEM_H = 46;
const VISIBLE = 5;

export interface TimeValue {
  ampm: 'AM' | 'PM';
  hour: number;
  minute: number;
}

const AMPM: ('AM' | 'PM')[] = ['AM', 'PM'];
const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const MINUTES = Array.from({ length: 12 }, (_, i) => i * 5);

interface ColumnProps {
  items: string[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}

function Column({ items, selectedIndex, onSelect }: ColumnProps) {
  const ref = useRef<ScrollView>(null);
  useEffect(() => {
    ref.current?.scrollTo({ y: selectedIndex * ITEM_H, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM_H);
    onSelect(Math.max(0, Math.min(items.length - 1, idx)));
  };

  return (
    <ScrollView
      ref={ref}
      style={styles.col}
      showsVerticalScrollIndicator={false}
      nestedScrollEnabled
      snapToInterval={ITEM_H}
      decelerationRate="fast"
      onMomentumScrollEnd={onEnd}
      contentContainerStyle={styles.colContent}
    >
      {items.map((it, i) => (
        <View key={i} style={styles.item}>
          <AppText
            variant={i === selectedIndex ? 'wheelSelected' : 'wheelIdle'}
            color={i === selectedIndex ? COLORS.wheelSelectedColor : COLORS.wheelIdleColor}
          >
            {it}
          </AppText>
        </View>
      ))}
    </ScrollView>
  );
}

interface TimeWheelProps {
  value: TimeValue;
  onChange: (v: TimeValue) => void;
}

/** 인라인 시간 휠 (AM/PM · 시 · 분) */
export default function TimeWheel({ value, onChange }: TimeWheelProps) {
  return (
    <View style={styles.wrap}>
      <Column
        items={AMPM}
        selectedIndex={AMPM.indexOf(value.ampm)}
        onSelect={(i) => onChange({ ...value, ampm: AMPM[i] })}
      />
      <Column
        items={HOURS.map((h) => String(h))}
        selectedIndex={HOURS.indexOf(value.hour)}
        onSelect={(i) => onChange({ ...value, hour: HOURS[i] })}
      />
      <Column
        items={MINUTES.map((m) => String(m).padStart(2, '0'))}
        selectedIndex={MINUTES.indexOf(value.minute)}
        onSelect={(i) => onChange({ ...value, minute: MINUTES[i] })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', height: ITEM_H * VISIBLE, paddingVertical: 8 },
  col: { flex: 1 },
  colContent: { paddingVertical: ITEM_H * 2 },
  item: { height: ITEM_H, alignItems: 'center', justifyContent: 'center' },
});
