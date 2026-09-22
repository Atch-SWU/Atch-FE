import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ToggleSwitch from '../components/ToggleSwitch';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import ChevronRight from '../assets/icon/chevron-right-thin.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'MyInfo'>;

// TODO: 실제 유저 이메일/연동 상태 데이터로 교체.
const USER_EMAIL = 'swu1234@gmail.com';

export default function MyInfoScreen({ navigation }: Props) {
    const [appleLinked, setAppleLinked] = useState(true);
    const [kakaoLinked, setKakaoLinked] = useState(false);
    const [googleLinked, setGoogleLinked] = useState(false);

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                    <ChevronLeft width={20} height={20} color={COLORS.black} />
                </Pressable>
                <AppText variant="settingsHeaderTitle" color={COLORS.black} style={styles.headerTitle}>
                    내 정보 관리
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <AppText
                variant="settingsRowLabel"
                color={COLORS.settingsSectionLabelColor}
                style={[styles.sectionLabel, styles.firstSectionLabel]}
            >
                내 정보
            </AppText>

            <View style={styles.divider} />

            <Pressable style={styles.infoRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    이메일
                </AppText>
                <View style={styles.rowRight}>
                    <AppText variant="settingsBioText" color={COLORS.settingsSectionLabelColor}>
                        {USER_EMAIL}
                    </AppText>
                    <ChevronRight width={16} height={16} color={COLORS.black} />
                </View>
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.infoRow} onPress={() => navigation.navigate('ChangePassword')}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    비밀번호
                </AppText>
                <ChevronRight width={16} height={16} color={COLORS.black} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.infoRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    회원 탈퇴
                </AppText>
                <ChevronRight width={16} height={16} color={COLORS.black} />
            </Pressable>

            <View style={styles.divider} />

            <AppText
                variant="settingsRowLabel"
                color={COLORS.settingsSectionLabelColor}
                style={[styles.sectionLabel, styles.secondSectionLabel]}
            >
                SNS 계정 연동
            </AppText>

            <View style={styles.divider} />

            <View style={styles.linkRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    Apple 연동
                </AppText>
                <ToggleSwitch
                    value={appleLinked}
                    onValueChange={setAppleLinked}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.linkRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    카카오 연동
                </AppText>
                <ToggleSwitch
                    value={kakaoLinked}
                    onValueChange={setKakaoLinked}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.linkRow}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    Google 연동
                </AppText>
                <ToggleSwitch
                    value={googleLinked}
                    onValueChange={setGoogleLinked}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />
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
        marginBottom: 0,
    },
    backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    sectionLabel: {
        // "내 정보"/"SNS 계정 연동" — 왼쪽 간격 21
        paddingLeft: 21,
        paddingRight: SPACING.screenH + 8,
        marginBottom: 10,
    },
    // "내 정보" — 헤더와의 간격 60
    firstSectionLabel: { marginTop: 60 },
    // "SNS 계정 연동" — 바로 위 구분선과의 간격 29
    secondSectionLabel: { marginTop: 29 },

    divider: { height: 1, backgroundColor: COLORS.settingsDivider },

    // 이메일/비밀번호/회원 탈퇴 — 위아래 구분선과 16 간격(paddingVertical로 위/아래 동일 적용)
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        // 이메일/비밀번호/회원 탈퇴 — 왼쪽 간격 33(섹션 라벨보다 더 들어가 보이도록)
        paddingLeft: 33,
        paddingRight: SPACING.screenH + 8,
        paddingVertical: 16,
    },
    // Apple/카카오/Google 연동 — 위아래 구분선과 19 간격
    linkRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 33,
        paddingRight: SPACING.screenH + 8,
        paddingVertical: 19,
    },
    rowRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
});
