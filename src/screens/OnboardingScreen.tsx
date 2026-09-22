import { useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppDimensions from '../hooks/useAppDimensions';
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

// 민트 박스가 illustrationWrap(남은 세로 공간) 중 실제로 채우는 비율.
// 1.0이면 박스가 남은 공간을 거의 꽉 채워 화면에 비해 너무 커 보이고,
// 너무 작으면(0.6대) 이미지가 왜소해 보이므로 그 사이에서 목업 크기에 맞춤.
const WRAP_FILL_RATIO = 0.85;

// 4번째(마지막) 페이지 캐릭터 아이콘 크기 — 카드가 없어서 다른 페이지와 같은 폭 계산식을
// 쓰면 너무 작게 나와서 별도로 지정. 화면이 너무 좁을 때만 방어적으로 줄어듦.
const LAST_PAGE_ICON_WIDTH = 305;
const LAST_PAGE_ICON_HEIGHT = 300;

// 이전/다음 버튼 공통 스펙 — 색상만 variant 로 다르고 폰트·사이즈·radius 는 동일.
const ONBOARDING_BUTTON_TEXT_VARIANT: TypographyToken = 'titleSmall';

export default function OnboardingScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { width: windowWidth, height: windowHeight } = useAppDimensions();
    const [pageIndex, setPageIndex] = useState(0);
    // 민트 박스가 실제로 차지할 수 있는 세로 공간 — onLayout으로 측정.
    // (웹 데스크톱처럼 화면이 가로로 넓고 세로는 짧은 경우, 세로로 긴 스크린샷 이미지가
    //  이 공간보다 커져서 박스 밖(버튼 줄 쪽)으로 넘치는 버그가 있었음 — 그래서 세로 공간도 같이 체크.)
    const [wrapHeight, setWrapHeight] = useState(0);

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

    // 이미지마다 실제 원본 비율이 조금씩 달라서(스크린샷 크롭 차이 등) 하나의 고정값을
    // 쓰면 카드가 과하게 커지거나(민트 박스가 남는 세로 공간을 거의 다 채움) 페이지마다
    // 여백 느낌이 달라지는 문제가 있었음 — 번들된 이미지의 실제 width/height를 그대로 사용.
    const assetSource = Image.resolveAssetSource(page.image);
    const imageAspectRatio =
        assetSource && assetSource.height > 0 ? assetSource.width / assetSource.height : 1;

const cardImageHeightByWidth = cardImageWidth / imageAspectRatio;
// wrapHeight를 아직 못 쟀으면(최초 렌더) 폭 기준 값을 그대로 사용.
// 박스가 남은 세로 공간을 거의 다 채우면 화면에 비해 너무 커 보이므로,
// 실제로는 그 공간의 일부(WRAP_FILL_RATIO)만 채우도록 제한 — 위아래로 자연스러운 여백이 남음.
const maxImageHeightByWrap =
    wrapHeight > 0 ? wrapHeight * WRAP_FILL_RATIO - IMAGE_MARGIN * 2 : cardImageHeightByWidth;
const cardImageHeight = Math.min(cardImageHeightByWidth, maxImageHeightByWrap);
// 세로 공간이 부족해서 높이가 깎였다면, 비율 유지를 위해 폭도 그만큼 같이 줄임.
const cardImageWidthFinal = cardImageHeight * imageAspectRatio;

    // 카드가 없는 마지막 페이지는 카드 폭 계산식을 안 쓰고 고정 크기(305x300)를 쓰되,
    // 화면이 그보다 좁을 때만 방어적으로 줄어들게 함.
    const availableWidth = windowWidth - SPACING.screenH * 2;
    const lastPageIconWidth = Math.min(LAST_PAGE_ICON_WIDTH, availableWidth);
    const lastPageIconHeight =
        lastPageIconWidth * (LAST_PAGE_ICON_HEIGHT / LAST_PAGE_ICON_WIDTH);

    const imageWidth = showCardBackdrop ? cardImageWidthFinal : lastPageIconWidth;
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

            <View
                style={[
                    styles.illustrationWrap,
                    {
                        marginTop: textToImageGap,
                        // 카드가 있는 페이지(1~3)만 세로 중앙 정렬로 위아래 여백을 주고,
                        // 카드가 없는 마지막 캐릭터 페이지는 원래대로 상단 정렬 유지
                        // (가운데 정렬로 바꿨더니 캐릭터 이미지 위치가 이상해 보이는 문제가 있었음).
                        justifyContent: showCardBackdrop ? 'center' : 'flex-start',
                    },
                ]}
                onLayout={(e) => setWrapHeight(e.nativeEvent.layout.height)}
            >
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
    },

    illustrationBackdrop: {
        backgroundColor: COLORS.main20,
        borderTopLeftRadius: 32,
        borderTopRightRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
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
