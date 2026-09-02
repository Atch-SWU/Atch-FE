import { View, StyleSheet, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import AuthLogo from '../assets/icon/auth-logo.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpComplete'>;

// 아이콘 기준 사이즈(281x274) — 기준 화면 폭(iPhone 14/15, 390) 대비 비율로 반응형 계산.
// 화면이 너무 좁거나 넓어도 과하게 작아지거나 커지지 않도록 방어적으로 clamp.
const REFERENCE_SCREEN_WIDTH = 390;
const BASE_ICON_WIDTH = 281;
const ICON_ASPECT_RATIO = 274 / 281;
const MIN_ICON_WIDTH = 220;
const MAX_ICON_WIDTH = 260;

export default function SignUpCompleteScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useWindowDimensions();

    const iconWidth = Math.min(
        Math.max((windowWidth / REFERENCE_SCREEN_WIDTH) * BASE_ICON_WIDTH, MIN_ICON_WIDTH),
        MAX_ICON_WIDTH,
    );
    const iconHeight = iconWidth * ICON_ASPECT_RATIO;

    const handleStart = () => {
        navigation.replace('Main');
    };

    return (
        <View
            style={[
                styles.container,
                {
                    paddingTop: insets.top + 160,
                    paddingBottom: insets.bottom + 24,
                },
            ]}
        >
            <View style={styles.content}>
                <AppText variant="signupCompleteTitle" color={COLORS.primary} style={styles.completeLabel}>
                    가입 완료
                </AppText>

                <AuthLogo width={iconWidth} height={iconHeight} style={styles.logo} />

                <AppText variant="dialogTitle" color={COLORS.textSub} style={styles.welcomeText}>
                    {'ATCH!에 오신 걸 환영해요\n지금 바로 시작해볼까요?'}
                </AppText>
            </View>

            <AppButton
                label="시작하기"
                variant="primary"
                textVariant="authButtonText"
                onPress={handleStart}
                style={styles.startBtn}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.screenH,
        justifyContent: 'space-between',
    },

    content: {
        alignItems: 'center',
    },

    completeLabel: { textAlign: 'center' },

    logo: { marginTop: 50 },

    welcomeText: {
        marginTop: 40,
        textAlign: 'center',
    },

    startBtn: {
        height: 52,
        borderRadius: 16,
    },
});
