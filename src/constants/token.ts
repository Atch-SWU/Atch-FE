/**
 * 디자인 토큰 (청록/main 기반 — Figma 공식 컬러칩 반영)
 * ------------------------------------------------------------------
 * 컴포넌트·화면에서는 hex 직접 사용 금지. 아래 토큰만 참조.
 * hex 원본값은 오직 PALETTE 에만 존재.
 * 카테고리(업무/학습)는 현재 모두 청록(main)으로 통일 — 나중에 색 구분이
 * 필요하면 CATEGORY_COLORS 의 해당 값만 바꾸면 됨.
 * (ExtraBold 자리는 Pretendard-ExtraBold.otf 부재로 Bold 매핑)
 * ------------------------------------------------------------------
 */

export const TYPOGRAPHY = {
  mainTitle: { fontFamily: 'Pretendard-Bold', fontSize: 28, lineHeight: 40 },
  titleImportantTop: { fontFamily: 'Pretendard-SemiBold', fontSize: 26, lineHeight: 36, letterSpacing: -1.5 },
  titleCore: { fontFamily: 'Pretendard-SemiBold', fontSize: 20, lineHeight: 28 },
  titleSmall: { fontFamily: 'Pretendard-SemiBold', fontSize: 18, lineHeight: 26 },
  bodyImportant: { fontFamily: 'Pretendard-Regular', fontSize: 18, lineHeight: 26 },
  bodyTask: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 24 },
  bodySmall: { fontFamily: 'Pretendard-Medium', fontSize: 14, lineHeight: 20, letterSpacing: -2 },

  homeDate: { fontFamily: 'Pretendard-SemiBold', fontSize: 18, lineHeight: 22, letterSpacing: -0.27 },
  homeHeadline: { fontFamily: 'OkDanDan-Bold', fontSize: 26, lineHeight: 31, letterSpacing: -0.39 },
  countBadge: { fontFamily: 'Pretendard-SemiBold', fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  cardTitle: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 20, letterSpacing: -0.24 },
  cardMeta: { fontFamily: 'Pretendard-SemiBold', fontSize: 12, lineHeight: 15, letterSpacing: -0.18 },
  badgeLabel: { fontFamily: 'Pretendard-SemiBold', fontSize: 12, lineHeight: 14 },
  sectionLabel: { fontFamily: 'Pretendard-Bold', fontSize: 14, lineHeight: 17 },
  sectionLabelLg: { fontFamily: 'OkDanDan-Bold', fontSize: 18, lineHeight: 22 },
  completedDate: { fontFamily: 'Pretendard-Medium', fontSize: 12, lineHeight: 14, letterSpacing: -0.15 },
  completedTitle: { fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, letterSpacing: -0.21 },

  timerTime: { fontFamily: 'OkDanDan-Bold', fontSize: 60, lineHeight: 72, letterSpacing: -0.9 },
  primaryBtn: { fontFamily: 'Pretendard-Bold', fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  subtleBtn: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 19, letterSpacing: -0.24 },
  estLabel: { fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17, letterSpacing: -0.42 },
  estLabelNum: { fontFamily: 'Pretendard-Bold', fontSize: 14, lineHeight: 17, letterSpacing: -0.21 },
  estPercent: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 19, letterSpacing: -0.48 },
  estSoft: { fontFamily: 'Pretendard-Medium', fontSize: 14, lineHeight: 17, letterSpacing: -0.42 },

  completionTime: { fontFamily: 'OkDanDan-Bold', fontSize: 36, lineHeight: 43, letterSpacing: -0.54 },
  completionSub: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 19, letterSpacing: -0.24 },
  statValueBold: { fontFamily: 'Pretendard-Bold', fontSize: 24, lineHeight: 29, letterSpacing: -0.36 },
  statValueSemi: { fontFamily: 'Pretendard-SemiBold', fontSize: 24, lineHeight: 29, letterSpacing: -0.36 },
  statCaption: { fontFamily: 'Pretendard-Medium', fontSize: 12, lineHeight: 14, letterSpacing: -0.18 },
  nextTaskLabel: { fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 19 },
  doneTaskDate: { fontFamily: 'Pretendard-Medium', fontSize: 12, lineHeight: 14, letterSpacing: -0.18 },
  doneTaskTitle: { fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 19, letterSpacing: -0.24 },

  dialogTitle: { fontFamily: 'Pretendard-Bold', fontSize: 20, lineHeight: 24, letterSpacing: -0.3 },
  dialogBody: { fontFamily: 'Pretendard-Medium', fontSize: 14, lineHeight: 20 },

  // 태스크 추가 폼
  formLabel: { fontFamily: 'Pretendard-SemiBold', fontSize: 14, lineHeight: 17 },
  formText: { fontFamily: 'Pretendard-Medium', fontSize: 14, lineHeight: 17 },
  formBody: { fontFamily: 'Pretendard-Regular', fontSize: 14, lineHeight: 17 },
  tipTitle: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 22 },
  calHeader: { fontFamily: 'Pretendard-SemiBold', fontSize: 18, lineHeight: 24, letterSpacing: -0.27 },
  calGridDay: { fontFamily: 'Pretendard-Medium', fontSize: 16, lineHeight: 20 },
  wheelSelected: { fontFamily: 'Pretendard-Bold', fontSize: 24, lineHeight: 30 },
  wheelIdle: { fontFamily: 'Pretendard-Medium', fontSize: 22, lineHeight: 28 },

  // 투두리스트
  screenTitle: { fontFamily: 'Griun-InaDoongdoong', fontSize: 26, lineHeight: 37, letterSpacing: -0.39 },
  sectionHeader: { fontFamily: 'OkDanDan-Bold', fontSize: 18, lineHeight: 22, letterSpacing: -0.5 },
  calWeekday: { fontFamily: 'Pretendard-Medium', fontSize: 15, lineHeight: 18, letterSpacing: -0.15 },
  calWeekdaySel: { fontFamily: 'Pretendard-SemiBold', fontSize: 15, lineHeight: 18, letterSpacing: -0.15 },
  calDay: { fontFamily: 'Pretendard-Medium', fontSize: 16, lineHeight: 19, letterSpacing: -0.24 },
  calDaySel: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 19, letterSpacing: -0.24 },
  todoTitle: { fontFamily: 'Pretendard-Bold', fontSize: 16, lineHeight: 19 },
  todoTime: { fontFamily: 'Pretendard-SemiBold', fontSize: 12, lineHeight: 14 },
  doneRowText: { fontFamily: 'Pretendard-SemiBold', fontSize: 16, lineHeight: 19 },
} as const;

