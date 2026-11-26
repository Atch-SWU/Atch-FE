import { useState, useEffect, useCallback, useRef } from 'react';
import {
    View,
    StyleSheet,
    Pressable,
    Image,
    ScrollView,
    useWindowDimensions,
    ImageSourcePropType,
    Alert,
    Modal,
    Animated,
    Easing,
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
    getCharacterItemDetail,
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

    const image: ImageSourcePropType | undefined =
        item.assetUrl
            ? { uri: item.assetUrl }
            : undefined;

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

// 아이템 그리드 설정
const GRID_COLUMNS = 4;
const SHEET_SIDE_PADDING = 20;
const GRID_GAP = 20;

// 402px 화면에서 실제 그리드 기준 너비
const BASE_GRID_WIDTH = 360;

// 플로팅 하단 네비 높이 + 아래 여백 + 여유
const NAV_SPACE = 70 + 16 + 24;

interface ShopScreenProps {
    onGoHome: () => void;
}

export default function ShopScreen({
    onGoHome,
}: ShopScreenProps) {
    console.log('MyPage 렌더링:', typeof onGoHome);

    const insets = useSafeAreaInsets();
    const { width, height } = useWindowDimensions();

    const detailScale = Math.max(
        0.9,
        Math.min(1.1, Math.min(width / 402, height / 874)),
    );

    const navigation =
        useNavigation<NativeStackNavigationProp<RootStackParamList>>();

    const [category, setCategory] = useState<Category>('전체');

    // 카탈로그 아이템 데이터
    const [items, setItems] = useState<CharacterItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    // 현재 캐릭터 장착 정보
    const [character, setCharacter] =
        useState<CharacterResponse | null>(null);

    // 실제 아이템 그리드 너비
    const [gridWidth, setGridWidth] = useState(0);

    // 아이템 상세 바텀시트
    const [isDetailVisible, setIsDetailVisible] = useState(false);
    const [isBackdropVisible, setIsBackdropVisible] = useState(false);

    // 바텀시트 이동 애니메이션
    const sheetTranslateY = useRef(
        new Animated.Value(height),
    ).current;

    const [selectedItem, setSelectedItem] =
        useState<CharacterItem | null>(null);

    const [selectedDetail, setSelectedDetail] =
        useState<Awaited<ReturnType<typeof getCharacterItemDetail>> | null>(
            null,
        );

    const [isDetailLoading, setIsDetailLoading] = useState(false);
    const [detailError, setDetailError] = useState<string | null>(null);

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

    // 아이템 장착 및 해제
    const handleEquipItem = useCallback(
        async (item: CharacterItem) => {
            if (!item.owned) {
                return;
            }

            if (!item.category) {
                Alert.alert(
                    '장착할 수 없어요',
                    '아이템 카테고리를 확인할 수 없어요.',
                );
                return;
            }

            const apiCategory = CATEGORY_API_MAP[item.category];

            try {
                console.log('아이템 선택:', {
                    id: item.id,
                    name: item.name,
                    category: apiCategory,
                    equipped: item.equipped,
                });

                if (item.equipped) {
                    await unequipCharacterItem(apiCategory);
                    console.log('아이템 장착 해제 성공');
                } else {
                    await equipCharacterItem(
                        apiCategory,
                        Number(item.id),
                    );
                    console.log('아이템 장착 성공');
                }

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

    // 미보유 아이템 상세 바텀시트 열기
    const handleOpenItemDetail = useCallback(
        async (item: CharacterItem) => {
            setSelectedItem(item);
            setSelectedDetail(null);
            setDetailError(null);
            setIsBackdropVisible(true);
            setIsDetailVisible(true);
            setIsDetailLoading(true);

            try {
                const response = await getCharacterItemDetail(
                    Number(item.id),
                );

                setSelectedDetail(response);

                console.log('아이템 상세 조회 성공:', response);
            } catch (error) {
                console.log('아이템 상세 조회 실패:', error);

                setDetailError(
                    error instanceof CharacterItemError
                        ? error.message
                        : '아이템 정보를 불러오지 못했어요.',
                );
            } finally {
                setIsDetailLoading(false);
            }
        },
        [],
    );

    // 바텀시트가 열릴 때 아래에서 위로 부드럽게 이동
    useEffect(() => {
        if (!isDetailVisible) {
            return;
        }

        sheetTranslateY.setValue(height);

        Animated.timing(sheetTranslateY, {
            toValue: 0,
            duration: 400,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: true,
        }).start();
    }, [isDetailVisible, height, sheetTranslateY]);

    // 바텀시트 닫기
    const handleCloseDetail = () => {
        setIsBackdropVisible(false);

        Animated.timing(sheetTranslateY, {
            toValue: height,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(({ finished }) => {
            if (finished) {
                setIsDetailVisible(false);
                setSelectedItem(null);
                setSelectedDetail(null);
                setDetailError(null);
            }
        });
    };

    // 홈 화면으로 이동
    const handleGoHome = () => {
        setIsBackdropVisible(false);

        Animated.timing(sheetTranslateY, {
            toValue: height,
            duration: 300,
            easing: Easing.in(Easing.cubic),
            useNativeDriver: true,
        }).start(() => {
            setIsDetailVisible(false);
            setSelectedItem(null);
            setSelectedDetail(null);
            setDetailError(null);

            // MainScreen의 홈 탭으로 이동
            onGoHome();
        });
    };

    // 최초 진입 시 카탈로그와 캐릭터 정보 조회
    useEffect(() => {
        void loadItems();
        void loadCharacter();
    }, [loadItems, loadCharacter]);

    // ----------------------------------------
    // 실제 그리드 너비 기준 반응형 크기 계산
    // ----------------------------------------

    // 실제 그리드 너비가 측정되기 전에는 기본값 사용
    const gridGap = gridWidth > 0
        ? Math.max(
            4,
            Math.min(
                GRID_GAP,
                GRID_GAP * (gridWidth / BASE_GRID_WIDTH),
            ),
        )
        : GRID_GAP;

    // 실제 그리드 너비 안에 4개가 들어가도록 계산
    const boxSize = gridWidth > 0
        ? Math.floor(
            (
                gridWidth -
                gridGap * (GRID_COLUMNS - 1)
            ) / GRID_COLUMNS,
        )
        : 75;

    // 선택한 카테고리에 따라 아이템 필터링
    const visibleItems =
        category === '전체'
            ? items
            : items.filter((item) => item.category === category);

    // 실제 캐릭터 장착 슬롯을 기준으로 착용 이미지 구성
    const equippedItems = (character?.slots ?? []).flatMap((slot) => {
        if (!slot.item) {
            return [];
        }

        const layerImage = ITEM_IMAGES[slot.item.id];
        const convertedCategory = convertCategory(slot.category);

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

    // 상세 아이템 이미지
    // 상세 API 이미지가 없으면 카탈로그 이미지,
    // 그것도 없으면 로컬 아이템 이미지 사용
    const detailImage: ImageSourcePropType | undefined =
        selectedDetail?.assetUrl
            ? { uri: selectedDetail.assetUrl }
            : selectedItem?.image ??
            (selectedDetail?.id
                ? ITEM_IMAGES[selectedDetail.id]
                : undefined);

    const detailName =
        selectedDetail?.name ?? selectedItem?.name ?? '';

    const detailGrade = selectedDetail?.grade ?? '';

    const detailBoxSize = 90 * detailScale;

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
                    onLayout={(event) => {
                        const measuredWidth =
                            event.nativeEvent.layout.width;

                        setGridWidth((previousWidth) => {
                            return Math.abs(
                                previousWidth - measuredWidth,
                            ) > 0.5
                                ? measuredWidth
                                : previousWidth;
                        });
                    }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[
                        styles.grid,
                        {
                            columnGap: gridGap,
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
                                onPress={() => {
                                    if (!item.owned) {
                                        void handleOpenItemDetail(item);
                                    } else {
                                        void handleEquipItem(item);
                                    }
                                }}
                            />
                        ))
                    )}
                </ScrollView>
            </View>

            {/* 미보유 아이템 상세 바텀시트 */}
            <Modal
                transparent
                animationType="none"
                statusBarTranslucent
                visible={isDetailVisible}
                onRequestClose={handleCloseDetail}
            >
                <View style={styles.modalRoot}>
                    {/* 어두운 배경: 즉시 표시 및 제거 */}
                    {isBackdropVisible && (
                        <Pressable
                            style={styles.modalBackdrop}
                            onPress={handleCloseDetail}
                        />
                    )}

                    {/* 바텀시트: 아래에서 위로 부드럽게 이동 */}
                    <Animated.View
                        style={[
                            styles.detailSheet,
                            {
                                paddingBottom: Math.max(
                                    insets.bottom,
                                    20,
                                ),
                                transform: [
                                    {
                                        translateY: sheetTranslateY,
                                    },
                                ],
                            },
                        ]}
                    >
                        {isDetailLoading ? (
                            <View style={styles.detailLoading}>
                                <AppText
                                    variant="shopTitle"
                                    color={COLORS.gray700}
                                >
                                    아이템 정보를 불러오는 중이에요.
                                </AppText>
                            </View>
                        ) : detailError ? (
                            <View style={styles.detailLoading}>
                                <AppText
                                    variant="shopTitle"
                                    color={COLORS.gray700}
                                >
                                    {detailError}
                                </AppText>

                                <Pressable
                                    onPress={handleCloseDetail}
                                    style={styles.closeTextButton}
                                >
                                    <AppText
                                        variant="shopTitle"
                                        color={COLORS.gray400}
                                        style={styles.closeText}
                                    >
                                        닫기
                                    </AppText>
                                </Pressable>
                            </View>
                        ) : (
                            <>
                                {/* 아이템 이미지 + 잠금 아이콘 */}
                                <View style={styles.detailItemBox}>
                                    <CharacterItemCell
                                        size={detailBoxSize}
                                        name=""
                                        image={detailImage}
                                        owned={false}
                                        showName={false}
                                        showLockedOverlay={false}
                                        lockPosition="bottom"
                                    />
                                </View>

                                {/* 아이템 이름 + 등급 */}
                                <View
                                    style={[
                                        styles.detailNameRow,
                                        {
                                            gap: 8 * detailScale,
                                            marginTop: 20 * detailScale,
                                        },
                                    ]}
                                >
                                    <AppText
                                        variant="shopTitle"
                                        color={COLORS.black}
                                        style={[
                                            styles.detailName,
                                            { fontSize: 18 * detailScale },
                                        ]}
                                    >
                                        {detailName}
                                    </AppText>

                                    {!!detailGrade && (
                                        <View
                                            style={[
                                                styles.gradeBadge,
                                                {
                                                    width: 23 * detailScale,
                                                    height: 23 * detailScale,
                                                    borderRadius: 9 * detailScale,
                                                },
                                            ]}
                                        >
                                            <AppText
                                                variant="shopTitle"
                                                color={COLORS.white}
                                                style={[
                                                    styles.gradeText,
                                                    { fontSize: 15 * detailScale },
                                                ]}
                                            >
                                                {detailGrade}
                                            </AppText>
                                        </View>
                                    )}
                                </View>

                                {/* 아이템 획득 안내 */}
                                <AppText
                                    variant="shopTitle"
                                    color={COLORS.gray700}
                                    style={[
                                        styles.detailDescription,
                                        { fontSize: 12 * detailScale },
                                    ]}
                                >
                                    오늘 할 일을 다하면 랜덤으로 지급돼요.
                                </AppText>

                                {/* 홈 이동 버튼 */}
                                <Pressable
                                    style={[
                                        styles.startButton,
                                        {
                                            height: 52 * detailScale,
                                            marginTop: 26 * detailScale,
                                            borderRadius: 12 * detailScale,
                                        },
                                    ]}
                                    onPress={handleGoHome}
                                >
                                    <AppText
                                        variant="shopTitle"
                                        color={COLORS.white}
                                        style={[
                                            styles.startButtonText,
                                            { fontSize: 16 * detailScale },
                                        ]}
                                    >
                                        집중하러 가기
                                    </AppText>
                                </Pressable>

                                {/* 바텀시트 닫기 */}
                                <Pressable
                                    onPress={handleCloseDetail}
                                    style={styles.closeTextButton}
                                >
                                    <AppText
                                        variant="shopTitle"
                                        color={COLORS.gray400}
                                        style={styles.closeText}
                                    >
                                        나중에 할게요
                                    </AppText>
                                </Pressable>
                            </>
                        )}
                    </Animated.View>
                </View>
            </Modal>
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
        minWidth: 0,
    },

    grid: {
        width: '100%',
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignContent: 'flex-start',
        justifyContent: 'flex-start',
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

    // 바텀시트 배경
    modalRoot: {
        flex: 1,
        justifyContent: 'flex-end',
    },

    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.35)',
    },

    // 상세 바텀시트
    detailSheet: {
        width: '100%',
        backgroundColor: COLORS.white,
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: 70,
        paddingHorizontal: 21,
        alignItems: 'center',
    },

    detailLoading: {
        width: '100%',
        minHeight: 300,
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },

    detailItemBox: {
        alignItems: 'center',
        justifyContent: 'center',
    },

    // 아이템 이름과 등급
    detailNameRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },

    detailName: {
        fontFamily: 'SUIT-Bold',
        fontSize: 18,
        lineHeight: 24,
        color: COLORS.black,
        textAlign: 'center',
    },

    gradeBadge: {
        width: 23,
        height: 23,
        borderRadius: 9,
        backgroundColor: COLORS.orange600,
        alignItems: 'center',
        justifyContent: 'center',
    },

    gradeText: {
        fontFamily: 'SUIT-Bold',
        fontSize: 15,
        lineHeight: 19,
        color: COLORS.white,
        textAlign: 'center',
    },

    // 아이템 획득 안내 문구
    detailDescription: {
        marginTop: 6,
        fontFamily: 'SUIT-Medium',
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.gray700,
        textAlign: 'center',
    },

    // 홈 이동 버튼
    startButton: {
        width: '100%',
        height: 52,
        marginTop: 26,
        backgroundColor: COLORS.black,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },

    startButtonText: {
        fontFamily: 'SUIT-SemiBold',
        fontSize: 16,
        lineHeight: 22,
        color: COLORS.white,
        textAlign: 'center',
    },

    // 닫기 텍스트
    closeTextButton: {
        marginTop: 14,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 4,
    },

    closeText: {
        fontFamily: 'SUIT-Medium',
        fontSize: 12,
        lineHeight: 18,
        color: COLORS.gray400,
        textAlign: 'center',
    },
});
