import { useState } from 'react';
import {
    View,
    StyleSheet,
    Image,
    useWindowDimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

const TOTAL_PAGES = 4;

// 피그마 기준 디바이스
const BASE_WIDTH = 402;
const BASE_HEIGHT = 874;

// 기존 디자인 크기
const BASE_IMAGE_WIDTH = 240.56;
const BASE_IMAGE_HEIGHT = 523;

const BASE_GRADIENT_HEIGHT = 403;
const IMAGE_TOP_GAP = 76;

const IMAGE_RATIO = BASE_IMAGE_WIDTH / BASE_IMAGE_HEIGHT;

const onboardingData = [
    {
        title: '더 쉽고 직관적으로,',
        content:
            '한눈에 보이는 투두리스트로\n해야 할 일을 빠르게 파악해 보세요',
        image: require('../assets/onboarding/onboarding1.png'),
    },
    {
        title: '매일 꼼꼼하게,',
        content:
            '매일 일정과 할 일을\n놓치지 않도록 도와드려요',
        image: require('../assets/onboarding/onboarding2.png'),
    },
    {
        title: '더 똑똑하게,',
        content:
            'AI 집중 패턴 리포트로\n나만의 집중 습관을 분석해 보세요',
        image: require('../assets/onboarding/onboarding3.png'),
    },
    {
        title: '꾸준한 습관으로,',
        content:
            '새로운 보상을 받고\n멧치를 나만의 스타일로 꾸며보세요',
        image: require('../assets/onboarding/onboarding3.png'),
    },
];

export default function OnboardingScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();

    const {
        width: screenWidth,
        height: screenHeight,
    } = useWindowDimensions();

    const [pageIndex, setPageIndex] = useState(0);

    const [containerHeight, setContainerHeight] = useState(0);
    const [contentAreaY, setContentAreaY] = useState(0);
    const [contentTextY, setContentTextY] = useState(0);
    const [contentTextHeight, setContentTextHeight] = useState(0);

    // 가로 / 세로 화면 비율
    const widthRatio = screenWidth / BASE_WIDTH;
    const heightRatio = screenHeight / BASE_HEIGHT;

    // 세로 간격은 화면 높이에 맞춰 조정
    // 지나친 확대 및 축소 방지
    const verticalScale = Math.min(
        1.12,
        Math.max(0.85, heightRatio),
    );

    // 좌우 패딩은 화면 너비에 맞춰 조정
    const horizontalPadding = Math.min(
        28,
        Math.max(16, 23 * widthRatio),
    );

    const isLastPage = pageIndex === TOTAL_PAGES - 1;
    const currentPage = onboardingData[pageIndex];

    // 이미지 기본 크기: 화면 너비에 따라 조정
    const desiredImageWidth = BASE_IMAGE_WIDTH * widthRatio;
    const desiredImageHeight = desiredImageWidth / IMAGE_RATIO;

    // 설명 텍스트의 실제 아래쪽 위치
    const contentBottom =
        contentAreaY + contentTextY + contentTextHeight;

    // 이미지가 들어갈 수 있는 공간 계산
    const availableImageHeight =
        containerHeight > 0 && contentTextHeight > 0
            ? Math.max(
                  0,
                  containerHeight -
                      contentBottom -
                      IMAGE_TOP_GAP * verticalScale,
              )
            : desiredImageHeight;

    // 이미지 크기: 가로세로 비율 유지
    const imageHeight = Math.min(
        desiredImageHeight,
        availableImageHeight,
    );

    const imageWidth = imageHeight * IMAGE_RATIO;

    // 그라데이션도 이미지 크기에 맞춰 조정
    const gradientHeight = Math.min(
        BASE_GRADIENT_HEIGHT * (imageHeight / BASE_IMAGE_HEIGHT),
        imageHeight,
    );

    const goNext = () => {
        if (isLastPage) {
            navigation.replace('Login');
            return;
        }

        setPageIndex((prev) => prev + 1);
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top,
                    paddingBottom: insets.bottom,
                    paddingHorizontal: horizontalPadding,
                },
            ]}
            onLayout={(event) => {
                setContainerHeight(event.nativeEvent.layout.height);
            }}
        >
            {/* 상단 캐러셀 도트 */}
            <View
                style={[
                    styles.dots,
                    {
                        marginTop: 48 * verticalScale,
                    },
                ]}
            >
                {Array.from({ length: TOTAL_PAGES }).map(
                    (_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === pageIndex && styles.activeDot,
                            ]}
                        />
                    ),
                )}
            </View>

            {/* 타이틀 */}
            <View
                style={[
                    styles.titleArea,
                    {
                        marginTop: 60 * verticalScale,
                    },
                ]}
            >
                <AppText
                    variant="onboardingTitle"
                    color={COLORS.black}
                    style={styles.title}
                >
                    {currentPage.title}
                </AppText>
            </View>

            {/* 콘텐츠 영역 */}
            <View
                style={styles.contentArea}
                onLayout={(event) => {
                    setContentAreaY(event.nativeEvent.layout.y);
                }}
            >
                <View
                    onLayout={(event) => {
                        const { y, height } = event.nativeEvent.layout;
                        setContentTextY(y);
                        setContentTextHeight(height);
                    }}
                >
                    <AppText
                        variant="onboardingContent"
                        color={COLORS.gray500}
                        style={[
                            styles.contentText,
                            {
                                marginTop: 30 * verticalScale,
                            },
                        ]}
                    >
                        {currentPage.content}
                    </AppText>
                </View>
            </View>

            {/* 이미지 */}
            <View
                pointerEvents="none"
                style={[
                    styles.imageArea,
                    {
                        height: imageHeight,
                    },
                ]}
            >
                <Image
                    source={currentPage.image}
                    style={{
                        width: imageWidth,
                        height: imageHeight,
                    }}
                    resizeMode="contain"
                />
            </View>

            {/* 그라데이션 */}
            <LinearGradient
                colors={[
                    'rgba(255,255,255,0)',
                    '#FFFFFF',
                    '#FFFFFF',
                ]}
                locations={[0.2, 0.53, 1]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 1 }}
                style={[
                    styles.gradient,
                    {
                        height: gradientHeight,
                    },
                ]}
                pointerEvents="none"
            />

            {/* 하단 버튼 */}
            <View
                style={[
                    styles.buttonArea,
                    {
                        marginBottom: 50 * verticalScale,
                    },
                ]}
            >
                <AppButton
                    label={isLastPage ? 'Atch 시작하기' : '다음'}
                    variant="primary"
                    onPress={goNext}
                    style={styles.button}
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: COLORS.white,
        overflow: 'hidden',
    },

    dots: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 7,
    },

    dot: {
        width: 7,
        height: 7,
        borderRadius: 4,
        backgroundColor: COLORS.gray200,
    },

    activeDot: {
        backgroundColor: COLORS.orange600,
    },

    titleArea: {
        alignItems: 'center',
    },

    title: {
        fontWeight: '700',
        textAlign: 'center',
    },

    contentArea: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        zIndex: 1,
    },

    contentText: {
        textAlign: 'center',
    },

    imageArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 0,
    },

    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
    },

    buttonArea: {
        width: '100%',
        zIndex: 10,
    },

    button: {
        width: '100%',
        height: 60,
        borderRadius: 12,
        backgroundColor: COLORS.gray800,
    },
});
