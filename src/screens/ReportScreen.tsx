import { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from '../components/AppText';
import { COLORS } from '../constants/token';

import WeeklyReport from './WeeklyReport';
import DailyReport from './DailyReport';

type ReportType = 'weekly' | 'daily';

export default function ReportScreen() {
  const insets = useSafeAreaInsets();

  // 기본 선택을 일간으로 설정
  const [reportType, setReportType] =
    useState<ReportType>('daily');

  return (
    <View style={styles.root}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: insets.top + 17,
            paddingBottom: insets.bottom + 120,
          },
        ]}
      >
        {/* 화면 제목 */}
        <AppText
          variant="reportTitle"
          color={COLORS.black}
          style={styles.title}
        >
          집중 패턴 리포트
        </AppText>

        {/* 일간 / 주간 선택 */}
        <View style={styles.tabContainer}>
          {/* 일간 탭 */}
          <Pressable
            style={[
              styles.tab,
              reportType === 'daily' && styles.activeTab,
            ]}
            onPress={() => setReportType('daily')}
          >
            <AppText
              variant="bodyTask"
              color={
                reportType === 'daily'
                  ? COLORS.gray700
                  : COLORS.gray400
              }
              style={
                reportType === 'daily'
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              일간
            </AppText>
          </Pressable>

          {/* 주간 탭 */}
          <Pressable
            style={[
              styles.tab,
              reportType === 'weekly' && styles.activeTab,
            ]}
            onPress={() => setReportType('weekly')}
          >
            <AppText
              variant="bodyTask"
              color={
                reportType === 'weekly'
                  ? COLORS.gray700
                  : COLORS.gray400
              }
              style={
                reportType === 'weekly'
                  ? styles.activeTabText
                  : styles.inactiveTabText
              }
            >
              주간
            </AppText>
          </Pressable>
        </View>

        {/* 일간 / 주간 리포트 */}
        {reportType === 'daily' ? (
          <DailyReport />
        ) : (
          <WeeklyReport />
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },

  content: {
    paddingHorizontal: 21,
  },

  title: {
    fontFamily: 'SUIT-Bold',
    fontSize: 18,
    textAlign: 'center',
  },

  tabContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    height: 48,
    marginTop: 17,
    marginBottom: 26,
    padding: 4,
    borderRadius: 14,
    backgroundColor: COLORS.gray200,
  },

  tab: {
    flex: 1,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },

  activeTab: {
    backgroundColor: COLORS.white,
  },

  activeTabText: {
    fontFamily: 'SUIT-ExtraBold',
    fontSize: 15,
    lineHeight: 18,
    color: COLORS.gray700,
  },

  inactiveTabText: {
    fontFamily: 'SUIT-Bold',
    fontSize: 15,
    lineHeight: 18,
    color: COLORS.gray400,
  },
});
