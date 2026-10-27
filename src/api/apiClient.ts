
import { BASE_URL } from './config';
import {
  getAccessToken,
  clearTokens,
} from './tokenStorage';
import {
  refreshAccessToken,
  TokenRefreshError,
} from './tokenRefresh';

type ApiRequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  requiresAuth?: boolean;
};

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
  }
}

async function request<T>(
  path: string,
  options: ApiRequestOptions,
  retry = true,
): Promise<T> {
  const {
    method = 'GET',
    headers = {},
    body,
    requiresAuth = true,
  } = options;

  const requestHeaders: Record<string, string> = {
    ...headers,
  };

  if (body !== undefined && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  // 인증이 필요한 요청에 Access Token 추가
  if (requiresAuth) {
    const accessToken = await getAccessToken();

    if (!accessToken) {
      throw new ApiError(401, '로그인이 필요합니다.');
    }

    requestHeaders.Authorization = `Bearer ${accessToken}`;
  }

  let response: Response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: requestHeaders,
      body:
        body === undefined
          ? undefined
          : JSON.stringify(body),
    });
  } catch {
    throw new ApiError(
      0,
      '서버에 연결할 수 없습니다. 네트워크를 확인해 주세요.',
    );
  }

  // 인증이 필요한 요청에서 401 발생 시 토큰 갱신
  if (response.status === 401 && requiresAuth && retry) {
    try {
      await refreshAccessToken();

      // 갱신된 Access Token으로 원래 요청을 한 번 재시도
      return await request<T>(path, options, false);
    } catch (error) {
      if (
        error instanceof TokenRefreshError &&
        error.status === 401
      ) {
        await clearTokens();
      }

      throw error;
    }
  }

  // 응답 본문 읽기 (204 No Content도 처리)
  const responseText = await response.text();

  let data: unknown = null;

  if (responseText) {
    try {
      data = JSON.parse(responseText);
    } catch {
      data = responseText;
    }
  }

  if (!response.ok) {
    const errorData =
      typeof data === 'object' && data !== null
        ? (data as { message?: string; code?: string })
        : undefined;

    throw new ApiError(
      response.status,
      errorData?.message ?? 'API 요청에 실패했습니다.',
      errorData?.code,
    );
  }

  return data as T;
}

export const apiClient = {
  get<T>(
    path: string,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'GET',
    });
  },

  post<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'POST',
      body,
    });
  },

  put<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'PUT',
      body,
    });
  },

  patch<T>(
    path: string,
    body?: unknown,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'PATCH',
      body,
    });
  },

  delete<T>(
    path: string,
    options: Omit<ApiRequestOptions, 'method' | 'body'> = {},
  ): Promise<T> {
    return request<T>(path, {
      ...options,
      method: 'DELETE',
    });
  },
};
