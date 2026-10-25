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

// 기준 화면 높이
const BASE_SCREEN_HEIGHT = 874;

// 이미지 가로/세로 비율
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
        height: screenHeight,
        width: screenWidth,
    } = useWindowDimensions();

    const [pageIndex, setPageIndex] = useState(0);

    const isLastPage = pageIndex === TOTAL_PAGES - 1;
    const currentPage = onboardingData[pageIndex];

    const extraHeight = Math.max(
        0,
        screenHeight - BASE_SCREEN_HEIGHT,
    );

    const imageHeight = BASE_IMAGE_HEIGHT + extraHeight;
    const imageWidth = imageHeight * IMAGE_RATIO;

    const gradientHeight =
        BASE_GRADIENT_HEIGHT + extraHeight;

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
        >
            {/* 상단 캐러셀 도트 */}
            <View style={styles.dots}>
                {Array.from({ length: TOTAL_PAGES }).map(
                    (_, index) => (
                        <View
                            key={index}
                            style={[
                                styles.dot,
                                index === pageIndex &&
                                    styles.activeDot,
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

            {/* 콘텐츠 텍스트 */}
            <View style={styles.contentArea}>
                <AppText
                    variant="onboardingContent"
                    color={COLORS.gray500}
                    style={styles.contentText}
                >
                    {currentPage.content}
                </AppText>
            </View>

            {/* 이미지 */}
            <View style={styles.imageArea}>
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
                        width: screenWidth,
                        height: gradientHeight,
                    },
                ]}
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
        backgroundColor: COLORS.white,
        paddingHorizontal: 23,
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

    /* 콘텐츠 텍스트 */
    contentArea: {
        flex: 1,
        alignItems: 'center',
        width: '100%',
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
        zIndex: 0,
    },

    /* 그라데이션 */
    gradient: {
        position: 'absolute',
        left: 0,
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