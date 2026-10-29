import { View, Pressable, StyleSheet } from 'react-native';
import AppText from './AppText';
import SwipeDeleteRow from './SwipeDeleteRow';
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

/** 투두리스트 '오늘 할 일' 항목 (피그마 6:7860 · 스와이프 삭제 6:7920) */
export default function TaskListItem({ title, parent, estimateText, onPress, onDelete }: TaskListItemProps) {
  return (
    <SwipeDeleteRow onDelete={onDelete}>
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
    </SwipeDeleteRow>
  );
}

const styles = StyleSheet.create({
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
