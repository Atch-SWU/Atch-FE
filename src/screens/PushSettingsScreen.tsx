import { useState } from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import ToggleSwitch from '../components/ToggleSwitch';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'PushSettings'>;

export default function PushSettingsScreen({ navigation }: Props) {
    const [pushReceiveEnabled, setPushReceiveEnabled] = useState(true);
    const [nightAlertEnabled, setNightAlertEnabled] = useState(false);

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                    <ChevronLeft width={20} height={20} color={COLORS.black} />
                </Pressable>
                <AppText variant="settingsHeaderTitle" color={COLORS.black} style={styles.headerTitle}>
                    PUSH 설정
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.topGap} />

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    앱 푸시 수신
                </AppText>
                <ToggleSwitch
                    value={pushReceiveEnabled}
                    onValueChange={setPushReceiveEnabled}
                    activeColor={COLORS.settingsToggleActive}
                />
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
                <AppText variant="settingsRowLabel" color={COLORS.black}>
                    야간 알림 허용
                </AppText>
                <ToggleSwitch
                    value={nightAlertEnabled}
                    onValueChange={setNightAlertEnabled}
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
        marginBottom: 24,
    },
    backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    topGap: { height: 24 },

    divider: { height: 1, backgroundColor: COLORS.settingsDivider },

    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingLeft: 33,
        paddingRight: SPACING.screenH + 8,
        paddingVertical: 21,
    },
});
