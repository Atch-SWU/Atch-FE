import { useState } from 'react';
import { View, Image, Pressable, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import FormInput from '../components/FormInput';
import ChevronLeft from '../assets/icon/chevron-left.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

type Props = NativeStackScreenProps<RootStackParamList, 'ProfileManage'>;

export default function ProfileManageScreen({ navigation }: Props) {
    const [avatarUri, setAvatarUri] = useState<string | null>(null);
    const [nickname, setNickname] = useState('슈니');
    const [bio, setBio] = useState('');

    const handleChangeAvatar = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('권한 필요', '프로필 사진을 변경하려면 갤러리 접근 권한이 필요해요.');
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled && result.assets.length > 0) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView style={styles.root} edges={['top', 'bottom']}>
            <View style={styles.header}>
                <Pressable style={styles.backBtn} onPress={() => navigation.goBack()} hitSlop={10}>
                    <ChevronLeft width={20} height={20} color={COLORS.black} />
                </Pressable>
                <AppText variant="settingsHeaderTitle" color={COLORS.black} style={styles.headerTitle}>
                    프로필 관리
                </AppText>
                <View style={styles.headerSpacer} />
            </View>

            <View style={styles.avatarSection}>
                <Pressable onPress={handleChangeAvatar} hitSlop={10}>
                    <View style={styles.avatarCircle}>
                        <Image
                            source={avatarUri ? { uri: avatarUri } : require('../assets/onboarding/onboarding-4.png')}
                            style={avatarUri ? styles.avatarImageFull : styles.avatarImage}
                            resizeMode={avatarUri ? 'cover' : 'contain'}
                        />
                    </View>
                </Pressable>
            </View>

            <View style={styles.fieldSection}>
                <AppText variant="authFieldLabel" color={COLORS.black}>
                    닉네임
                </AppText>
                <FormInput
                    value={nickname}
                    onChangeText={setNickname}
                    placeholder="닉네임"
                    variant="filled"
                    placeholderColor={COLORS.grey500}
                    boxStyle={styles.fieldBox}
                />

                <AppText variant="authFieldLabel" color={COLORS.black} style={styles.bioLabel}>
                    자기소개
                </AppText>
                <FormInput
                    value={bio}
                    onChangeText={setBio}
                    placeholder="자신을 소개할 수 있는 멘트를 작성해주세요"
                    variant="filled"
                    placeholderColor={COLORS.grey500}
                    multiline
                    boxStyle={[styles.fieldBox, styles.bioBox]}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: SPACING.screenH,
    },

    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginTop: 8,
        marginBottom: 24,
    },
    backBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
    headerTitle: { flex: 1, textAlign: 'center' },
    headerSpacer: { width: 30 },

    avatarSection: {
        alignItems: 'center',
        // 아바타와 바로 아래 가로선 사이 간격 30
        marginBottom: 30,
    },
    avatarCircle: {
        width: 114,
        height: 114,
        borderRadius: 57,
        backgroundColor: COLORS.settingsAvatarBg,
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    avatarImage: {
        width: 80,
        height: 80,
    },
    avatarImageFull: {
        width: '100%',
        height: '100%',
    },

    fieldSection: {
        marginTop: 28,
    },
    fieldBox: {
        marginTop: 8,
    },
    bioLabel: {
        marginTop: 28,
    },
    bioBox: {
        height: 90,
        justifyContent: 'flex-start',
        paddingTop: 14,
    },
});
