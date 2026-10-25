import { View, Image, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppDimensions from '../hooks/useAppDimensions';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import AppButton from '../components/AppButton';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'SignUpComplete'>;


const REFERENCE_SCREEN_WIDTH = 390;
const BASE_ICON_WIDTH = 281;
const ICON_ASPECT_RATIO = 274 / 281;
const MIN_ICON_WIDTH = 220;
const MAX_ICON_WIDTH = 260;

export default function SignUpCompleteScreen({ navigation }: Props) {
    const insets = useSafeAreaInsets();
    const { width: windowWidth } = useAppDimensions();

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

                <Image
                    source={require('../assets/icon/auth-logo.png')}
                    style={[styles.logo, { width: iconWidth, height: iconHeight }]}
                    resizeMode="contain"
                />

                <AppText variant="dialogTitle" color={COLORS.gray800} style={styles.welcomeText}>
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
        backgroundColor: COLORS.gray100,
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
        height: 60,
        borderRadius: 16,
    },
});
