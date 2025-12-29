"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { handleOAuthCallback } from "@/lib/api/auth";
import { getMyNewsletters } from "@/lib/api/newsletter";
import { userAtom } from "@/stores/auth.store";
import { useSetAtom } from "jotai";
import { toast } from "sonner";
import { useT } from "@/hooks/use-translation";

export default function GoogleCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useSetAtom(userAtom);
  const [error, setError] = useState<string | null>(null);
  const isProcessingRef = useRef(false);
  const t = useT();

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
        toast.error(`${t("auth.authFailedOAuth")}: ${errorMessage}`);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
        return;
      }

      // 필수 파라미터 확인 (code, state 검증)
      if (!code || !state) {
        setError(t("auth.missingParams"));
        toast.error(t("auth.invalidAuthInfo"));
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

        // onboarding 상태 확인
        const needsProfileSetup = !authResponse.user.username;
        
        if (needsProfileSetup) {
          toast.success(t("auth.signupSuccess"));
          router.push("/onboarding");
        } else {
          // username이 있으면 뉴스레터 확인
          try {
            const newsletters = await getMyNewsletters();
            if (newsletters.length === 0) {
              toast.success(t("auth.createNewsletterPrompt"));
              router.push("/onboarding");
            } else {
              toast.success(t("auth.loginSuccess"));
              router.push("/dashboard");
            }
          } catch (error) {
            console.error("Failed to check newsletters:", error);
            // 에러 발생 시 대시보드로 이동
            toast.success(t("auth.loginSuccess"));
            router.push("/dashboard");
          }
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : t("auth.processingError");
        setError(errorMessage);
        console.error("OAuth callback error:", err);
        toast.error(errorMessage);
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      }
    };

    processCallback();
  }, [searchParams, router, setUser, t]);

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-destructive">{t("auth.authFailed")}</h1>
          <p className="text-muted-foreground">{error}</p>
          <p className="text-sm text-muted-foreground">{t("auth.redirectingToLogin")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
        <p className="text-muted-foreground">{t("auth.processing")}</p>
      </div>
    </div>
  );
}
