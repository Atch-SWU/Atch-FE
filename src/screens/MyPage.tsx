import { View, StyleSheet, Pressable, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import SettingsIcon from '../assets/icon/settings.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

export default function ShopScreen() {
    const insets = useSafeAreaInsets();

    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.root}>
            {/* 상단 헤더 */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 20,
                    },
                ]}
            >
                {/* 화면 중앙의 마이페이지 제목 */}
                <AppText
                    variant="shopTitle"
                    color={COLORS.black}
                    style={styles.title}
                >
                    마이페이지
                </AppText>

                {/* 오른쪽 설정 아이콘 */}
                <Pressable
                    hitSlop={10}
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <SettingsIcon
                        width={26}
                        height={26}
                    />
                </Pressable>
            </View>

            {/* 마이페이지 이미지 */}
            <Image
                source={require('../assets/icon/auth-logo.png')}
                style={styles.character}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.gray100,
    },

    header: {
        position: 'relative',
        alignItems: 'center',
        paddingHorizontal: 21,
    },

    title: {
        fontFamily: 'SUIT-Bold',
        fontSize: 18,
        lineHeight: 22,
        color: COLORS.black,
    },

    settingsButton: {
        position: 'absolute',
        right: 26,
        bottom: 0,
        width: 26,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },

    character: {
        width: 252,
        height: 210,
        alignSelf: 'center',
        marginTop: 98,
    },
});