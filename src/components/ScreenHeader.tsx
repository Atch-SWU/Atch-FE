import { ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import AppText from './AppText';
import AddButton from './AddButton';
import { COLORS, SPACING } from '../constants/token';

/** 헤더 텍스트를 피그마(상단 30)보다 이만큼 위로 올리고, 같은 값을 아래 여백으로 줘서 스크롤 시 콘텐츠와 간격 확보 */
export const HEADER_LIFT = 16;
const HEADER_TOP_GAP = 30 - HEADER_LIFT;

interface ScreenHeaderProps {
  /** 예: "5월 19일 화요일" */
  date: string;
  title: string;
  /** 제목 오른쪽 배지 등 */
  titleAccessory?: ReactNode;
  onPressAdd?: () => void;
}

/**
 * 탭 화면 공통 상단 헤더 (피그마 홈/투두): 날짜 15 Bold + 제목 24 ExtraBold, 우측 + 버튼은 두 줄 기준 세로 중앙.
 * 스크롤 영역 바깥에 두면 스크롤해도 고정된다.
 */
export default function ScreenHeader({ date, title, titleAccessory, onPressAdd }: ScreenHeaderProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.wrap, { paddingTop: insets.top + HEADER_TOP_GAP }]}>
      <View style={styles.row}>
        <View style={styles.texts}>
          <AppText variant="todoDate" color={COLORS.textBody}>{date}</AppText>
          <View style={styles.titleRow}>
            <AppText variant="todoScreenTitle" color={COLORS.textMain}>{title}</AppText>
            {titleAccessory}
          </View>
        </View>
        <AddButton onPress={onPressAdd} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { paddingHorizontal: SPACING.screenH, paddingBottom: HEADER_LIFT, backgroundColor: COLORS.background },
  row: { height: 62, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  texts: { flex: 1 },
  titleRow: { marginTop: 2, flexDirection: 'row', alignItems: 'center', gap: 6 },
});
