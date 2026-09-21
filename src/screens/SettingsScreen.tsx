import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ToggleSwitch from '../components/ToggleSwitch';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import ChevronRight from '../assets/icon/chevron-right-thin.svg';
import AvatarPlaceholder from '../assets/icon/avatar-placeholder.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export default function SettingsScreen({ navigation }: Props) {
    const [repeatScheduleEnabled, setRepeatScheduleEnabled] = useState(true);
    const [taskSwapEnabled, setTaskSwapEnabled] = useState(true);

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                    <ChevronLeft width={20} height={20} color={COLORS.black} />
                </Pressable>
                <AppText variant="settingsHeaderTitle" color={COLORS.black} style={styles.headerTitle}>
                    설정
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.profileRow}>
                <View style={styles.avatarCircle}>
                    <AvatarPlaceholder width={40} height={40} />
                </View>
                <View style={styles.profileInfo}>
                    <AppText variant="settingsNickname" color={COLORS.black}>
                        슈니
                    </AppText>
                    <View style={styles.bioBox}>
                        <AppText variant="settingsBioText" color={COLORS.settingsMutedText}>
                            나는야 슈니
                        </AppText>
                    </View>
                </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black} style={styles.rowLabel}>마이페이지 설정</AppText>
            </View>

            <View style={styles.divider} />

            <Pressable style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.settingsMutedText} style={styles.indentedLabel}>
                    프로필 관리
                </AppText>
                <ChevronRight width={16} height={16} color={COLORS.black} />
            </Pressable>

            <View style={styles.divider} />

            <Pressable style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.settingsMutedText} style={styles.indentedLabel}>
                    내 정보 관리
                </AppText>
                <ChevronRight width={16} height={16} color={COLORS.black} />
            </Pressable>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black} style={styles.rowLabel}>반복 되는 일정 추천</AppText>
                <ToggleSwitch
                    value={repeatScheduleEnabled}
                    onValueChange={setRepeatScheduleEnabled}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black} style={styles.rowLabel}>작업 교체 제안</AppText>
                <ToggleSwitch
                    value={taskSwapEnabled}
                    onValueChange={setTaskSwapEnabled}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <Pressable style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black} style={styles.rowLabel}>앱 설정</AppText>
                <ChevronRight width={16} height={16} color={COLORS.black} />
            </Pressable>

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
        marginBottom: 24,
    },
    backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    profileRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: SPACING.screenH + 8,
        marginBottom: 20,
    },
    avatarCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: COLORS.settingsAvatarBg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileInfo: {
        flex: 1,
        marginLeft: 14,
    },
    bioBox: {
        marginTop: 8,
        backgroundColor: COLORS.settingsBioBg,
        borderRadius: 14,
        paddingHorizontal: 16,
        paddingVertical: 12,
    },

    divider: { height: 1, backgroundColor: COLORS.settingsDivider },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.screenH + 8,
        paddingVertical: 18,
    },

    indentedLabel: { marginLeft: 20 },

    rowLabel: { marginLeft: 10 },
});
