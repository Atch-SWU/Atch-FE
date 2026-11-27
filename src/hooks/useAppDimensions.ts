import { Platform, useWindowDimensions } from 'react-native';
import { MAX_APP_WIDTH } from '../constants/token';

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
