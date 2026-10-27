
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';

const DEVICE_ID_KEY = 'atch_device_id';

export async function getOrCreateDeviceId(): Promise<string> {
    // 저장된 기기 ID가 있는지 확인
    const savedDeviceId =
        await SecureStore.getItemAsync(DEVICE_ID_KEY);

    if (savedDeviceId) {
        return savedDeviceId;
    }

    // 없으면 새 UUID 생성
    const newDeviceId = Crypto.randomUUID();

    // 생성한 ID 저장
    await SecureStore.setItemAsync(
        DEVICE_ID_KEY,
        newDeviceId,
    );

    return newDeviceId;
}
