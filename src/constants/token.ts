export const TYPOGRAPHY = {
  mainTitle: {
    fontFamily: 'Pretendard-Bold',
    fontSize: 28,
    lineHeight: 40,
  },
  titleImportantTop: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 26,
    lineHeight: 36,
    letterSpacing: -1.5,
  },
  titleCore: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 20,
    lineHeight: 28,
  },
  titleSmall: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 18,
    lineHeight: 26,
  },
  bodyImportant: {
    fontFamily: 'Pretendard-Regular',
    fontSize: 18,
    lineHeight: 26,
  },
  bodyTask: {
    fontFamily: 'Pretendard-SemiBold',
    fontSize: 16,
    lineHeight: 24,
  },
  bodySmall: {
    fontFamily: 'Pretendard-Medium',
    fontSize: 14,
    lineHeight: 20,
    letterSpacing: -2,
  },
};

const PALETTE = {
  main100: '#2FCCDC',
  main80: '#68DCE8',
  main60: '#8EEAF3',
  main40: '#B3EBF3',
  main20: '#DEF6FB',
  white: '#FFFFFF',
  grey100: '#F7F9F9',
  grey200: '#ECEEEE',
  grey300: '#DBDCDC',
  grey400: '#B4B7B7',
  grey500: '#919494',
  grey600: '#6B6C6C',
  grey700: '#4F5151',
  grey800: '#303030',
  grey900: '#131414',
};


export const COLORS = {
  ...PALETTE,
  primary: PALETTE.main100,
  background: PALETTE.white,
  surface: PALETTE.grey100,
  textMain: PALETTE.grey900,
  textSub: PALETTE.grey600,
  border: PALETTE.grey300,
};