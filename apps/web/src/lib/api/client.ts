import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { refreshAccessToken } from "./auth";
import { v4 as uuidv4 } from "uuid";

// API 기본 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// Axios 인스턴스 생성
export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000, // 10초 타임아웃
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // 쿠키 포함
});

const REQUEST_ID_HEADER = "X-Request-Id";

// 토큰 갱신 중 플래그 (무한 루프 방지)
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 클라이언트 사이드에서만 토큰 추가
    if (typeof window !== "undefined") {
      if (!config.headers?.[REQUEST_ID_HEADER]) {
        config.headers[REQUEST_ID_HEADER] = uuidv4();
      }

      const token = localStorage.getItem("accessToken");
      if (token) {
        // 토큰 앞뒤 공백 제거
        const cleanToken = token.trim();
        if (cleanToken && config.headers) {
          config.headers.Authorization = `Bearer ${cleanToken}`;
        }
      }

      // FormData인 경우 Content-Type을 제거하여 브라우저가 자동으로 boundary를 추가하도록 함
      if (config.data instanceof FormData) {
        delete config.headers?.["Content-Type"];
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 핸들링 및 토큰 갱신
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // 401 에러 (인증 만료) 처리
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        // 이미 갱신 중이면 대기열에 추가
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers && token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token available");
        }

        // RefreshToken으로 새로운 AccessToken 발급
        const authResponse = await refreshAccessToken(refreshToken);

        // 새로운 토큰 저장
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", authResponse.accessToken);
          localStorage.setItem("refreshToken", authResponse.refreshToken);
        }

        // 대기 중인 요청들 처리
        processQueue(null, authResponse.accessToken);

        // 원래 요청 재시도
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${authResponse.accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        // RefreshToken 갱신 실패 시 로그아웃 처리
        processQueue(refreshError as Error, null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("accessToken");
          localStorage.removeItem("refreshToken");
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

// API 에러 타입
export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// API 에러 추출 헬퍼
export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const apiError = error.response?.data as ApiError | undefined;
    return apiError?.message || error.message || "알 수 없는 오류가 발생했습니다.";
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "알 수 없는 오류가 발생했습니다.";
}

