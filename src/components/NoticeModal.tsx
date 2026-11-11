import { View, Pressable, Modal, StyleSheet } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface NoticeModalProps {
    visible: boolean;
    message: string;
    onClose: () => void;
    confirmLabel?: string;
}

/** 확인 버튼 하나만 있는 안내 팝업 (웹에서도 보이도록 Alert 대신 Modal 사용) */
export default function NoticeModal({
    visible,
    message,
    onClose,
    confirmLabel = '확인',
}: NoticeModalProps) {
    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            statusBarTranslucent
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <View style={styles.container}>
                    <AppText
                        variant="settingsRowLabel"
                        color={COLORS.black}
                        style={styles.message}
                    >
                        {message}
                    </AppText>

                    <Pressable style={styles.confirmButton} onPress={onClose}>
                        <AppText
                            variant="settingsRowLabel"
                            color={COLORS.gray500}
                            style={styles.confirmText}
                        >
                            {confirmLabel}
                        </AppText>
                    </Pressable>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.30)',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 21,
    },

    container: {
        width: '100%',
        maxWidth: 460,
        padding: 30,
        borderRadius: 20,
        backgroundColor: COLORS.white,
        alignItems: 'center',
    },

    message: {
        fontFamily: 'SUIT-Bold',
        fontSize: 20,
        lineHeight: 24,
        color: COLORS.black,
        textAlign: 'center',
    },

    confirmButton: {
        width: '100%',
        height: 51,
        marginTop: 22,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 12,
        backgroundColor: COLORS.gray100,
    },

    confirmText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        lineHeight: 20,
        textAlign: 'center',
    },
});
