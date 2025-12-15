"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleOAuthCallback } from "@/lib/api/auth";
import { userAtom } from "@/stores/auth.store";
import { useSetAtom } from "jotai";
import { toast } from "sonner";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useSetAtom(userAtom);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    // StrictMode 이중 호출/중복 실행 방지
    if (isProcessingRef.current) return;

    const processCallback = async () => {
      isProcessingRef.current = true;

      const code = searchParams.get("code");
      const state = searchParams.get("state");
      const errorParam = searchParams.get("error");
      const errorDescription = searchParams.get("error_description");

      // OAuth 에러 처리
      if (errorParam) {
        const errorMessage = errorDescription || errorParam;
        setError(errorMessage);
        toast.error(`OAuth 인증 실패: ${errorMessage}`);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      // 필수 파라미터 확인 (code, state 검증)
      if (!code || !state) {
        setError("필수 파라미터가 누락되었습니다.");
        toast.error("인증 정보가 올바르지 않습니다.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      try {
        // 백엔드 complete API 호출하여 state, code 검증 및 회원가입/로그인 처리
        const authResponse = await handleOAuthCallback(code, state);

        // 토큰과 사용자 정보 저장
        if (typeof window !== "undefined") {
          localStorage.setItem("accessToken", authResponse.accessToken);
          localStorage.setItem("refreshToken", authResponse.refreshToken);
        }
        setUser(authResponse.user);

        toast.success("로그인 성공!");
        
        // 대시보드로 리다이렉트
        router.push("/dashboard");
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "인증 처리 중 오류가 발생했습니다.";
        setError(errorMessage);
        console.error("OAuth callback error:", err);
        toast.error(errorMessage);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    processCallback();
  }, [searchParams, router, setUser]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">인증 실패</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">로그인 페이지로 이동합니다...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">인증 처리 중...</p>
      </div>
    </div>
  );
}

