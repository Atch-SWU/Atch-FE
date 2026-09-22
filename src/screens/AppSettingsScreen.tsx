import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ToggleSwitch from '../components/ToggleSwitch';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import ChevronRight from '../assets/icon/chevron-right-thin.svg';
import LogoutIcon from '../assets/icon/logout.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'AppSettings'>;

// TODO: 실제 앱 버전 값으로 교체.
const APP_VERSION = 'V.01';

export default function AppSettingsScreen({ navigation }: Props) {
    const [adAlertEnabled, setAdAlertEnabled] = useState(true);
    const [dataConsentEnabled, setDataConsentEnabled] = useState(true);

    const handleLogout = () => {
        // TODO: 실제 로그아웃(토큰 삭제 등) 처리 후 로그인 화면으로 이동.
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                    <ChevronLeft width={20} height={20} color={COLORS.black} />
                </Pressable>
                <AppText variant="settingsHeaderTitle" color={COLORS.black} style={styles.headerTitle}>
                    앱 설정
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <AppText variant="settingsSectionLabel" color={COLORS.black} style={styles.sectionLabel}>
                설정
            </AppText>

            <View style={styles.divider} />

            <Pressable style={styles.row} onPress={() => navigation.navigate('PushSettings')}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    PUSH 설정
                </AppText>
                <ChevronRight width={16} height={16} color={COLORS.black} />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    광고성 정보 알림
                </AppText>
                <ToggleSwitch
                    value={adAlertEnabled}
                    onValueChange={setAdAlertEnabled}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    선호 정보 수집/활용 동의
                </AppText>
                <ToggleSwitch
                    value={dataConsentEnabled}
                    onValueChange={setDataConsentEnabled}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.versionRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    현재 버전 {APP_VERSION}
                </AppText>
            </View>

            <Pressable style={styles.termsRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    이용 약관
                </AppText>
            </Pressable>

            <Pressable style={styles.logoutRow} onPress={handleLogout} hitSlop={10}>
                <LogoutIcon width={16} height={16} color={COLORS.black} />
                <AppText variant="settingsRowLabel" color={COLORS.black} style={styles.logoutLabel}>
                    로그아웃
                </AppText>
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.screenH,
        marginTop: 8,
        marginBottom: 24,
    },
    backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    // "설정" 라벨 — 왼쪽 21
    sectionLabel: {
        paddingLeft: 21,
        paddingRight: SPACING.screenH + 8,
        marginBottom: 10,
    },

    divider: { height: 1, backgroundColor: COLORS.settingsDivider },

    // PUSH 설정 / 토글 두 개 — 왼쪽 33, 위아래 구분선과 16 간격
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 33,
        paddingRight: SPACING.screenH + 8,
        paddingVertical: 16,
    },

    // 현재 버전 — 위 구분선과 16, 아래(이용 약관)와는 30
    versionRow: {
        paddingLeft: 33,
        paddingRight: SPACING.screenH + 8,
        paddingTop: 16,
    },
    // 이용 약관 — 위(현재 버전)와 30 간격
    termsRow: {
        paddingLeft: 33,
        paddingRight: SPACING.screenH + 8,
        marginTop: 30,
    },

    logoutRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 60,
        gap: 6,
    },
    logoutLabel: { marginLeft: 0 },
});
