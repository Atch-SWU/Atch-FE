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
    const { height: screenHeight } = useWindowDimensions();

    const [pageIndex, setPageIndex] = useState(0);

    // 화면 컨테이너 높이와 실제 텍스트 위치
    const [containerHeight, setContainerHeight] = useState(0);
    const [contentAreaY, setContentAreaY] = useState(0);
    const [contentTextY, setContentTextY] = useState(0);
    const [contentTextHeight, setContentTextHeight] = useState(0);

    const isLastPage = pageIndex === TOTAL_PAGES - 1;
    const currentPage = onboardingData[pageIndex];

    // 실제 설명 텍스트의 아래쪽 위치
    const contentBottom =
        contentAreaY + contentTextY + contentTextHeight;

    // 이미지 높이 계산
    const availableImageHeight =
        containerHeight > 0 && contentTextHeight > 0
            ? containerHeight -
            contentBottom -
            IMAGE_TOP_GAP
            : BASE_IMAGE_HEIGHT;

    // 기본 이미지 크기인 523px을 최대한 유지
    const imageHeight = Math.min(
        BASE_IMAGE_HEIGHT,
        Math.max(180, availableImageHeight),
    );

    const imageWidth = imageHeight * IMAGE_RATIO;

    const gradientHeight = Math.min(
        BASE_GRADIENT_HEIGHT,
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
                },
            ]}
            onLayout={(event) => {
                setContainerHeight(event.nativeEvent.layout.height);
            }}
        >
            {/* 상단 캐러셀 도트 */}
            <View style={styles.dots}>
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
            <View style={styles.titleArea}>
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
                {/* 실제 텍스트만 감싸서 크기 측정 */}
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
                        style={styles.contentText}
                    >
                        {currentPage.content}
                    </AppText>
                </View>
            </View>

            {/* 이미지: 하단 고정 */}
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

            {/* 그라데이션: 앱 컨테이너 너비에 맞춤 */}
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
            <View style={styles.buttonArea}>
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
        paddingHorizontal: 23,
        overflow: 'hidden',
    },

    /* 상단 도트 */
    dots: {
        marginTop: 48,
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

    /* 타이틀 */
    titleArea: {
        marginTop: 60,
        alignItems: 'center',
    },

    title: {
        fontWeight: '700',
        textAlign: 'center',
    },

    /* 콘텐츠 영역 */
    contentArea: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
        zIndex: 1,
    },

    contentText: {
        marginTop: 30,
        textAlign: 'center',
    },

    /* 이미지 */
    imageArea: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'flex-end',
        zIndex: 0,
    },

    /* 그라데이션 */
    gradient: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 5,
    },

    /* 하단 버튼 */
    buttonArea: {
        width: '100%',
        marginBottom: 50,
        zIndex: 10,
    },

    button: {
        width: '100%',
        height: 60,
        borderRadius: 12,
        backgroundColor: COLORS.gray800,
    },
});