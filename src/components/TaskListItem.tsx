import { useRef } from 'react';
import { View, Pressable, Animated, PanResponder, StyleSheet } from 'react-native';
import AppText from './AppText';
import TrashIcon from '../assets/icon/trash.svg';
import { COLORS } from '../constants/token';

interface TaskListItemProps {
  title: string;
  /** 상위 태스크 이름 (있으면 제목 위에 작게) */
  parent?: string;
  estimateText: string;
  onPress?: () => void;
  /** 왼쪽 스와이프 → 휴지통 탭 시 */
  onDelete?: () => void;
}

const TRASH_W = 56;
const TRASH_GAP = 9;
const OPEN_X = -(TRASH_W + TRASH_GAP); // -65

/** 투두리스트 '오늘 할 일' 항목 (피그마 6:7860 · 스와이프 삭제 6:7920) */
export default function TaskListItem({ title, parent, estimateText, onPress, onDelete }: TaskListItemProps) {
  const tx = useRef(new Animated.Value(0)).current;
  const txVal = useRef(0);
  const base = useRef(0);

  const animateTo = (to: number) => {
    Animated.spring(tx, { toValue: to, useNativeDriver: true, bounciness: 0, speed: 20 }).start();
    txVal.current = to;
  };

  const pan = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_e, g) => Math.abs(g.dx) > 8 && Math.abs(g.dx) > Math.abs(g.dy) * 1.5,
      onPanResponderTerminationRequest: () => false,
      onPanResponderGrant: () => {
        tx.stopAnimation((v) => { base.current = v; });
      },
      onPanResponderMove: (_e, g) => {
        const next = Math.min(0, Math.max(OPEN_X, base.current + g.dx));
        tx.setValue(next);
        txVal.current = next;
      },
      onPanResponderRelease: () => animateTo(txVal.current < OPEN_X / 2 ? OPEN_X : 0),
      onPanResponderTerminate: () => animateTo(txVal.current < OPEN_X / 2 ? OPEN_X : 0),
    })
  ).current;

  return (
    <View style={styles.wrap}>
      {onDelete ? (
        <Pressable
          style={styles.trash}
          onPress={() => {
            animateTo(0);
            onDelete();
          }}
        >
          <TrashIcon width={20} height={20} color={COLORS.textWeak} />
        </Pressable>
      ) : null}

      <Animated.View {...(onDelete ? pan.panHandlers : {})} style={[styles.card, { transform: [{ translateX: tx }] }]}>
        <Pressable style={styles.row} onPress={onPress}>
          <View style={styles.texts}>
            {parent ? <AppText variant="todoParent" color={COLORS.textWeak}>{parent}</AppText> : null}
            <AppText
              variant="todoItemTitleText"
              color={COLORS.textBody}
              style={parent ? styles.titleWithParent : undefined}
            >
              {title}
            </AppText>
          </View>
          <View style={styles.chip}>
            <AppText variant="todoChipText" color={COLORS.textSub}>{estimateText}</AppText>
          </View>
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: 14, overflow: 'hidden' },
  trash: {
    position: 'absolute', right: 0, top: 0, bottom: 0, width: TRASH_W,
    borderRadius: 14, alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.fillMuted,
  },
  card: { borderRadius: 14, backgroundColor: COLORS.surface },
  row: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingVertical: 16,
  },
  texts: { flex: 1, marginRight: 12 },
  titleWithParent: { marginTop: 6 },
  chip: {
    height: 25, paddingHorizontal: 8, borderRadius: 10,
    justifyContent: 'center', backgroundColor: COLORS.fillSoft,
  },
});
