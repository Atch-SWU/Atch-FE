import { useLayoutEffect, useRef, useState } from 'react';
import { Modal, View, Pressable, StyleSheet, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import AppText from './AppText';
import AppButton from './AppButton';
import CheckIcon from '../assets/icon/check.svg';
import { COLORS } from '../constants/token';

interface TermsAgreementSheetProps {
    visible: boolean;
    onClose: () => void;
    onAgree: () => void;
}

interface TermsItem {
    key: string;
    label: string;
}

const TERMS_ITEMS: TermsItem[] = [
    { key: 'age', label: '[필수] 만 14세 이상입니다' },
    { key: 'terms', label: '[필수] 서비스 이용약관 동의' },
    { key: 'privacy', label: '[필수] 개인정보 수집 및 이용' },
];

const SHEET_OFFSET = 500;

export default function TermsAgreementSheet({ visible, onClose, onAgree }: TermsAgreementSheetProps) {
    const insets = useSafeAreaInsets();
    const [checked, setChecked] = useState<Record<string, boolean>>({
        age: false,
        terms: false,
        privacy: false,
    });

    const sheetTranslateY = useRef(new Animated.Value(SHEET_OFFSET)).current;

    useLayoutEffect(() => {
        sheetTranslateY.setValue(SHEET_OFFSET);
        Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 280,
            useNativeDriver: true,
        }).start();
    }, [sheetTranslateY]);

    const allChecked = TERMS_ITEMS.every((item) => checked[item.key]);

    const toggleAll = () => {
        const next = !allChecked;
        setChecked({ age: next, terms: next, privacy: next });
    };

    const toggleItem = (key: string) => {
        setChecked((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const handleViewDetail = () => {
        // TODO: 약관 상세 페이지 연결 전까지는 임시로 비워둠.
    };

    // 약관 3개가 모두 체크된 경우에만 회원가입 진행
    const handleAgree = () => {
        if (!allChecked) return;

        onAgree();
    };

    return (
        <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
            <View style={styles.overlay}>
                <Pressable style={styles.scrim} onPress={onClose} />

                <Animated.View
                    style={[
                        styles.sheet,
                        { paddingBottom: insets.bottom + 24 },
                        { transform: [{ translateY: sheetTranslateY }] },
                    ]}
                >
                    <View style={styles.headerRow}>
                        <Pressable
                            style={[
                                styles.checkBadge,
                                allChecked
                                    ? styles.checkBadgeActive
                                    : styles.checkBadgeInactive,
                            ]}
                            onPress={toggleAll}
                        >
                            <CheckIcon
                                width={13}
                                height={13}
                                color={COLORS.white}
                            />
                        </Pressable>

                        <AppText
                            variant="termsTitle"
                            color={COLORS.black}
                            style={styles.headerTitle}
                        >
                            ATCH! 이용약관 전체 동의
                        </AppText>
                    </View>

                    <View style={styles.itemList}>
                        {TERMS_ITEMS.map((item) => (
                            <View key={item.key} style={styles.itemRow}>
                                <Pressable
                                    style={styles.itemCheck}
                                    onPress={() => toggleItem(item.key)}
                                >
                                    <CheckIcon
                                        width={18}
                                        height={18}
                                        color={
                                            checked[item.key]
                                                ? COLORS.gray800
                                                : COLORS.gray400
                                        }
                                    />
                                </Pressable>

                                <AppText
                                    variant="termsItemText"
                                    color={COLORS.gray600}
                                    style={styles.itemText}
                                >
                                    {item.label}
                                </AppText>

                                <Pressable onPress={handleViewDetail}>
                                    <AppText
                                        variant="termsViewText"
                                        color={COLORS.gray300}
                                        style={styles.viewText}
                                    >
                                        보기
                                    </AppText>
                                </Pressable>
                            </View>
                        ))}
                    </View>

                    <AppButton
                        label="회원가입"
                        variant="primary"
                        textVariant="authButtonText"
                        onPress={handleAgree}
                        style={styles.agreeBtn}
                    />
                </Animated.View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    scrim: {
        ...StyleSheet.absoluteFill,
        backgroundColor: COLORS.black,
        opacity: 0.36,
    },

    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 22,
        borderTopRightRadius: 22,
        paddingHorizontal: 35,
        paddingTop: 35,
    },

    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    headerTitle: {
        flex: 1,
    },

    itemList: {
        marginTop: 34,
        gap: 15,
    },

    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },

    itemText: {
        flex: 1,
    },

    viewText: {
        textDecorationLine: 'underline',
    },

    itemCheck: {
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
    },

    checkBadgeActive: {
        backgroundColor: COLORS.gray800,
    },

    checkBadgeInactive: {
        backgroundColor: COLORS.gray400,
    },

    agreeBtn: {
        marginTop: 46,
        height: 60,
        borderRadius: 16,
        marginHorizontal: -14,
    },
});