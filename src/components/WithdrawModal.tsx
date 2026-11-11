import { useEffect, useState } from 'react';
import { Modal, View, Pressable, StyleSheet } from 'react-native';

import AppText from './AppText';
import FormInput from './FormInput';
import { COLORS } from '../constants/token';

type Props = {
    visible: boolean;
    onCancel: () => void;
    /** 입력한 현재 비밀번호와 함께 호출 */
    onConfirm: (currentPassword: string) => void;
    /** 탈퇴 요청 진행 중 */
    isSubmitting?: boolean;
    /** 탈퇴 실패 안내 문구 */
    errorMessage?: string | null;
};

export default function WithdrawModal({
    visible,
    onCancel,
    onConfirm,
    isSubmitting = false,
    errorMessage = null,
}: Props) {
    const [password, setPassword] = useState('');

    // 팝업이 닫히면 입력값 초기화
    useEffect(() => {
        if (!visible) setPassword('');
    }, [visible]);

    const canConfirm = password.length > 0 && !isSubmitting;

    return (
        <Modal
            visible={visible}
            transparent
            animationType="fade"
            onRequestClose={isSubmitting ? undefined : onCancel}
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

                    {/* 본인 확인용 현재 비밀번호 */}
                    <View style={styles.passwordField}>
                        <FormInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="현재 비밀번호"
                            variant="filled"
                            secureTextEntry
                            autoCapitalize="none"
                        />
                    </View>

                    {errorMessage && (
                        <AppText
                            variant="statCaption"
                            color={COLORS.primary}
                            style={styles.errorText}
                        >
                            {errorMessage}
                        </AppText>
                    )}

                    {/* 버튼 */}
                    <View style={styles.buttons}>
                        <Pressable
                            style={styles.cancelButton}
                            onPress={onCancel}
                            disabled={isSubmitting}
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
                            style={[
                                styles.confirmButton,
                                !canConfirm && styles.confirmButtonDisabled,
                            ]}
                            onPress={() => onConfirm(password)}
                            disabled={!canConfirm}
                        >
                            <AppText
                                variant="settingsRowLabel"
                                color={COLORS.white}
                                style={styles.confirmText}
                            >
                                {isSubmitting ? '탈퇴 중...' : '탈퇴할게요'}
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

    passwordField: {
        marginTop: 18,
    },

    errorText: {
        marginTop: 8,
        marginLeft: 4,
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

    confirmButtonDisabled: {
        backgroundColor: COLORS.gray300,
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