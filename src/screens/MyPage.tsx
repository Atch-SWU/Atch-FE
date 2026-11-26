
import { useState, useEffect, useCallback } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    useWindowDimensions,
    ImageSourcePropType,
    Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';

import AppText from '../components/AppText';
import CharacterItemCell from '../components/CharacterItemCell';
import SettingsIcon from '../assets/icon/settings.svg';
import { COLORS } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

import {
    getCharacterItemCatalog,
    getCharacter,
    equipCharacterItem,
    unequipCharacterItem,
    CharacterItemError,
    CharacterItemCategory,
    CatalogItem,
    CharacterResponse,
} from '../api/characterItemApi';

// 아이템 카테고리 탭
const CATEGORIES = ['전체', '색상', '배경', '눈', '악세서리'] as const;
type Category = (typeof CATEGORIES)[number];

// 화면 카테고리와 서버 카테고리 연결
const CATEGORY_API_MAP: Record<
    Exclude<Category, '전체'>,
    CharacterItemCategory
> = {
    색상: 'COLOR',
    배경: 'BACKGROUND',
    눈: 'EYES',
    악세서리: 'ACCESSORY',
};

// 화면에서 사용할 아이템 데이터
interface CharacterItem {
    id: string;
    category: Exclude<Category, '전체'> | null;
    name: string;
    image?: ImageSourcePropType;
    layerImage?: ImageSourcePropType;
    assetKey: string;
    owned: boolean;
    equipped: boolean;
}

// 서버 아이템 ID와 캐릭터 착용용 로컬 PNG 연결
const ITEM_IMAGES: Record<number, ImageSourcePropType> = {
    1: require('../assets/items/accessory/cook.png'),
    2: require('../assets/items/accessory/cream.png'),
    3: require('../assets/items/accessory/towel.png'),
    4: require('../assets/items/accessory/towel.png'),
};

// 백엔드 category 값을 화면 카테고리로 변환
function convertCategory(
    value: string,
): Exclude<Category, '전체'> | null {
    switch (value.toUpperCase()) {
        case 'COLOR':
            return '색상';
        case 'BACKGROUND':
            return '배경';
        case 'EYES':
            return '눈';
        case 'ACCESSORY':
            return '악세서리';
        default:
            return null;
    }
}

// 카탈로그 API 응답을 화면 데이터로 변환
function convertCatalogItem(
    catalogItem: CatalogItem,
): CharacterItem {
    const item = catalogItem.item;

    // 아이템 목록: 서버 이미지 사용
    const image: ImageSourcePropType | undefined =
        item.assetUrl
            ? { uri: item.assetUrl }
            : undefined;

    // 캐릭터 착용: 매칭된 로컬 PNG 사용
    const layerImage = ITEM_IMAGES[item.id];

    return {
        id: String(item.id),
        category: convertCategory(item.category),
        name: item.name,
        image,
        layerImage,
        assetKey: item.assetKey,
        owned: catalogItem.owned,
        equipped: catalogItem.equipped,
    };
}

// 한 줄 4개, 좌우 여백 21, 박스 간격 20
const GRID_COLUMNS = 4;
const SHEET_SIDE_PADDING = 21;
const GRID_GAP = 20;

