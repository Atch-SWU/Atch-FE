import { Platform, useWindowDimensions } from 'react-native';
import { MAX_APP_WIDTH } from '../constants/token';

/**
 * useWindowDimensions()의 대체용 훅.
 *
 * 네이티브(iOS/Android)에서는 화면 폭 = 앱 폭이라 문제가 없지만,
 * 웹(Vercel 등)에서는 App.tsx가 데스크톱 브라우저에서도 모바일처럼 보이도록
 * 앱을 maxWidth: MAX_APP_WIDTH 짜리 프레임 안에 가둬놓는다.
 * 이때 useWindowDimensions()는 그 프레임이 아니라 "브라우저 창" 전체 폭(예: 1920)을
 * 그대로 반환하기 때문에, 이 값으로 이미지/카드/그리드 크기를 계산하는 화면들이
 * 실제 렌더링되는 430px 프레임보다 훨씬 크게 계산되어 이미지가 거대해지는 문제가 생긴다.
 *
 * 웹에서는 브라우저 폭을 MAX_APP_WIDTH로 clamp해서, 실제 화면에 렌더링되는
 * 프레임 폭과 항상 일치하도록 보정한다. 네이티브에서는 그대로 통과.
 */
export default function useAppDimensions() {
    const window = useWindowDimensions();

    if (Platform.OS !== 'web') {
        return window;
    }

    return {
        ...window,
        width: Math.min(window.width, MAX_APP_WIDTH),
    };
}
