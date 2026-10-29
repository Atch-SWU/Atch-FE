import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = 'atch_device_id';

export async function getOrCreateDeviceId(): Promise<string> {
    // 웹 환경: localStorage에서 기기 ID 조회
    if (Platform.OS === 'web') {
        const savedDeviceId = localStorage.getItem(DEVICE_ID_KEY);

        if (savedDeviceId) {
            return savedDeviceId;
        }

        const newDeviceId = Crypto.randomUUID();

        localStorage.setItem(DEVICE_ID_KEY, newDeviceId);

        return newDeviceId;
    }

    // 모바일 환경: SecureStore에서 기기 ID 조회
    const savedDeviceId =
        await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (savedDeviceId) {
        return savedDeviceId;
    }

    // 저장된 ID가 없으면 새 UUID 생성
    const newDeviceId = Crypto.randomUUID();

    await SecureStore.setItemAsync(
        DEVICE_ID_KEY,
        newDeviceId,
    );

    return newDeviceId;
}
