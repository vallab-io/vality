import { apiClient } from "./client";

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
    const errorText = await response.text();
    throw new Error(errorText || "OAuth callback failed");
  }

  return response.json();
}

