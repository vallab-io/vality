/**
 * 공통 API 응답 타입
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

