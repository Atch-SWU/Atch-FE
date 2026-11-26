import {
    View,
    Image,
    Pressable,
    StyleSheet,
    ImageSourcePropType,
} from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface CharacterItemCellProps {
    /** 박스 한 변의 길이 */
    size: number;
    /** 아이템 이름 */
    name: string;
    /** 아이템 이미지 */
    image?: ImageSourcePropType | null;
    /** 보유 여부 */
    owned?: boolean;
    /** 장착 여부 */
    equipped?: boolean;
    onPress?: () => void;
}

/** 흰색 자물쇠 아이콘 */
function LockGlyph({ badgeSize }: { badgeSize: number }) {
    const bodyW = badgeSize * 0.4;
    const bodyH = badgeSize * 0.3;
    const shackleW = bodyW * 0.62;
    const shackleH = badgeSize * 0.17;
    const stroke = badgeSize * 0.065;

    return (
        <View style={{ alignItems: 'center' }}>
            {/* 고리 */}
            <View
                style={{
                    width: shackleW,
                    height: shackleH,
                    borderWidth: stroke,
                    borderBottomWidth: 0,
                    borderColor: COLORS.white,
                    borderTopLeftRadius: shackleW / 2,
                    borderTopRightRadius: shackleW / 2,
                }}
            />

            {/* 몸통 */}
            <View
                style={{
                    width: bodyW,
                    height: bodyH,
                    borderRadius: badgeSize * 0.06,
                    backgroundColor: COLORS.white,
                }}
            />
        </View>
    );
}

/** 마이페이지 아이템 칸 */
export default function CharacterItemCell({
    size,
    name,
    image,
    owned = true,
    equipped = false,
    onPress,
}: CharacterItemCellProps) {
    const badgeSize = size * 0.28;

    return (
        <Pressable
            style={[styles.cell, { width: size }]}
            onPress={onPress}
        >
            <View
                style={[
                    styles.box,
                    { width: size, height: size },
                    owned && equipped && styles.equippedBox,
                ]}
            >
                {image ? (
                    <Image
                        source={image}
                        style={{ width: size, height: size }}
                        resizeMode="contain"
                    />
                ) : null}

                {/* 미보유 아이템: 뿌연 효과 */}
                {!owned && (
                    <View
                        pointerEvents="none"
                        style={styles.lockedOverlay}
                    />
                )}

                {/* 미보유 아이템 자물쇠 */}
                {!owned && (
                    <View
                        pointerEvents="none"
                        style={[
                            styles.lockBadge,
                            {
                                width: badgeSize,
                                height: badgeSize,
                                borderRadius: badgeSize * 0.36,
                            },
                        ]}
                    >
                        <LockGlyph badgeSize={badgeSize} />
                    </View>
                )}
            </View>

            {/* 아이템 이름 */}
            <AppText
                variant="shopTitle"
                color={COLORS.gray700}
                style={[
                    styles.name,
                    !owned && styles.lockedName,
                ]}
                numberOfLines={1}
            >
                {name}
            </AppText>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    cell: {
        alignItems: 'center',
    },

    box: {
        borderRadius: 16,
        backgroundColor: COLORS.gray100,
        borderWidth: 0,
        borderColor: 'transparent',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
    },

    // 장착 중인 아이템
    equippedBox: {
        backgroundColor: COLORS.orange100,
        borderColor: COLORS.orange600,
        borderWidth: 2,
    },

    // 잠긴 아이템을 뿌옇게 만드는 흰색 레이어
    lockedOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.45)',
    },

    // 기존 검은색 둥근 자물쇠 배경
    lockBadge: {
        position: 'absolute',
        alignSelf: 'center',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#111111',
        borderRadius: 10,
    },

    name: {
        marginTop: 8,
        fontFamily: 'SUIT-SemiBold',
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.gray700,
        textAlign: 'center',
    },

    lockedName: {
        opacity: 0.55,
    },
});
