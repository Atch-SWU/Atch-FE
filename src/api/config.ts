export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL;

if (!BASE_URL) {
  throw new Error('API 서버 주소가 설정되지 않았습니다.');
}