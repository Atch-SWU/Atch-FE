import { Pressable, View, StyleSheet } from 'react-native';
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import CheckIcon from '../assets/icon/check.svg';
import LockIcon from '../assets/icon/lock.svg';
import { COLORS, SPACING } from '../constants/token';

interface ItemBoxProps {
    size: number;
    owned: boolean;
    /** 물약 등 아이템 아이콘 — svg 컴포넌트를 그대로 전달 (예: import ItemIcon from '../assets/items/liquid-blue.svg') */
    Icon: FC<SvgProps>;
    onPress?: () => void;
}

/** 상점 아이템 박스 — 획득/미획득 두 상태를 공유하는 재사용 컴포넌트 */
export default function ItemBox({ size, owned, Icon, onPress }: ItemBoxProps) {
    return (
        <Pressable
            style={[
                styles.box,
                { width: size, height: size },
                owned ? styles.boxOwned : styles.boxLocked,
            ]}
            onPress={onPress}
        >
            <Icon width={size * 0.68} height={size * 0.68} />

            {owned ? (
                <View style={styles.checkBadge}>
                    <CheckIcon width={11} height={11} color={COLORS.white} />
                </View>
            ) : (
                <View style={styles.lockBadge}>
                    <LockIcon width={13} height={13} color={COLORS.itemLockIcon} />
                </View>
            )}
        </Pressable>
    );
}

const styles = StyleSheet.create({
    box: {
        borderRadius: SPACING.cardRadius,
        borderWidth: 1,
        borderColor: COLORS.itemBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
    boxOwned: { backgroundColor: COLORS.itemOwnedBg },
    boxLocked: { backgroundColor: COLORS.itemLockedBg },

    checkBadge: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 20,
        height: 20,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.itemOwnedBadgeBg,
    },
    lockBadge: {
        position: 'absolute',
        bottom: 8,
        right: 8,
    },
});