// 플로팅 하단 네비 높이 + 아래 여백 + 여유
const NAV_SPACE = 70 + 16 + 24;

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const [category, setCategory] = useState<Category>('전체');

    // 카탈로그 아이템 데이터
    const [items, setItems] = useState<CharacterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // 현재 캐릭터 장착 정보
    const [character, setCharacter] =
        useState<CharacterResponse | null>(null);

    // 전체 아이템 카탈로그 조회
    const loadItems = useCallback(async () => {
        setIsLoading(true);
        setLoadError(null);

        try {
            const response = await getCharacterItemCatalog({
                page: 0,
                size: 100,
            });

            setItems(response.items.map(convertCatalogItem));
        } catch (error) {
            setLoadError(
                error instanceof CharacterItemError
                    ? error.message
                    : '아이템 목록을 불러오지 못했어요.',
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    // 현재 캐릭터 장착 정보 조회
    const loadCharacter = useCallback(async () => {
        try {
            const response = await getCharacter();
            setCharacter(response);

            console.log('캐릭터 조회 성공:', response);
        } catch (error) {
            console.log('캐릭터 조회 실패:', error);
        }
    }, []);

    // 아이템 장착
    
// 아이템 장착 및 해제
const handleEquipItem = useCallback(
    async (item: CharacterItem) => {
        // 보유하지 않은 아이템은 장착할 수 없음
        if (!item.owned) {
            return;
        }

        // 카테고리가 없는 아이템은 장착할 수 없음
        if (!item.category) {
            Alert.alert(
                '장착할 수 없어요',
                '아이템 카테고리를 확인할 수 없어요.',
            );
            return;
        }

        // 서버에서 사용할 카테고리
        const apiCategory = CATEGORY_API_MAP[item.category];

        try {
            console.log('아이템 선택:', {
                id: item.id,
                name: item.name,
                category: apiCategory,
                equipped: item.equipped,
            });

            if (item.equipped) {
                // 이미 장착된 아이템을 다시 누르면 해제
                await unequipCharacterItem(apiCategory);

                console.log('아이템 장착 해제 성공');
            } else {
                // 장착되지 않은 아이템이면 장착
                await equipCharacterItem(
                    apiCategory,
                    Number(item.id),
                );

                console.log('아이템 장착 성공');
            }

            // 성공 후 카탈로그와 캐릭터 정보 모두 갱신
            await Promise.all([
                loadItems(),
                loadCharacter(),
            ]);
        } catch (error) {
            console.log('아이템 장착/해제 실패:', error);

            const message =
                error instanceof CharacterItemError
                    ? error.message
                    : '아이템 처리에 실패했어요.';

            Alert.alert('아이템 처리 실패', message);
        }
    },
    [loadItems, loadCharacter],
);


    // 최초 진입 시 카탈로그와 캐릭터 정보 조회
    useEffect(() => {
        void loadItems();
        void loadCharacter();
    }, [loadItems, loadCharacter]);

    const boxSize = Math.floor(
        (
            width -
            SHEET_SIDE_PADDING * 2 -
            GRID_GAP * (GRID_COLUMNS - 1)
        ) / GRID_COLUMNS,
    );

    // 선택한 카테고리에 따라 아이템 필터링
    const visibleItems =
        category === '전체'
            ? items
            : items.filter((item) => item.category === category);

    // 실제 캐릭터 장착 슬롯을 기준으로 착용 이미지 구성
    const equippedItems = (character?.slots ?? []).flatMap((slot) => {
        // 비어 있는 슬롯은 제외
        if (!slot.item) {
            return [];
        }

        // 서버 아이템 ID에 연결된 로컬 PNG 가져오기
        const layerImage = ITEM_IMAGES[slot.item.id];

        // 서버 카테고리를 화면 카테고리로 변환
        const convertedCategory = convertCategory(slot.category);

        // 로컬 이미지 또는 카테고리가 없으면 표시하지 않음
        if (!layerImage || !convertedCategory) {
            return [];
        }

        return [
            {
                id: String(slot.item.id),
                category: convertedCategory,
                layerImage,
            },
        ];
    });

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
                    <SettingsIcon width={26} height={26} />
                </Pressable>
            </View>

            {/* 캐릭터 이미지 및 장착 아이템 레이어 */}
            <View style={styles.characterArea}>
                <View style={styles.characterStack}>

                    {/* 배경 아이템 */}
                    {equippedItems
                        .filter((item) => item.category === '배경')
                        .map((item) => (
                            <Image
                                key={item.id}
                                source={item.layerImage}
                                style={styles.characterLayer}
                                resizeMode="contain"
                            />
                        ))}

                    {/* 기본 캐릭터 */}
                    <Image
                        source={require('../assets/items/metch.png')}
                        style={styles.characterLayer}
                        resizeMode="contain"
                    />

                    {/* 색상, 눈, 악세서리 아이템 */}
                    {(['색상', '눈', '악세서리'] as const).map(
                        (categoryName) =>
                            equippedItems
                                .filter(
                                    (item) =>
                                        item.category === categoryName,
                                )
                                .map((item) => (
                                    <Image
                                        key={item.id}
                                        source={item.layerImage}
                                        style={styles.characterLayer}
                                        resizeMode="contain"
                                    />
                                )),
                    )}
                </View>
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
                                    active
                                        ? styles.chipActive
                                        : styles.chipInactive,
                                ]}
                                onPress={() => setCategory(name)}
                            >
                                <AppText
                                    variant="shopTitle"
                                    color={
                                        active
                                            ? COLORS.white
                                            : COLORS.gray800
                                    }
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
                        {
                            paddingBottom:
                                NAV_SPACE + insets.bottom,
                        },
                    ]}
                >
                    {isLoading ? (
                        <View style={styles.emptyContainer} />
                    ) : loadError ? (
                        <View style={styles.emptyContainer}>
                            <AppText
                                variant="shopTitle"
                                color={COLORS.gray800}
                            >
                                {loadError}
                            </AppText>

                            <Pressable onPress={loadItems}>
                                <AppText
                                    variant="shopTitle"
                                    color={COLORS.gray800}
                                >
                                    다시 시도하기
                                </AppText>
                            </Pressable>
                        </View>
                    ) : items.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <AppText
                                variant="shopTitle"
                                color={COLORS.gray800}
                                style={styles.emptyText}
                            >
                                할 일을 끝내고 아이템을 모아보세요!
                            </AppText>
                        </View>
                    ) : (
                        visibleItems.map((item) => (
                            <CharacterItemCell
                                key={item.id}
                                size={boxSize}
                                name={item.name}
                                image={item.image}
                                owned={item.owned}
                                equipped={item.equipped}
                                onPress={() => handleEquipItem(item)}
                            />
                        ))
                    )}
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

    characterStack: {
        width: 252,
        height: 210,
        position: 'relative',
    },

    characterLayer: {
        position: 'absolute',
        top: -10,
        left: 0,
        width: 252,
        height: 245,
    },

    sheet: {
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
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

    emptyContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 30,
        gap: 12,
    },

    emptyText: {
        fontSize: 14,
        fontFamily: 'SUIT-Medium',
        lineHeight: 22,
        textAlign: 'center',
    },
});
