import { View, StyleSheet } from 'react-native';

import { COLORS } from '../constants/token';

interface OnboardingDotsProps {
    /** 전체 페이지 수 */
    total: number;
    activeIndex: number;
}

/** 온보딩 상단 페이지 인디케이터 */
export default function OnboardingDots({
    total,
    activeIndex,
}: OnboardingDotsProps) {
    return (
        <View style={styles.row}>
            {Array.from({ length: total }).map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.dot,
                        index === activeIndex && styles.dotActive,
                    ]}
                />
            ))}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
        marginTop: 12,
    },

    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.grey200,
    },

    dotActive: {
        backgroundColor: COLORS.primary,
    },
});
