import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

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

// 요청 인터셉터 - 토큰 자동 추가
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 클라이언트 사이드에서만 토큰 추가
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 응답 인터셉터 - 에러 핸들링
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // 401 에러 (인증 만료) 처리
    if (error.response?.status === 401 && originalRequest) {
      // 토큰 제거 및 로그인 페이지로 리다이렉트
      if (typeof window !== "undefined") {
        localStorage.removeItem("accessToken");
        window.location.href = "/login";
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

