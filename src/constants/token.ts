import type { TextStyle } from 'react-native';

type Weight = 'Regular' | 'Medium' | 'SemiBold' | 'Bold' | 'ExtraBold';

const t = (weight: Weight, fontSize: number, lineHeight?: number, letterSpacing?: number): TextStyle => ({
  fontFamily: `SUIT-${weight}`,
  fontSize,
  ...(lineHeight !== undefined && { lineHeight }),
  ...(letterSpacing !== undefined && { letterSpacing }),
});

export const TYPOGRAPHY = {
  // ── 공통 (여러 화면에서 쓰는 기본 스타일)
  titleCore: t('SemiBold', 20, 28),
  titleSmall: t('SemiBold', 18, 26),
  bodyTask: t('SemiBold', 16, 24),
  bodySmall: t('Medium', 14, 20, -2),
  primaryBtn: t('Bold', 16, undefined, -0.2),
  subtleBtn: t('SemiBold', 16, 19, -0.24),
  dialogTitle: t('Medium', 16, 24, -0.3),
  sectionHeader: t('Bold', 18, 22, -0.5),
  sectionLabelLg: t('Bold', 15, 22),
  badgeLabel: t('SemiBold', 12, 14),
  statValueBold: t('Bold', 24, 29, -0.36),
  statCaption: t('Medium', 12, 14, -0.18),

  // ── 헤더 / 투두리스트 / 캘린더
  todoDate: t('Bold', 15, 30, -0.3),
  todoScreenTitle: t('ExtraBold', 24, 30, -0.48),
  todoSection: t('Bold', 15, 19, -0.3),
  weekDayLabel: t('Medium', 12, 15, -0.24),
  weekDayNum: t('Medium', 16, 20, -0.32),
  weekDayNumSel: t('SemiBold', 16, 20, -0.32),
  monthTitle: t('SemiBold', 15, 22, -0.3),
  monthWeekday: t('Medium', 15, 22, -0.43),
  monthDay: t('Medium', 17, 22, -0.34),
  monthDaySel: t('Medium', 18, 22, -0.36),
  progressBadge: t('Bold', 12, 15, -0.24),
  progressTitle: t('Bold', 20, 25, -0.4),
  progressMeta: t('Medium', 13, 16, -0.26),
  progressMetaBold: t('SemiBold', 13, 16, -0.26),
  todoParent: t('Medium', 12, 15, -0.24),
  todoItemTitleText: t('Bold', 16, 20, -0.32),
  todoChipText: t('Bold', 12, 15, -0.24),
  todoTime: t('SemiBold', 12, 14),
  wheelSelected: t('Bold', 24, 30),
  wheelIdle: t('Medium', 22, 28),

  // ── 팝업 / 다이얼로그
  popupTitle: t('Bold', 20, 25, -0.4),
  popupBody: t('Medium', 14, 24, -0.28),
  popupBtn: t('Bold', 16, 20, -0.32),
  popupBtnSemi: t('SemiBold', 16, 20),
  popupSub: t('Medium', 15, 19),
  popupRowLabel: t('Medium', 15, 19),
  dialogEyebrow: t('Medium', 12, 15),
  dialogHint: t('Medium', 11, 14),
  dialogHighlight: t('Bold', 18, 22),
  dialogHighlightSub: t('Medium', 12, 15),

  // ── 태스크 추가
  formHeaderTitle: t('Bold', 18, 30),
  formSection: t('Bold', 15, 30, -0.3),
  formInputText: t('SemiBold', 16, 20, -0.16),
  formRowText: t('SemiBold', 15, 19),
  formPillText: t('Bold', 14, 17),
  subtaskLabel: t('Medium', 15, 19, -0.3),
  subtaskChipText: t('Bold', 12, 15),
  totalTitle: t('Bold', 17, 21),
  totalSub: t('Regular', 12, 15),
  durationNum: t('Bold', 18, 22),
  durationUnit: t('SemiBold', 15, 19),
  aiCardTitle: t('Bold', 15, 19),
  aiCardSub: t('Medium', 13, 16),
  aiPredictBtn: t('SemiBold', 13, 16),
  aiResultLabel: t('SemiBold', 15, 19),
  aiResultValue: t('Bold', 18, 22),
  aiResultSub: t('Medium', 12, 15),
  aiResultBtn: t('SemiBold', 14, 17),
  createBtnText: t('SemiBold', 16, 20),
  stepperValue: t('ExtraBold', 40, 48),

  // ── 타이머 / 세션 완료
  timerClock: t('ExtraBold', 60, 75, -0.6),
  timerClockSm: t('ExtraBold', 45, 56, -0.45),
  bubbleText: t('SemiBold', 13, 16, -0.13),
  timerPercent: t('Bold', 13, 16, -0.26),
  timerBtnText: t('SemiBold', 16, 20, -0.32),
  timerStartText: t('Bold', 16, 20, -0.32),
  statLabel: t('Medium', 13, 16, -0.13),
  statValue: t('ExtraBold', 26, 32, -0.26),
  statHint: t('SemiBold', 13, 16, -0.13),
  nextSectionLabel: t('Bold', 15, 19, -0.15),
  nextCardTitle: t('Bold', 20, 25, -0.4),
  infoLabel: t('Medium', 13, 16),

  // ── 홈
  homeCount: t('Bold', 18, 20, -0.36),
  homeCardTitle: t('Bold', 20, 25, -0.4),
  homeCardParent: t('SemiBold', 11, 14, -0.22),
  homeStatValue: t('Bold', 22, 27, -0.44),
  homeStatRateLabel: t('SemiBold', 15, 19, -0.3),
  homeStatBig: t('ExtraBold', 26, 32, -0.52),
  homeEmptyText: t('SemiBold', 15, 19),
  emptyListText: t('Medium', 14, 17),

  // ── 온보딩
  onboardingTitle: t('ExtraBold', 24, 30),
  onboardingContent: t('Medium', 16, 26),

  // ── 로그인 / 회원가입 / 약관
  authLinkText: t('Regular', 14, 17),
  authButtonText: t('Bold', 16, 19),
  authFieldLabel: t('Bold', 16, 19),
  signupFieldLabel: t('Bold', 15, 19),
  signupButtonText: t('SemiBold', 15, 19),
  termsTitle: t('Bold', 21, 25),
  termsItemText: t('Medium', 13, 16),
  termsViewText: t('SemiBold', 11, 13),
  snsLoginText: t('Medium', 14, 17),

  // ── 상점
  shopTitle: t('Bold', 26, 31),
  shopNicknameBold: t('Bold', 26, 31),
  shopNicknameRegular: t('Regular', 26, 31),
  shopCategoryTab: t('Medium', 18, 22),

  // ── 설정
  settingsHeaderTitle: t('SemiBold', 16, 19),
  settingsSectionLabel: t('Bold', 18, 22),
  settingsRowLabel: t('Medium', 16, 19),
  settingsNickname: t('Bold', 16, 19),
  settingsBioText: t('Medium', 14, 17),

  // ── 리포트
  reportTitle: t('Bold', 26, 31, -0.39),
  reportDate: t('Bold', 15, 22),
  reportGoalPercent: t('ExtraBold', 26, 32),
  reportGoalAchieved: t('SemiBold', 13, 17),
  reportStatLabel: t('Medium', 13, 17),
  reportStatValue: t('ExtraBold', 26, 32),
  reportSessionTime: t('ExtraBold', 14, 16),
  reportSessionTitle: t('Bold', 16, 19),
  reportSessionPause: t('Medium', 12, 15),
  reportChartTitle: t('Medium', 13, 17),
  reportChartUnit: t('Medium', 13, 17),
  reportChartTime: t('SemiBold', 10, 13),
  reportChartValue: t('ExtraBold', 10, 13),
  reportSessionDurationValue: t('Bold', 18, 22),
  reportSessionDurationUnit: t('Bold', 18, 22),
};

