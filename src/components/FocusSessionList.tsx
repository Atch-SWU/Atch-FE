import { View, StyleSheet } from 'react-native';

import AppText from './AppText';
import { COLORS } from '../constants/token';
import { FocusSessionData } from '../data/reportDummyData';

interface FocusSessionListProps {
  sessions: FocusSessionData[];
}


const SESSION_ACCENT_COLOR = '#2FCCDC';

// 시간(예: "10:10") 컬럼의 고정 폭 — 태그 줄 들여쓰기를 여기에 맞춰 정렬.
const TIME_COLUMN_WIDTH = 52;
const HEADER_GAP = 12;


export default function FocusSessionList({
  sessions,
}: FocusSessionListProps) {
  return (
    <View style={styles.list}>
      {sessions.map((session, index) => (
        <View key={`${session.time}-${index}`} style={styles.card}>

          <View style={styles.headerRow}>
            <AppText
              variant="reportSessionTime"
              color={SESSION_ACCENT_COLOR}
              style={styles.timeText}
            >
              {session.time}
            </AppText>

            <AppText
              variant="reportSessionTitle"
              color={COLORS.grey900}
              style={styles.titleText}
              numberOfLines={1}
            >
              {session.title}
            </AppText>

            <AppText
              variant="reportSessionDuration"
              color={SESSION_ACCENT_COLOR}
            >
              {session.durationMinutes}분
            </AppText>
          </View>

          <View style={styles.tagRow}>
            <View
              style={[
                styles.tag,
                session.completed
                  ? styles.tagCompletedBg
                  : styles.tagIncompleteBg,
              ]}
            >
              <AppText variant="reportTagText" color={COLORS.white}>
                {session.completed ? '완료' : '미완료'}
              </AppText>
            </View>

            <View style={[styles.tag, styles.tagInterruptBg]}>
              <AppText variant="reportTagText" color={SESSION_ACCENT_COLOR}>
                중단 {session.interruptions}회
              </AppText>
            </View>
          </View>

        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: 14,
  },

  card: {
    backgroundColor: COLORS.main20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.main80,
    paddingHorizontal: 20,
    paddingVertical: 18,
    gap: 8,
  },

  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: HEADER_GAP,
  },

  timeText: {
    width: TIME_COLUMN_WIDTH,
  },

  titleText: {
    flex: 1,
  },

  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginLeft: TIME_COLUMN_WIDTH + HEADER_GAP,
  },

  tag: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  tagCompletedBg: {
    backgroundColor: COLORS.main80,
  },

  tagIncompleteBg: {
    backgroundColor: COLORS.grey700,
  },

  tagInterruptBg: {
    backgroundColor: COLORS.white,
  },
});
