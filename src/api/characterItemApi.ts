import { BASE_URL } from './config';
import { fetchWithAuth, TokenRefreshError } from './tokenRefresh';

// 카테고리
export type CharacterItemCategory =
    | 'COLOR'
    | 'BACKGROUND'
    | 'EYES'
    | 'ACCESSORY';

// 등급
export type CharacterItemGrade = 'B' | 'A' | 'S';

// 아이템 기본 정보
export interface CharacterItemInfo {
    id: number;
    name: string;
    grade: CharacterItemGrade;
    category: CharacterItemCategory;
    assetKey: string;
    assetUrl: string | null;
    active: boolean;
}

// 카탈로그 아이템
export interface CatalogItem {
    item: CharacterItemInfo;
    owned: boolean;
    equipped: boolean;
    acquiredAt: string | null;
}

// 카탈로그 응답
export interface CharacterItemCatalogResponse {
    items: CatalogItem[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    asOf: string;
}

// 상세 조회 응답
export type CharacterItemDetailResponse = CharacterItemInfo;

// 캐릭터 장착 슬롯
export interface CharacterSlot {
    category: CharacterItemCategory;
    item: CharacterItemInfo | null;
    equippedAt: string | null;
    updatedAt: string | null;
}

// 캐릭터 수집 현황
export interface CharacterCollection {
    activeItemCount: number;
    ownedActiveItemCount: number;
    allActiveItemsCollected: boolean;
}

// 현재 캐릭터 조회 응답
export interface CharacterResponse {
    slots: CharacterSlot[];
    collection: CharacterCollection;
    asOf: string;
}

// API 오류
export class CharacterItemError extends Error {
    status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = 'CharacterItemError';
        this.status = status;
    }
}

// 인증 요청 및 오류 공통 처리
async function authenticatedFetch(
    url: string,
    options: RequestInit = {},
): Promise<Response> {
    try {
        return await fetchWithAuth(url, options);
    } catch (error) {
        if (error instanceof TokenRefreshError) {
            throw new CharacterItemError(
                error.status,
                error.message,
            );
        }

        throw new CharacterItemError(
            0,
            '서버에 연결할 수 없어요. 네트워크를 확인해 주세요.',
        );
    }
}

// 공통 GET 요청
// 공통 GET 요청
async function get(path: string): Promise<any> {
    const response = await authenticatedFetch(
        `${BASE_URL}/api/v1/character/items${path}`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new CharacterItemError(
            response.status,
            errorData?.message ??
                `아이템 정보를 불러오지 못했어요. (${response.status})`,
        );
    }

    return response.json();
}

// 전체 아이템 카탈로그 조회
export async function getCharacterItemCatalog(params?: {
    category?: CharacterItemCategory;
    grade?: CharacterItemGrade;
    page?: number;
    size?: number;
}): Promise<CharacterItemCatalogResponse> {
    const query = new URLSearchParams();

    if (params?.category) query.append('category', params.category);
    if (params?.grade) query.append('grade', params.grade);

    query.append('page', String(params?.page ?? 0));
    query.append('size', String(params?.size ?? 100));

    return get(`/catalog?${query.toString()}`);
}

// 아이템 상세 조회
export async function getCharacterItemDetail(
    itemId: number,
): Promise<CharacterItemDetailResponse> {
    return get(`/${itemId}`);
}

// 현재 로그인 사용자의 캐릭터 조회
export async function getCharacter(): Promise<CharacterResponse> {
    const response = await authenticatedFetch(
        `${BASE_URL}/api/v1/character`,
        {
            method: 'GET',
            headers: {
                Accept: 'application/json',
            },
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new CharacterItemError(
            response.status,
            errorData?.message ??
                `캐릭터 정보를 불러오지 못했어요. (${response.status})`,
        );
    }

    return response.json();
}

/**
 * 캐릭터 아이템 장착
 *
 * @param category 장착 슬롯
 * @param characterItemId 보유 아이템의 item.id
 */
export async function equipCharacterItem(
    category: CharacterItemCategory,
    characterItemId: number,
): Promise<void> {
    const response = await authenticatedFetch(
        `${BASE_URL}/api/v1/character/equipment/${category}`,
        {
            method: 'PUT',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                characterItemId,
            }),
        },
    );

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new CharacterItemError(
            response.status,
            errorData?.message ??
                `아이템 장착에 실패했어요. (${response.status})`,
        );
    }
}


/**
 * 캐릭터 아이템 장착 해제
 *
 * @param category 해제할 슬롯 카테고리
 */
export async function unequipCharacterItem(
    category: CharacterItemCategory,
): Promise<void> {
    const response = await authenticatedFetch(
        `${BASE_URL}/api/v1/character/equipment/${category}`,
        {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
            },
        },
    );

    // 204는 응답 본문이 없는 정상 성공
    if (response.status === 204) {
        return;
    }

    if (!response.ok) {
        const errorData = await response.json().catch(() => null);

        throw new CharacterItemError(
            response.status,
            errorData?.message ??
                `아이템 장착 해제에 실패했어요. (${response.status})`,
        );
    }
}