import { ReactNode, useRef } from 'react';
import { View, Pressable, Animated, PanResponder, StyleSheet } from 'react-native';
import TrashIcon from '../assets/icon/trash.svg';
import { COLORS } from '../constants/token';

interface SwipeDeleteRowProps {
  children: ReactNode;
  /** 왼쪽으로 밀어 나타난 휴지통을 눌렀을 때. 없으면 스와이프 없이 children 만 그린다. */
  onDelete?: () => void;
  radius?: number;
  /** 밀리는 면의 배경 */
  backgroundColor?: string;
  trashWidth?: number;
  /** 면과 휴지통 사이 간격 */
  gap?: number;
}

/** 왼쪽 스와이프 → 휴지통이 나타나는 행 (투두리스트 삭제 피그마 6:7920). 투두 목록·세부 분량 목록에서 공통으로 쓴다. */
export default function SwipeDeleteRow({
  children, onDelete, radius = 14, backgroundColor = COLORS.surface, trashWidth = 56, gap = 9,
}: SwipeDeleteRowProps) {
  const openX = -(trashWidth + gap);
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
        const next = Math.min(0, Math.max(openX, base.current + g.dx));
        tx.setValue(next);
        txVal.current = next;
      },
      onPanResponderRelease: () => animateTo(txVal.current < openX / 2 ? openX : 0),
      onPanResponderTerminate: () => animateTo(txVal.current < openX / 2 ? openX : 0),
    }),
  ).current;

  if (!onDelete) return <View style={{ borderRadius: radius, backgroundColor }}>{children}</View>;

  return (
    <View style={[styles.wrap, { borderRadius: radius }]}>
      <Pressable
        style={[styles.trash, { width: trashWidth, borderRadius: radius }]}
        onPress={() => {
          animateTo(0);
          onDelete();
        }}
      >
        <TrashIcon width={20} height={20} color={COLORS.textWeak} />
      </Pressable>
      <Animated.View
        {...pan.panHandlers}
        style={{ borderRadius: radius, backgroundColor, transform: [{ translateX: tx }] }}
      >
        {children}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { overflow: 'hidden' },
  trash: {
    position: 'absolute', right: 0, top: 0, bottom: 0,
    alignItems: 'center', justifyContent: 'center',
    backgroundColor: COLORS.fillMuted,
  },
});