export type TypographyToken = keyof typeof TYPOGRAPHY;


const PALETTE = {
  white: '#FFFFFF',
  black: '#111111',

  gray100: '#F8F8F8',
  gray200: '#ECECEE',
  gray300: '#DBDBDE',
  gray400: '#B9B7BE',
  gray500: '#82808A',
  gray600: '#615F68',
  gray700: '#46444C',
  gray800: '#242327',

  orange50: '#FFF0E7',
  orange100: '#FFEBE5',
  orange200: '#FFD4C6',
  orange300: '#FFB69E',
  orange400: '#FF8C66',
  orange500: '#FF6C3B',
  orange600: '#FF4E13',

  error: '#FF3755',
  transparent: 'transparent',
} as const;


export const COLORS = {
  ...PALETTE, // COLORS.gray200 처럼 원색도 접근 가능

  // ── 브랜드 (오렌지)
  primary: PALETTE.orange600,       // 메인: 버튼·선택 상태·강조 텍스트
  primaryBright: PALETTE.orange500, // 진행 바 / 설정 토글
  primaryLight: PALETTE.orange300,  // 연한 테두리, 보유 뱃지
  primaryBorder: PALETTE.orange200, // 연한 오렌지 카드 테두리
  primarySoft: PALETTE.orange100,   // 연한 오렌지 배경 (선택된 날짜, 아이콘 배경)
  primaryTint: PALETTE.orange50,    // 가장 연한 오렌지 배경 (칩, 요약 카드)

  // ── 텍스트 (진한 순서)
  textMain: PALETTE.black,          // 제목, 본문 기본
  textStrong: PALETTE.gray800,      // 입력/행 라벨, 숫자
  textBody: PALETTE.gray700,        // 섹션 라벨, 날짜 헤더
  textSub: PALETTE.gray600,         // 보조 설명
  textWeak: PALETTE.gray500,        // 더 약한 보조 / 비활성 라벨
  textPlaceholder: PALETTE.gray400, // 플레이스홀더
  textDisabled: PALETTE.gray300,    // 빈 상태 문구
  textInverse: PALETTE.white,       // 어두운/오렌지 배경 위 글자
  iconWeak: PALETTE.gray400,        // 흐린 아이콘

  // ── 면 / 선
  background: PALETTE.gray100,      // 화면 배경
  surface: PALETTE.white,           // 카드, 팝업, 입력 필드
  fillSoft: PALETTE.gray100,        // 카드 안의 연한 회색 칩/버튼
  fillMuted: PALETTE.gray200,       // 트랙, 비활성 원형 버튼, 진행 카드 배경
  fillDisabled: PALETTE.gray300,    // 비활성 버튼, 토글 off, 핸들
  fillDark: PALETTE.gray800,        // 다크 버튼 (+, 완료, 토글 on, 네비)
  fillBlack: PALETTE.black,         // 팝업 확인 버튼, 재생/체크 원
  border: PALETTE.gray200,          // 카드·입력 테두리, 구분선
  borderStrong: PALETTE.gray300,    // 진한 테두리
  scrim: PALETTE.black,             // 팝업 뒤 어두운 막 (불투명도는 사용처에서 지정)

  // ── 폼 (태스크 추가)
  formPillBg: '#F7F9F9',            // 날짜/시간 필 배경

  // ── 홈
  homeStatBg: 'rgba(255, 255, 255, 0.8)', // 통계 타일

  // ── 상점
  shopCharBg: '#F1F1F1',
  itemLockedBg: 'rgba(106, 106, 106, 0.16)',
  itemBorder: 'rgba(0, 0, 0, 0.2)',

  // ── 설정
  settingsDivider: '#D6D6D6',
  settingsMutedText: '#858585',
  settingsBioBg: '#F7F9F9',
  settingsBioTextColor: '#4E4E4E',
  settingsSectionLabelColor: '#AFAFAF',
  mutedBtnBg: '#AFAFAF',
} as const;


export const SPACING = {
  screenH: 21,     // 화면 좌우 여백
  cardRadius: 20,
} as const;

// 웹 배포 시 데스크톱 브라우저에서도 모바일 폭으로 보이도록 최대 폭 고정
export const MAX_APP_WIDTH = 430;
