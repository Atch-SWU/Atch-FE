import { useMemo, useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '../components/AppText';
import { COLORS, SPACING } from '../constants/token';

import WeeklyReport from './WeeklyReport';
import DailyReport from './DailyReport';

type ReportType = 'weekly' | 'daily';

const TAB_MARGIN_H = 41;

export default function ReportScreen() {
  const insets = useSafeAreaInsets();
  const { width: windowWidth } = useWindowDimensions();

  const [reportType, setReportType] =
    useState<ReportType>('weekly');

  // 좌우 여백(TAB_MARGIN_H)은 고정하고 화면 폭에 맞춰 탭 바 가로 길이를 계산
  // (히트맵 셀 · 막대 그래프 · 통계 카드와 동일한 방식).
  const tabContainerWidth = useMemo(
    () => windowWidth - TAB_MARGIN_H * 2,
    [windowWidth],
  );

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 28,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        {/* 화면 제목 */}
        <AppText
          variant="reportTitle"
          color={COLORS.textMain}
        >
          집중 패턴 리포트
        </AppText>

        {/* 주간 / 일간 선택 */}
        <View
          style={[
            styles.tabContainer,
            { width: tabContainerWidth },
          ]}
        >
          <Pressable
            style={[
              styles.tab,
              reportType === 'weekly' && styles.activeTab,
            ]}
            onPress={() => setReportType('weekly')}
          >
            <AppText variant="bodyTask" color={COLORS.grey700}>
              주간
            </AppText>
          </Pressable>

          <Pressable
            style={[
              styles.tab,
              reportType === 'daily' && styles.activeTab,
            ]}
            onPress={() => setReportType('daily')}
          >
            <AppText variant="bodyTask" color={COLORS.grey700}>
              일간
            </AppText>
          </Pressable>
        </View>

        {/* 주간 / 일간 레포트 */}
        {reportType === 'weekly' ? (
          <WeeklyReport />
        ) : (
          <DailyReport />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  content: {
    paddingHorizontal: SPACING.screenH,
  },

  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    height: 48,
    marginTop: 28,
    marginBottom: 26,
    paddingHorizontal: 4,
    borderRadius: 60,
    backgroundColor: COLORS.grey200,
  },

  tab: {
    flex: 1,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 60,
  },

  activeTab: {
    backgroundColor: COLORS.white,
  },
});