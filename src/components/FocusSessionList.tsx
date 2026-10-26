import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import { COLORS } from '../constants/token';
import { FocusSessionData } from '../data/reportDummyData';

interface FocusSessionListProps {
  sessions: FocusSessionData[];
}

const SESSION_ACCENT_COLOR = COLORS.orange600;

// 시간 텍스트가 차지하는 고정 폭
const TIME_COLUMN_WIDTH = 52;

// 시간과 메인 텍스트 사이 간격
const HEADER_GAP = 18;

// 메인 텍스트와 일시정지 텍스트 사이 간격
const PAUSE_GAP = 6;

export default function FocusSessionList({
  sessions,
}: FocusSessionListProps) {
  // API 연결 전 임시 처리:
  // 집중 시간이 가장 긴 세션을 가장 집중한 세션으로 표시
  const maxDuration = Math.max(
    ...sessions.map((session) => session.durationMinutes),
  );

  return (
    <View style={styles.list}>
      {sessions.map((session, index) => {
        const isMostFocused =
          session.durationMinutes === maxDuration;

        return (
          <View
            key={`${session.time}-${index}`}
            style={styles.card}
          >
            <View style={styles.sessionRow}>

              {/* 시간 */}
              <AppText
                variant="reportSessionTime"
                color={
                  isMostFocused
                    ? SESSION_ACCENT_COLOR
                    : COLORS.gray800
                }
                style={styles.timeText}
              >
                {session.time}
              </AppText>

              {/* 제목 + 일시정지 */}
              <View style={styles.sessionInfo}>

                <AppText
                  variant="reportSessionTitle"
                  color={COLORS.gray700}
                  style={styles.titleText}
                  numberOfLines={1}
                >
                  {session.title}
                </AppText>

                <AppText
                  variant="reportSessionPause"
                  color={COLORS.gray500}
                  style={styles.pauseText}
                >
                  일시정지 {session.interruptions}회
                </AppText>

              </View>

              {/* 집중 시간 */}
              <View style={styles.durationRow}>
                <AppText
                  variant="reportSessionDurationValue"
                  color={COLORS.gray800}
                >
                  {session.durationMinutes}
                </AppText>

                <AppText
                  variant="reportSessionDurationUnit"
                  color={COLORS.gray400}
                >
                  M
                </AppText>
              </View>

            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  sessionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  timeText: {
    width: TIME_COLUMN_WIDTH,
    textAlign: 'center',
  },

  sessionInfo: {
    flex: 1,
    marginLeft: HEADER_GAP,
  },

  titleText: {
    flex: 1,
  },

  pauseText: {
    marginTop: PAUSE_GAP,
  },

  durationRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
});