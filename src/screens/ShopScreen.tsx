import { useState } from 'react';
import { View, ScrollView, Pressable, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import useAppDimensions from '../hooks/useAppDimensions';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';

import AppText from '../components/AppText';
import ItemBox from '../components/ItemBox';
import SettingsIcon from '../assets/icon/settings.svg';
import LiquidBlue from '../assets/items/liquid-blue.svg';
import LiquidYellow from '../assets/items/liquid-yellow.svg';
import LiquidPink from '../assets/items/liquid-pink.svg';
import { COLORS, SPACING } from '../constants/token';
import { RootStackParamList } from '../navigation/types';

interface CategoryItem {
    key: string;
    label: string;
}

const CATEGORIES: CategoryItem[] = [
    { key: 'liquid', label: '액체' },
    { key: 'face', label: '얼굴' },
    { key: 'hat', label: '모자' },
    { key: 'effect', label: '효과' },
    { key: 'expression', label: '표정' },
    { key: 'environment', label: '환경' },
];

interface ShopItem {
    id: string;
    category: string;
    owned: boolean;
    Icon: FC<SvgProps>;
}

// TODO: 실제 보유/미보유 아이템 목록은 서버에서 받아오도록 교체.
// 우선 재사용 가능한 ItemBox 확인용으로 "액체" 카테고리에만 획득 2개 + 미획득 1개 배치.
// 다른 카테고리는 아직 아이템 등록 전이라 비어 있는 게 맞음.
const MOCK_ITEMS: ShopItem[] = [
    { id: 'liquid-1', category: 'liquid', owned: true, Icon: LiquidBlue },
    { id: 'liquid-2', category: 'liquid', owned: true, Icon: LiquidYellow },
    { id: 'liquid-3', category: 'liquid', owned: false, Icon: LiquidPink },
];

const NICKNAME = '슈니'; // TODO: 실제 유저 닉네임 데이터로 교체

// 아이템 그리드 — 간격 26 + 좌우 여백 35 조건에서 한 줄에 3개가 딱 맞도록
// 박스 크기를 화면 폭 기준으로 매번 계산(반응형, 별도의 상한 없이 폭에 맞춰 최대로).
const ITEM_GAP = 26;
const ITEM_GRID_MARGIN = 35;

// 카테고리 활성 타원 — 기준 화면 폭(iPhone 14/15, 390) 대비 비율로 반응형 계산.
// 59x39가 "최대" 사이즈이고 화면이 좁아지면 같은 비율로 함께 줄어듦(더 커지지는 않음).
// 탭 아이템 자체를 고정 높이로 잡고, 퍼센트/이중 inset(top+bottom 동시 지정) 없이
// width/height + top 오프셋 하나만으로 크기를 확정해서(RN 특유의 "부모 높이가 아직
// 정해지지 않은 상태에서 top+bottom을 동시에 주면 그 사이가 무한정 늘어나는" 버그와
// 탭 전환 시 줄 위치가 흔들리는 문제를 둘 다 없앰.
const REFERENCE_SCREEN_WIDTH = 390;
const TAB_ITEM_HEIGHT = 26;
const TAB_PILL_WIDTH = 60;
const TAB_PILL_HEIGHT = 39;
const TABS_ROW_HEIGHT = 76; // ScrollView 자체를 이 높이로 고정 — 컨테이너 높이가 모호해서
// 생기던 여백 문제를 원천 차단(더 이상 컨텐츠에 따라 커지거나 작아지지 않음).

export default function ShopScreen() {
    const insets = useSafeAreaInsets();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { width: windowWidth } = useAppDimensions();
    const [activeCategory, setActiveCategory] = useState('liquid');
    // 첫 번째(액체) 탭 라벨의 실제 렌더 너비 — 타원(pill) 폭과 비교해서
    // "탭 전체(텍스트+타원)"를 통째로 오른쪽으로 밀어 타원 시작점을 아이템 박스
    // 시작점과 맞추기 위해 필요. 텍스트만 옮기면 타원과 따로 놀아서 어색해지므로
    // 텍스트를 포함한 tabItem 전체에 marginLeft를 준다.
    const [firstTabTextWidth, setFirstTabTextWidth] = useState(0);

    const tabPillScale = Math.min(1, windowWidth / REFERENCE_SCREEN_WIDTH);
    const tabPillWidth = TAB_PILL_WIDTH * tabPillScale;
    const tabPillHeight = TAB_PILL_HEIGHT * tabPillScale;
    const firstTabExtraMargin =
        firstTabTextWidth > 0 ? Math.max(0, (tabPillWidth - firstTabTextWidth) / 2) : 0;
    const itemBoxSize = (windowWidth - ITEM_GRID_MARGIN * 2 - ITEM_GAP * 2) / 3;
    const visibleItems = MOCK_ITEMS.filter((item) => item.category === activeCategory);

    return (
        <View style={styles.root}>
            <View style={[styles.headerArea, { paddingTop: insets.top + 24 }]}>
                <View style={styles.headerRow}>
                    <AppText variant="shopTitle" color={COLORS.black}>상점</AppText>
                    <Pressable hitSlop={10} onPress={() => navigation.navigate('Settings')}>
                        <SettingsIcon width={24} height={24} color={COLORS.grey900} />
                    </Pressable>
                </View>

                <Image
                    source={require('../assets/icon/auth-logo.png')}
                    style={[styles.character, { width: 195, height: 190 }]}
                    resizeMode="contain"
                />

                <View style={styles.nicknameRow}>
                    <AppText variant="shopNicknameBold" color={COLORS.black}>{NICKNAME}</AppText>
                    <AppText variant="shopNicknameRegular" color={COLORS.black}> 님</AppText>
                </View>
            </View>

            <View style={styles.bodyArea}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.tabsScroll}
                    contentContainerStyle={styles.tabsRow}
                >
                    {CATEGORIES.map((category, index) => {
                        const isActive = category.key === activeCategory;
                        const isFirst = index === 0;
                        return (
                            <Pressable
                                key={category.key}
                                style={[styles.tabItem, isFirst && { marginLeft: firstTabExtraMargin }]}
                                onPress={() => setActiveCategory(category.key)}
                            >
                                {isActive && (
                                    <View
                                        style={[
                                            styles.tabPillBg,
                                            {
                                                width: tabPillWidth,
                                                height: tabPillHeight,
                                                top: (TAB_ITEM_HEIGHT - tabPillHeight) / 2,
                                                left: '50%',
                                                marginLeft: -tabPillWidth / 2,
                                            },
                                        ]}
                                    />
                                )}
                                <AppText
                                    variant="shopCategoryTab"
                                    color={isActive ? COLORS.categoryTabActiveText : COLORS.categoryTabText}
                                    onLayout={
                                        isFirst
                                            ? (e) => setFirstTabTextWidth(e.nativeEvent.layout.width)
                                            : undefined
                                    }
                                >
                                    {category.label}
                                </AppText>
                            </Pressable>
                        );
                    })}
                </ScrollView>

                <ScrollView
                    showsVerticalScrollIndicator={false}
                    style={styles.gridScroll}
                    contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + 120 }]}
                >
                    {visibleItems.map((item) => (
                        <ItemBox
                            key={item.id}
                            size={itemBoxSize}
                            owned={item.owned}
                            Icon={item.Icon}
                        />
                    ))}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    root: { flex: 1, backgroundColor: COLORS.background },

    headerArea: {
        backgroundColor: COLORS.shopCharBg,
        alignItems: 'center',
        paddingBottom: 32,
    },

    headerRow: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.screenH,
    },

    character: { marginTop: 56 },

    nicknameRow: { flexDirection: 'row', marginTop: 24 },

    bodyArea: { flex: 1, backgroundColor: COLORS.background },

    tabsScroll: {
        height: TABS_ROW_HEIGHT,
        flexGrow: 0,
        flexShrink: 0,
    },

    gridScroll: {
        flex: 1,
    },

    tabsRow: {
        paddingHorizontal: ITEM_GRID_MARGIN,
        paddingTop: 22,
        paddingBottom: 28,
        gap: 30,
        alignItems: 'center',
    },

    tabItem: {
        height: TAB_ITEM_HEIGHT,
        alignItems: 'center',
        justifyContent: 'center',
    },
    tabPillBg: {
        position: 'absolute',
        borderRadius: 20,
        backgroundColor: COLORS.categoryTabActiveBg,
        borderWidth: 1,
        borderColor: COLORS.categoryTabActiveBorder,
    },

    grid: {
        paddingHorizontal: ITEM_GRID_MARGIN,
        flexDirection: 'row',
        flexWrap: 'wrap',
        rowGap: ITEM_GAP,
        columnGap: ITEM_GAP,
    },
});
