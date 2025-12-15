import { apiClient } from "./client";

// API 응답 타입
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// AuthResponse 타입 정의
export interface AuthResponse {
  accessToken: string;
  tokenType: string;
  user: {
    id: string;
    email: string;
    username: string | null;
    name: string | null;
    bio: string | null;
    avatarUrl: string | null;
  };
}

// 이메일 인증 코드 발송
export async function sendVerificationCode(email: string): Promise<void> {
  await apiClient.post("/auth/send-verification-code", {
    email,
  });
}

// 이메일 인증 로그인/회원가입 (통합)
export async function emailAuth(
  email: string,
  code: string
): Promise<AuthResponse> {
  const response = await apiClient.post<ApiResponse<AuthResponse>>(
    "/auth/email-auth",
    {
      email,
      code,
    }
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Authentication failed");
  }
  return response.data.data;
}

// Username 존재 여부 확인
export async function checkUsernameAvailability(
  username: string
): Promise<boolean> {
  const response = await apiClient.get<ApiResponse<{ available: boolean }>>(
    `/auth/check-username?username=${encodeURIComponent(username)}`
  );
  return response.data.data?.available ?? false;
}

// 프로필 업데이트
export interface UpdateProfileRequest {
  username: string; // 필수
  name?: string;
  bio?: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  bio: string | null;
  avatarUrl: string | null;
}

// 현재 사용자 정보 조회
export async function getCurrentUser(): Promise<UserResponse> {
  const response = await apiClient.get<ApiResponse<UserResponse>>("/auth/me");
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to get current user");
  }
  return response.data.data;
}

export async function updateProfile(
  data: UpdateProfileRequest
): Promise<UserResponse> {
  const response = await apiClient.patch<ApiResponse<UserResponse>>(
    "/auth/me",
    data
  );
  if (!response.data.data) {
    throw new Error(response.data.message || "Failed to update profile");
  }
  return response.data.data;
}

// Google OAuth 시작
export async function startGoogleOAuth(): Promise<void> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  // 백엔드 OAuth 시작 엔드포인트로 리다이렉트
  window.location.href = `${API_BASE_URL}/api/auth/oauth/google`;
}

// OAuth 콜백 처리 (백엔드 완료 엔드포인트에서 AuthResponse 받기)
export async function handleOAuthCallback(
  code: string,
  state: string
): Promise<AuthResponse> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
  
  // 백엔드 완료 엔드포인트 호출 (인증 처리 및 AuthResponse 반환)
  const response = await fetch(
    `${API_BASE_URL}/api/auth/oauth/google/complete?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`,
    {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    const errorData = await response.json()
      .catch(() => null);
    const errorMessage = errorData?.message || "OAuth callback failed";
    throw new Error(errorMessage);
  }

  const result: ApiResponse<AuthResponse> = await response.json();
  if (!result.data) {
    throw new Error(result.message || "OAuth callback failed");
  }

  return result.data;
}