export type TypographyToken = keyof typeof TYPOGRAPHY;

const PALETTE = {
  // ===== 확정: Figma 공식 컬러칩 =====
  main100: '#2FCCDC', main80: '#68DCE8', main60: '#8EEAF3', main40: '#B3EBF3', main20: '#DEF6FB',
  white: '#FFFFFF', black: '#000000',
  grey100: '#F7F9F9', grey200: '#ECEEEE', grey300: '#DBDCDC', grey400: '#B4B7B7', grey500: '#919494',
  grey600: '#6B6C6C', grey700: '#4F5151', grey800: '#303030', grey900: '#131414',
  // 보조 중립(칩 외 임시)
  grey50: '#F5F5F5', grey575: '#575757', greyDate: '#7C7C7C',
  completedBg: '#EBEBEB', completedBorder: '#E0E0E0', completedBadgeBg: '#8E8E8E',
  cardTitleText: '#2A2A2A', sectionLabelText: '#323232',
} as const;

export const COLORS = {
  ...PALETTE,
  primary: PALETTE.main100,
  background: PALETTE.white,
  surface: PALETTE.grey100,
  textMain: PALETTE.grey900,
  textSub: PALETTE.grey600,
  border: PALETTE.grey300,

  accent: PALETTE.main100,          // 청록 하이라이트
  onAccent: PALETTE.white,
  cardTitle: PALETTE.cardTitleText,
  sectionLabel: PALETTE.sectionLabelText,

  // 홈 헤더
  dateText: PALETTE.grey700,        // 날짜 텍스트(진회색 #4F5151)
  countBadgeBg: PALETTE.grey700,    // 카운트 뱃지(진회색)
  countBadgeText: PALETTE.white,
  addBtnBg: PALETTE.grey900,        // + 버튼(검정)
  addBtnIcon: PALETTE.white,
  checkBadgeBg: PALETTE.grey500,    // 빈 상태 체크 뱃지

  // 하단 네비
  navBarBg: PALETTE.white,
  navActiveBg: PALETTE.grey900,     // 활성 탭(검정)
  navIconActive: PALETTE.white,
  navIconInactive: PALETTE.grey900,
  shadow: PALETTE.black,

  // 타이머/버튼/다이얼로그 (청록)
  ringTrack: PALETTE.grey200,
  ringProgress: PALETTE.main100,
  closeIcon: PALETTE.grey300,
  primaryBtnBg: PALETTE.main100,
  primaryBtnText: PALETTE.white,
  secondaryBtnBg: PALETTE.main20,
  secondaryBtnText: PALETTE.main100,
  softBtnBg: PALETTE.grey100,
  softBtnText: PALETTE.grey600,
  overtime: PALETTE.main100,
  timerText: PALETTE.cardTitleText,
  scrim: PALETTE.black,
  dialogCardBg: PALETTE.white,
  dialogIconBg: PALETTE.main20,
  dialogIconMark: PALETTE.main100,
  completionSubtitle: PALETTE.main100,
  nextDot: PALETTE.main100,

  // 태스크 추가 폼
  inputBorder: PALETTE.grey200,
  placeholderText: PALETTE.grey400,
  formRowLabel: PALETTE.grey700,
  pillBg: PALETTE.grey100,
  pillText: PALETTE.grey800,
  toggleTrackOff: PALETTE.grey200,
  toggleTrackOn: PALETTE.main100,
  toggleKnob: PALETTE.white,
  tipBg: PALETTE.main20,
  tipBorder: PALETTE.main40,
  tipText: PALETTE.main100,
  headerBackBg: PALETTE.grey100,
  headerBackIcon: PALETTE.grey700,
  headerConfirmBg: PALETTE.grey900,
  headerConfirmIcon: PALETTE.white,
  formDivider: PALETTE.grey200,
  calGridDayColor: PALETTE.grey800,
  calGridArrow: PALETTE.grey400,
  calGridSelBg: PALETTE.main100,
  calGridSelText: PALETTE.white,
  wheelSelectedColor: PALETTE.grey900,
  wheelIdleColor: PALETTE.grey400,
  pillIcon: PALETTE.grey400,
  pillActiveText: PALETTE.main100,

  // 투두리스트 — 캘린더
  calWeekday: PALETTE.grey400,
  calWeekdayActive: PALETTE.main100,
  calDay: PALETTE.grey700,
  calSelected: PALETTE.main100,
  calDot: PALETTE.main100,
  calHandle: PALETTE.grey200,
  // 투두리스트 — 마감 초과 카드
  overdueBg: PALETTE.main80,
  overdueBadgeBg: PALETTE.main40,
  overdueBadgeText: PALETTE.grey700,
  overdueTitle: PALETTE.grey800,
  overduePercent: PALETTE.grey700,
  overdueBarTrack: PALETTE.white,
  overdueBarFill: PALETTE.main60,
  overdueClockCircle: PALETTE.main40,
  overdueClockIcon: PALETTE.white,
  overdueTime: PALETTE.grey100,
  // 투두리스트 — 오늘 할 일 항목
  todoItemBg: PALETTE.main20,
  todoItemBorder: PALETTE.main80,
  todoCheckBg: PALETTE.white,
  todoCheckBorder: PALETTE.main80,
  todoBadgeBg: PALETTE.main60,
  todoBadgeText: PALETTE.grey700,
  todoItemTitle: PALETTE.main100,
  todoClockCircle: PALETTE.main60,
  todoClockIcon: PALETTE.white,
  todoTimeText: PALETTE.grey600,
  // 투두리스트 — 완료 행
  doneRowBg: PALETTE.grey100,
  doneCheckBg: PALETTE.grey400,
  doneRowTextColor: PALETTE.grey400,
} as const;

