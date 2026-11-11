import { View, Image, Pressable, StyleSheet, ImageSourcePropType } from 'react-native';
import AppText from './AppText';
import { COLORS } from '../constants/token';

interface CharacterItemCellProps {
    /** 박스 한 변의 길이 */
    size: number;
    /** 아이템 이름 (박스 아래에 표시) */
    name: string;
    /** 아이템 이미지 (박스 안 중앙에 표시). 없으면 빈 박스 */
    image?: ImageSourcePropType | null;
    onPress?: () => void;
}

/** 마이페이지 아이템 칸: 회색 박스 + 중앙 아이템 이미지 + 아래 이름 */
export default function CharacterItemCell({
    size,
    name,
    image,
    onPress,
}: CharacterItemCellProps) {
    return (
        <Pressable style={[styles.cell, { width: size }]} onPress={onPress}>
            <View style={[styles.box, { width: size, height: size }]}>
                {image ? (
                    // 박스와 같은 정사각형 프레임으로 내보낸 이미지라
                    // 박스 크기에 맞춰 100%로 채우면 피그마 위치·비율이 그대로 유지된다
                    <Image
                        source={image}
                        style={{ width: size, height: size }}
                        resizeMode="contain"
                    />
                ) : null}
            </View>

            <AppText
                variant="shopTitle"
                color={COLORS.gray700}
                style={styles.name}
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
        alignItems: 'center',
        justifyContent: 'center',
    },

    name: {
        marginTop: 8,
        fontFamily: 'SUIT-SemiBold',
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.gray700,
        textAlign: 'center',
    },
});
