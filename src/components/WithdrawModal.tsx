import { Modal, View, Pressable, StyleSheet } from 'react-native';

import AppText from './AppText';
import { COLORS } from '../constants/token';

type Props = {
    visible: boolean;
    onCancel: () => void;
    onConfirm: () => void;
};

export default function WithdrawModal({
    visible,
    onCancel,
    onConfirm,
}: Props) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={styles.overlay}>
                <View style={styles.modal}>
                    {/* 제목 */}
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.title}
                    >
                        정말 탈퇴 하시겠습니까?
                    </AppText>

                    {/* 설명 */}
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.gray500}
                        style={styles.description}
                    >
                        탈퇴 시 데이터는 영구 삭제됩니다.
                    </AppText>

                    {/* 버튼 */}
                    <View style={styles.buttons}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onCancel}
                        >
                            <AppText
                                variant="settingsRowLabel"
                                color={COLORS.gray500}
                                style={styles.cancelText}
                            >
                                아니오
                            </AppText>
                        </Pressable>

                        <Pressable
                            style={styles.confirmButton}
                            onPress={onConfirm}
                        >
                            <AppText
                                variant="settingsRowLabel"
                                color={COLORS.white}
                                style={styles.confirmText}
                            >
                                탈퇴할게요
                            </AppText>
                        </Pressable>
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 21,
    },

    modal: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderRadius: 18,
        paddingHorizontal: 30,
        paddingVertical: 30,
    },

    title: {
        fontFamily: 'SUIT-Bold',
        fontSize: 20,
        lineHeight: 26,
        color: COLORS.black,
        textAlign: 'center',
    },

    description: {
        marginTop: 8,
        fontFamily: 'SUIT-Regular',
        fontSize: 15,
        lineHeight: 20,
        color: COLORS.gray500,
        textAlign: 'center',
    },

    buttons: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 22,
    },

    cancelButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: COLORS.gray100,
        alignItems: 'center',
        justifyContent: 'center',
    },

    confirmButton: {
        flex: 1,
        height: 48,
        borderRadius: 10,
        backgroundColor: COLORS.black,
        alignItems: 'center',
        justifyContent: 'center',
    },

    cancelText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        lineHeight: 22,
        color: COLORS.gray500,
    },

    confirmText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        lineHeight: 22,
        color: COLORS.white,
    },
});