export const CATEGORY_COLORS = {
  work: {
    label: '업무',
    cardBg: PALETTE.main20, cardBorder: PALETTE.main60, badgeBg: PALETTE.main100,
    badgeText: PALETTE.white, metaText: PALETTE.main100, actionColor: PALETTE.main100,
    estimate: {
      cardBg: PALETTE.white, cardBorder: PALETTE.main80,
      strong: PALETTE.main100, soft: PALETTE.main80,
      barTrack: PALETTE.main20, barFill: PALETTE.main60,
    },
  },
  study: {
    label: '학습',
    cardBg: PALETTE.main20, cardBorder: PALETTE.main60, badgeBg: PALETTE.main100,
    badgeText: PALETTE.white, metaText: PALETTE.main100, actionColor: PALETTE.main100,
    estimate: {
      cardBg: PALETTE.white, cardBorder: PALETTE.main80,
      strong: PALETTE.main100, soft: PALETTE.main80,
      barTrack: PALETTE.main20, barFill: PALETTE.main60,
    },
  },
} as const;

export type CategoryKey = keyof typeof CATEGORY_COLORS;

export const COMPLETED_COLORS = {
  cardBg: PALETTE.completedBg, cardBorder: PALETTE.completedBorder, dateText: PALETTE.greyDate,
  titleText: PALETTE.grey900, badgeBg: PALETTE.completedBadgeBg, badgeText: PALETTE.white,
} as const;

export const COMPLETION_COLORS = {
  doneCardBg: PALETTE.grey50, doneCardBorder: PALETTE.completedBorder,
  doneDate: PALETTE.greyDate, doneTitle: PALETTE.grey900,
  statPauseBg: PALETTE.main20, statPauseBorder: PALETTE.main60,
  statPauseValue: PALETTE.main100, statPauseCaption: PALETTE.greyDate,
  statOverBg: PALETTE.main40, statOverBorder: PALETTE.main60,
  statOverValue: PALETTE.main100, statOverCaption: PALETTE.grey575,
} as const;

export const SPACING = {
  screenH: 16, cardGap: 12, cardRadius: 20, cardPaddingH: 22, cardPaddingV: 18,
} as const;
