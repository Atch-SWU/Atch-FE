import { useState } from 'react';
import { View, Image, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import OnboardingDots from '../components/OnboardingDots';
import { COLORS, SPACING, TypographyToken } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

interface OnboardingPageData {
    title: string;
    subtitle: string;
    image: number; // require() 결과 타입
    // 이미지 뒤에 민트 카드를 깔지 여부 — 기본 true. 4번째(캐릭터) 페이지만 카드 없이 이미지만 노출.
    showCardBackdrop?: boolean;
}

// 전체 온보딩 4페이지 — 1~3번째는 카드+스크린샷, 4번째(마지막)는 캐릭터 이미지만 노출.
const ONBOARDING_PAGES: OnboardingPageData[] = [
    {
        title: '더 쉽고 직관적으로,',
        subtitle: '한눈에 보이는 투두리스트로\n해야 할 일을 빠르게 파악해 보세요.',
        image: require('../assets/onboarding/onboarding-1.png'),
    },
    {
        title: '매일 꼼꼼하게,',
        subtitle: '매일 일정과 할 일을\n놓치지 않도록 도와드려요.',
        image: require('../assets/onboarding/onboarding-2.png'),
    },
    {
        title: '더 똑똑하게,',
        subtitle: 'AI 집중 패턴 리포트로\n나만의 집중 습관을 분석해 보세요.',
        image: require('../assets/onboarding/onboarding-3.png'),
    },
    {
        title: '꾸준한 습관으로',
        subtitle: '새로운 보상을 받고\n멧치를 나만의 스타일로 꾸며보세요.',
        image: require('../assets/onboarding/onboarding-4.png'),
        showCardBackdrop: false,
    },
];

// 상단 도트는 전체 페이지 수에 맞춰 고정.
const TOTAL_PAGES = 4;

// 서브텍스트(회색 텍스트)와 이미지/민트 박스 사이 간격(40)의 기준값 — 디자인 시안 기준
// 화면 높이(iPhone 14/15 기준 844)에서 40이 되도록 잡고, 실제 기기 세로 길이에 비례해서
// 늘어나거나 줄어들게 계산. 20~40 사이로 clamp(40을 넘지 않도록).
const REFERENCE_SCREEN_HEIGHT = 844;
const BASE_TEXT_TO_IMAGE_GAP = 40;
const MIN_TEXT_TO_IMAGE_GAP = 20;
const MAX_TEXT_TO_IMAGE_GAP = 40;

// 민트 카드 좌우 여백 — 화면 "실제" 가장자리 기준(화면 폭에 따라 카드 폭 자체는 반응형으로 변함).
const CARD_MARGIN_H = 72;
// 카드 안에서 이미지의 상하좌우 여백 — 카드 가장자리 기준. 디바이스 크기가 달라져도
// 이 여백만은 항상 고정으로 유지되고, 카드·이미지 자체의 크기가 화면 폭에 맞춰 늘어나거나 줄어듦.
const IMAGE_MARGIN = 22;

// 4번째(마지막) 페이지 캐릭터 아이콘 크기 — 카드가 없어서 다른 페이지와 같은 폭 계산식을
// 쓰면 너무 작게 나와서 별도로 지정. 화면이 너무 좁을 때만 방어적으로 줄어듦.
const LAST_PAGE_ICON_WIDTH = 305;
const LAST_PAGE_ICON_HEIGHT = 300;

// 이전/다음 버튼 공통 스펙 — 색상만 variant 로 다르고 폰트·사이즈·radius 는 동일.
const ONBOARDING_BUTTON_TEXT_VARIANT: TypographyToken = 'titleSmall';

export default function OnboardingScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    const [pageIndex, setPageIndex] = useState(0);

    const textToImageGap = Math.min(
        Math.max(
            (windowHeight / REFERENCE_SCREEN_HEIGHT) * BASE_TEXT_TO_IMAGE_GAP,
            MIN_TEXT_TO_IMAGE_GAP,
        ),
        MAX_TEXT_TO_IMAGE_GAP,
    );

    const page = ONBOARDING_PAGES[pageIndex];
    const isFirstPage = pageIndex === 0;
    const isLastPage = pageIndex === ONBOARDING_PAGES.length - 1;
    const showCardBackdrop = page.showCardBackdrop ?? true;

    // 카드/이미지 크기는 전부 실제 픽셀값으로 직접 계산.
    // (% 값을 flex:1 컨테이너 안에서 쓰면 레이아웃이 확정되기 전에 잘못 계산되는 문제가 있어서
    // 카드·이미지가 화면 밖으로 넘치는 버그가 있었음 — 그래서 아래처럼 명시적으로 계산.)
    // 카드는 이미지를 감싸는 실제 래퍼(padding)로 바뀌어서, 카드 높이는 이미지 높이를
    // 그대로 따라가고(항상 전체를 감쌈) 가로 중앙 정렬도 alignItems 로 자동 처리됨.
    const cardWidth = windowWidth - CARD_MARGIN_H * 2;
    const cardImageWidth = cardWidth - IMAGE_MARGIN * 2;

    const assetSize = Image.resolveAssetSource(page.image);
    const cardImageHeight =
        assetSize.width > 0
            ? (cardImageWidth / assetSize.width) * assetSize.height
            : cardImageWidth;

    // 카드가 없는 마지막 페이지는 카드 폭 계산식을 안 쓰고 고정 크기(305x300)를 쓰되,
    // 화면이 그보다 좁을 때만 방어적으로 줄어들게 함.
    const availableWidth = windowWidth - SPACING.screenH * 2;
    const lastPageIconWidth = Math.min(LAST_PAGE_ICON_WIDTH, availableWidth);
    const lastPageIconHeight =
        lastPageIconWidth * (LAST_PAGE_ICON_HEIGHT / LAST_PAGE_ICON_WIDTH);

    const imageWidth = showCardBackdrop ? cardImageWidth : lastPageIconWidth;
    const imageHeight = showCardBackdrop ? cardImageHeight : lastPageIconHeight;

    const goPrevious = () => {
        if (isFirstPage) return;

        setPageIndex((prev) => prev - 1);
    };

    const goNext = () => {
        if (isLastPage) {
            navigation.replace('Login');
            return;
        }

        setPageIndex((prev) => prev + 1);
    };

    const imageElement = (
        <Image
            source={page.image}
            style={{ width: imageWidth, height: imageHeight }}
            resizeMode="contain"
        />
    );

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 24,
                    paddingBottom: insets.bottom + 24,
                },
            ]}
        >

            <OnboardingDots total={TOTAL_PAGES} activeIndex={pageIndex} />

            <View style={styles.textArea}>
                <AppText
                    variant="onboardingTitle"
                    color={COLORS.grey900}
                    style={styles.title}
                >
                    {page.title}
                </AppText>

                <AppText
                    variant="onboardingSubtitle"
                    color={COLORS.textSub}
                    style={styles.subtitle}
                >
                    {page.subtitle}
                </AppText>
            </View>

            <View style={[styles.illustrationWrap, { marginTop: textToImageGap }]}>
                {showCardBackdrop ? (
                    <View
                        style={[
                            styles.illustrationBackdrop,
                            {
                                width: cardWidth,
                                padding: IMAGE_MARGIN,
                            },
                        ]}
                    >
                        {imageElement}
                    </View>
                ) : (
                    imageElement
                )}
            </View>

            <View style={styles.buttonRow}>
                {!isFirstPage && !isLastPage && (
                    <AppButton
                        label="이전"
                        variant="soft"
                        textVariant={ONBOARDING_BUTTON_TEXT_VARIANT}
                        onPress={goPrevious}
                        style={styles.buttonFlex}
                    />
                )}

                <AppButton
                    label={isLastPage ? '시작하기' : '다음'}
                    variant="primary"
                    textVariant={ONBOARDING_BUTTON_TEXT_VARIANT}
                    onPress={goNext}
                    style={styles.buttonFlex}
                />
            </View>

        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.screenH,
    },

    textArea: {
        marginTop: 62,
        alignItems: 'center',
    },

    title: {
        textAlign: 'center',
    },

    subtitle: {
        marginTop: 14,
        textAlign: 'center',
    },

    illustrationWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },

    illustrationBackdrop: {
        backgroundColor: COLORS.main20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
    },

    buttonRow: {
        flexDirection: 'row',
        gap: 12,
    },

    buttonFlex: {
        flex: 1,
        borderRadius: 16,
    },
});
