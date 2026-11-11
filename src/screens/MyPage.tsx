import { useState } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    useWindowDimensions,
    ImageSourcePropType,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import CharacterItemCell from '../components/CharacterItemCell';
import SettingsIcon from '../assets/icon/settings.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

// 아이템 카테고리 탭
const CATEGORIES = ['전체', '색상', '배경', '눈', '악세서리'] as const;
type Category = (typeof CATEGORIES)[number];

interface CharacterItem {
    id: string;
    category: Exclude<Category, '전체'>;
    /** 박스 아래에 표시되는 아이템 이름 */
    name: string;
    /** 박스 중앙에 표시되는 아이템 이미지 (예: require('../assets/items/xxx.png')). 없으면 빈 박스 */
    image?: ImageSourcePropType;
}

// TODO: 캐릭터 아이템 API(GET /character/items) 연동 전까지 쓰는 임시 데이터
// 아이템을 추가할 때는 name 과 image 만 채우면 된다.
const ITEMS: CharacterItem[] = [
    { id: 'color-1', category: '색상', name: '기본' },
    { id: 'color-2', category: '색상', name: '기본' },
    { id: 'bg-1', category: '배경', name: '기본' },
    { id: 'bg-2', category: '배경', name: '기본' },
    { id: 'eye-1', category: '눈', name: '기본' },
    { id: 'eye-2', category: '눈', name: '기본' },
    {
        id: 'strawberry-cream',
        category: '악세서리',
        name: '딸기 크림',
        image: require('../assets/items/strawberry_cream.png'),
    },
    { id: 'acc-1', category: '악세서리', name: '기본' },
    { id: 'acc-2', category: '악세서리', name: '기본' },
];

// 한 줄 4개, 좌우 여백 21, 박스 간격 20 (기준 w402에서 박스 75x75)
const GRID_COLUMNS = 4;
const SHEET_SIDE_PADDING = 21;
const GRID_GAP = 20;
// 플로팅 하단 네비 높이(70) + 아래 여백(16) + 여유
const NAV_SPACE = 70 + 16 + 24;

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const [category, setCategory] = useState<Category>('전체');

    const visibleItems =
        category === '전체'
            ? ITEMS
            : ITEMS.filter((item) => item.category === category);

    const boxSize = Math.floor(
        (width - SHEET_SIDE_PADDING * 2 - GRID_GAP * (GRID_COLUMNS - 1)) /
            GRID_COLUMNS,
    );

    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    return (
        <View style={styles.root}>
            {/* 상단 헤더 */}
            <View
                style={[
                    styles.header,
                    {
                        paddingTop: insets.top + 20,
                    },
                ]}
            >
                {/* 화면 중앙의 마이페이지 제목 */}
                <AppText
                    variant="shopTitle"
                    color={COLORS.black}
                    style={styles.title}
                >
                    마이페이지
                </AppText>

                {/* 오른쪽 설정 아이콘 */}
                <Pressable
                    hitSlop={10}
                    style={styles.settingsButton}
                    onPress={() => navigation.navigate('Settings')}
                >
                    <SettingsIcon
                        width={26}
                        height={26}
                    />
                </Pressable>
            </View>

            {/* 캐릭터 이미지 (시트 위 남는 영역의 가운데) */}
            <View style={styles.characterArea}>
                <Image
                    source={require('../assets/icon/auth-logo.png')}
                    style={styles.character}
                    resizeMode="contain"
                />
            </View>

            {/* 아이템 시트 */}
            <View style={[styles.sheet, { height: height * 0.5 }]}>
                <AppText
                    variant="shopTitle"
                    color={COLORS.black}
                    style={styles.sheetTitle}
                >
                    아이템
                </AppText>

                {/* 카테고리 탭 */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.chipScroll}
                    contentContainerStyle={styles.chipRow}
                >
                    {CATEGORIES.map((name) => {
                        const active = name === category;

                        return (
                            <Pressable
                                key={name}
                                style={[
                                    styles.chip,
                                    active ? styles.chipActive : styles.chipInactive,
                                ]}
                                onPress={() => setCategory(name)}
                            >
                                <AppText
                                    variant="shopTitle"
                                    color={active ? COLORS.white : COLORS.gray800}
                                    style={styles.chipText}
                                >
                                    {name}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                {/* 아이템 그리드 */}
                <ScrollView
                    style={styles.gridScroll}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.grid,
                        { paddingBottom: NAV_SPACE + insets.bottom },
                    ]}
                >
                    {visibleItems.map((item) => (
                        <CharacterItemCell
                            key={item.id}
                            size={boxSize}
                            name={item.name}
                            image={item.image}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: COLORS.gray100,
    },

    header: {
        position: 'relative',
        alignItems: 'center',
        paddingHorizontal: 21,
    },

    title: {
        fontFamily: 'SUIT-Bold',
        fontSize: 18,
        lineHeight: 22,
        color: COLORS.black,
    },

    settingsButton: {
        position: 'absolute',
        right: 21,
        bottom: 0,
        width: 26,
        height: 26,
        alignItems: 'center',
        justifyContent: 'center',
    },

    characterArea: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },

    character: {
        width: 252,
        height: 210,
    },

    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        // 시트 윗부분 테두리 (좌·우·위 1px)
        borderTopWidth: 1,
        borderLeftWidth: 1,
        borderRightWidth: 1,
        borderColor: COLORS.gray300,
        paddingTop: 24,
        paddingHorizontal: SHEET_SIDE_PADDING,
    },

    sheetTitle: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        lineHeight: 20,
        color: COLORS.black,
    },

    // ScrollView는 기본적으로 flexShrink가 1이라, 공간이 모자라면 탭 줄이 줄어들며 글자가 잘린다
    chipScroll: {
        flexGrow: 0,
        flexShrink: 0,
        marginTop: 15,
    },

    chipRow: {
        gap: 8,
    },

    chip: {
        paddingVertical: 8,
        paddingHorizontal: 13,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    chipActive: {
        backgroundColor: COLORS.black,
    },

    chipInactive: {
        backgroundColor: '#F7F9F9',
    },

    chipText: {
        fontFamily: 'SUIT-Medium',
        fontSize: 14,
        lineHeight: 20,
    },

    // 시트 높이 안에서만 차지하고 넘치는 아이템은 스크롤되도록
    gridScroll: {
        flex: 1,
    },

    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: GRID_GAP,
        rowGap: 20,
        marginTop: 25,
    },



});